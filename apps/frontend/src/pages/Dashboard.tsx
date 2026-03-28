import { useState, useMemo, useEffect, useRef } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel,
  flexRender, type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import {
  RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, Search, X, ChevronRight,
  FileText, TrendingUp, DollarSign, CheckCircle, Upload, Trash2, Loader2,
  CreditCard, Download, Banknote,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonTable } from "@/components/SkeletonTable";
import { MetricCard } from "@/components/MetricCard";
import { EmptyState } from "@/components/EmptyState";
import { useSheetData } from "@/hooks/use-sheet-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SwarmViz, parseSwarmFromAudit } from "@/components/SwarmViz";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn, formatIndianCurrency } from "@/lib/utils";
import { getApiBaseUrl } from "@/lib/config";

type InvoiceRow = Record<string, string>;

const FAST_INTERVAL = 3000;
const FAST_DURATION_MS = 60000;

function riskBadge(level: string) {
  switch (level?.toUpperCase()) {
    case "LOW": return "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200";
    case "MEDIUM": return "text-amber-700 bg-amber-50 ring-1 ring-amber-200";
    case "HIGH": return "text-red-700 bg-red-50 ring-1 ring-red-200";
    default: return "text-muted-foreground";
  }
}

function ConfidenceBar({ value }: { value: string }) {
  const num = parseFloat(value);
  if (isNaN(num)) return <span className="text-muted-foreground">—</span>;
  const pct = Math.round(num * 100);
  const color = num >= 0.8 ? "bg-emerald-500" : num >= 0.6 ? "bg-amber-500" : "bg-red-500";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 cursor-help">
          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
            <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-mono-data tabular-nums">{pct}%</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">OCR extraction confidence: {pct}%</p>
      </TooltipContent>
    </Tooltip>
  );
}

/* ---------- Currency / FX Info ---------- */
function CurrencyInfo({ invoice, swarmData }: { invoice: InvoiceRow; swarmData: any }) {
  const currency = invoice.currency || "INR";
  const amount = parseFloat(invoice.amount || "0");
  const currencyRisk = swarmData?.currency_risk || {};
  const fxRate = currencyRisk.fx_rate;
  const inrAmount = currencyRisk.inr_amount;
  const isDomestic = currency === "INR";

  return (
    <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <Banknote className="h-4 w-4" />
        Currency Information
      </h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Original Currency</p>
          <p className="font-mono-data font-semibold">
            {currency} {formatIndianCurrency(amount)}
          </p>
        </div>
        {!isDomestic && fxRate && (
          <>
            <div>
              <p className="text-muted-foreground">Live FX Rate</p>
              <p className="font-mono-data">1 {currency} = ₹{Number(fxRate).toFixed(2)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">INR Equivalent</p>
              <p className="font-mono-data font-semibold text-lg">
                ₹{formatIndianCurrency(inrAmount || amount)}
              </p>
            </div>
            <div className="col-span-2">
              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                <TrendingUp className="h-3 w-3" />
                <span>FX Rate Source: {currencyRisk.rate_source || "Live API"}</span>
              </div>
            </div>
          </>
        )}
        {isDomestic && (
          <div className="col-span-2 text-xs text-muted-foreground">
            Domestic transaction — no currency conversion needed
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================ */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fastMode, setFastMode] = useState(false);
  const fastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------- fast-refresh on new invoice ---------- */
  useEffect(() => {
    const handler = () => {
      setFastMode(true);
      toast({ title: "New Invoice Detected", description: "Dashboard will auto-refresh for 60 seconds" });
      if (fastTimer.current) clearTimeout(fastTimer.current);
      fastTimer.current = setTimeout(() => setFastMode(false), FAST_DURATION_MS);
    };
    window.addEventListener("invoice-submitted", handler);
    return () => window.removeEventListener("invoice-submitted", handler);
  }, [toast]);

  const { data: rawData, isFetching, isLoading, refresh } = useSheetData("invoices");
  const { data: auditData } = useSheetData<Record<string, string>>("audit_ledger");

  useEffect(() => {
    if (!fastMode) return;
    const id = setInterval(() => refresh(), FAST_INTERVAL);
    return () => clearInterval(id);
  }, [fastMode, refresh]);

  const data = rawData as InvoiceRow[];
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selected, setSelected] = useState<InvoiceRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  /* ---------- Filters ---------- */
  const [filters, setFilters] = useState({ riskLevel: "all", currency: "all", status: "all", searchTerm: "" });

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (filters.riskLevel !== "all" && row.risk_level?.toUpperCase() !== filters.riskLevel.toUpperCase()) return false;
      if (filters.currency !== "all" && (row.currency || "INR") !== filters.currency) return false;
      if (filters.status !== "all" && row.status?.toUpperCase() !== filters.status.toUpperCase()) return false;
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        return (
          row.invoice_id?.toLowerCase().includes(term) ||
          row.vendor_name?.toLowerCase().includes(term) ||
          row.trace_id?.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [data, filters]);

  /* ---------- Metrics ---------- */
  const totalInvoices = data.length;
  const totalSpend = useMemo(() => data.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0), [data]);
  const avgConfidence = useMemo(() => {
    const vals = data.map((r) => parseFloat(r.confidence)).filter((v) => !isNaN(v));
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }, [data]);
  const autoApproved = useMemo(() => data.filter((r) => r.status?.toUpperCase() === "PARSED_READY").length, [data]);

  /* ---------- Swarm data for selected invoice ---------- */
  const selectedSwarm = useMemo(() => {
    if (!selected?.trace_id) return null;
    const rows = (auditData as Record<string, string>[]) || [];
    const swarmRow = rows.find(
      (r) => r.trace_id === selected.trace_id &&
        (r.agent === "SwarmConsensusEngine" || r.agent_name === "SwarmConsensusEngine")
    );
    if (!swarmRow) return null;
    return parseSwarmFromAudit(swarmRow.input_snapshot || "", swarmRow.output_snapshot || "");
  }, [selected, auditData]);

  /* ---------- Delete handler ---------- */
  const handleDelete = async (invoice: InvoiceRow) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete invoice ${invoice.invoice_id}?\n\nThis action cannot be undone.`
    );
    if (!confirmDelete) return;
    setDeletingId(invoice.invoice_id);
    try {
      const res = await fetch(`${getApiBaseUrl()}/webhook/delete-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_id: invoice.invoice_id, trace_id: invoice.trace_id }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ reason: "Failed to delete invoice" }));
        throw new Error(error.reason || "Failed to delete invoice");
      }
      toast({ title: "Invoice Deleted", description: `Successfully deleted invoice ${invoice.invoice_id}` });
      refresh();
      setSelected(null);
    } catch (error: any) {
      toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------- Payment handler ---------- */
  const handleProcessPayment = async (invoice: InvoiceRow) => {
    setProcessingPayment(invoice.invoice_id);
    try {
      const res = await fetch(`${getApiBaseUrl()}/webhook/mock-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_id: invoice.invoice_id, trace_id: invoice.trace_id,
          amount: invoice.amount, currency: invoice.currency || "INR",
          vendor_name: invoice.vendor_name, po_reference: invoice.po_reference,
        }),
      });
      if (!res.ok) throw new Error("Payment processing failed");
      const result = await res.json();
      toast({ title: "Payment Initiated", description: `Payment reference: ${result.payment_reference || "N/A"}` });
      setTimeout(() => refresh(), 2000);
    } catch (error: any) {
      toast({ title: "Payment Failed", description: error.message, variant: "destructive" });
    } finally {
      setProcessingPayment(null);
    }
  };

  /* ---------- CSV Export ---------- */
  const exportToCSV = () => {
    const headers = ["Invoice ID", "Vendor", "Amount", "Currency", "Risk Level", "Status", "Confidence", "Trace ID"];
    const rows = filteredData.map((row) => [
      row.invoice_id || "", row.vendor_name || "", row.amount || "",
      row.currency || "INR", row.risk_level || "", row.status || "",
      row.confidence || "", row.trace_id || "",
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `autoflow-invoices-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast({ title: "Export Complete", description: `Exported ${filteredData.length} invoices to CSV` });
  };

  /* ---------- Keyboard shortcuts ---------- */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "/") { e.preventDefault(); (document.querySelector('input[placeholder*="Search"]') as HTMLInputElement)?.focus(); }
      if (e.key === "n" || e.key === "N") navigate("/upload");
      if (e.key === "r" || e.key === "R") { e.preventDefault(); refresh(); toast({ title: "Refreshing…", description: "Fetching latest invoice data" }); }
      if (e.key === "Escape" && selected) setSelected(null);
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigate, refresh, selected, toast]);

  /* ---------- Table columns ---------- */
  const columns = useMemo<ColumnDef<InvoiceRow>[]>(() => [
    { accessorKey: "invoice_id", header: "Invoice ID", cell: (i) => <span className="font-mono-data text-xs">{(i.getValue() as string) || "—"}</span> },
    { accessorKey: "vendor_name", header: "Vendor" },
    {
      accessorKey: "amount", header: "Amount",
      cell: (i) => { const v = parseFloat(i.getValue() as string); return <span className="font-mono-data tabular-nums">{isNaN(v) ? "—" : `₹${formatIndianCurrency(v)}`}</span>; },
    },
    { accessorKey: "currency", header: "CCY", cell: (i) => <span className="font-mono-data text-xs">{(i.getValue() as string) || "—"}</span> },
    { accessorKey: "invoice_date", header: "Date", cell: (i) => <span className="text-xs">{(i.getValue() as string) || "—"}</span> },
    { accessorKey: "status", header: "Status", cell: (i) => <StatusBadge status={i.getValue() as string} /> },
    { accessorKey: "confidence", header: "Confidence", cell: (i) => <ConfidenceBar value={i.getValue() as string} /> },
    { accessorKey: "risk_level", header: "Risk", cell: (i) => { const v = (i.getValue() as string) || ""; return v ? <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", riskBadge(v))}>{v}</span> : <span className="text-muted-foreground">—</span>; } },
    { id: "expand", header: "", cell: () => <ChevronRight className="w-4 h-4 text-muted-foreground" />, size: 30 },
  ], []);

  const table = useReactTable({
    data: filteredData, columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <PageContainer>
      <PageHeader
        title="Pipeline Monitor"
        subtitle="Real-time invoice processing overview"
        stepLabel="Dashboard"
        action={
          <div className="flex items-center gap-2">
            {fastMode && <span className="text-xs text-emerald-600 animate-pulse">● Live refresh</span>}
            <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => refresh()} disabled={isFetching} className="gap-2">
              <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} /> Refresh
            </Button>
          </div>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total Invoices" value={totalInvoices} icon={<FileText className="w-5 h-5" />} variant="blue" delay={0} subtitle="All time" />
        <MetricCard title="Total Spend" value={totalSpend} icon={<DollarSign className="w-5 h-5" />} variant="green" delay={80} subtitle="Sum of amounts" format="currency" />
        <MetricCard title="Avg Confidence" value={avgConfidence} icon={<TrendingUp className="w-5 h-5" />} variant="amber" delay={160} subtitle="Extraction quality" format="percent" />
        <MetricCard title="Auto Approved" value={autoApproved} icon={<CheckCircle className="w-5 h-5" />} variant="green" delay={240} subtitle="PARSED_READY status" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Select value={filters.riskLevel} onValueChange={(val) => setFilters((f) => ({ ...f, riskLevel: val }))}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Risk Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk Levels</SelectItem>
            <SelectItem value="LOW">Low Risk</SelectItem>
            <SelectItem value="MEDIUM">Medium Risk</SelectItem>
            <SelectItem value="HIGH">High Risk</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.currency} onValueChange={(val) => setFilters((f) => ({ ...f, currency: val }))}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Currency" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Currencies</SelectItem>
            <SelectItem value="INR">INR</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="EUR">EUR</SelectItem>
            <SelectItem value="GBP">GBP</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(val) => setFilters((f) => ({ ...f, status: val }))}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PARSED_READY">Ready</SelectItem>
            <SelectItem value="NEEDS_REVIEW">Needs Review</SelectItem>
            <SelectItem value="BLOCKED">Blocked</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoice ID, vendor, trace ID…"
            value={filters.searchTerm}
            onChange={(e) => setFilters((f) => ({ ...f, searchTerm: e.target.value }))}
            className="pl-9"
          />
          {filters.searchTerm && (
            <Button variant="ghost" size="sm" onClick={() => setFilters((f) => ({ ...f, searchTerm: "" }))} className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Button variant="outline" onClick={() => setFilters({ riskLevel: "all", currency: "all", status: "all", searchTerm: "" })}>
          Clear Filters
        </Button>
      </div>

      {/* Row count + keyboard hints */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of {data.length} rows
        </span>
        <div className="text-xs text-muted-foreground flex gap-4">
          <span><kbd className="px-1 py-0.5 rounded bg-muted">/</kbd> Search</span>
          <span><kbd className="px-1 py-0.5 rounded bg-muted">N</kbd> New Upload</span>
          <span><kbd className="px-1 py-0.5 rounded bg-muted">R</kbd> Refresh</span>
        </div>
      </div>

      {isLoading ? <SkeletonTable /> : data.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-10 h-10" />}
          title="No invoices yet"
          description="Upload your first invoice to start processing. The pipeline will extract, validate, and assess risk automatically."
          action={
            <Button size="sm" onClick={() => navigate("/upload")} className="gap-2">
              <Upload className="w-4 h-4" /> Upload Invoice
            </Button>
          }
        />
      ) : (
        <div className="w-full overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-border bg-muted/30">
                  {hg.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground cursor-pointer select-none" onClick={header.column.getToggleSortingHandler()}>
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (header.column.getIsSorted() === "asc" ? <ArrowUp className="w-3 h-3" /> : header.column.getIsSorted() === "desc" ? <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />)}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">No invoices match your search</td></tr>
              ) : table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border table-row-hover cursor-pointer" onClick={() => setSelected(row.original)}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Drill-Down Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.invoice_id || "Invoice Detail"}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Vendor", selected.vendor_name],
                  ["Amount", `₹${formatIndianCurrency(selected.amount || "0")} ${selected.currency || ""}`],
                  ["Status", selected.status],
                  ["Risk", selected.risk_level],
                  ["Date", selected.invoice_date],
                  ["Confidence", selected.confidence ? `${Math.round(parseFloat(selected.confidence) * 100)}%` : undefined],
                ].map(([k, v]) => v ? (
                  <div key={k as string} className="p-3 rounded-lg bg-muted/50">
                    <span className="text-xs text-muted-foreground block">{k}</span>
                    <span className="text-sm font-medium">{v}</span>
                  </div>
                ) : null)}
              </div>

              {/* FX / Currency Info */}
              {selectedSwarm && <CurrencyInfo invoice={selected} swarmData={selectedSwarm} />}

              {selected.status && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Decision:</span>
                  <StatusBadge status={selected.status} />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-muted-foreground cursor-help ml-1">ⓘ</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">This decision was made by the Swarm Consensus Engine based on weighted votes from 3 independent AI agents.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              {selectedSwarm && <SwarmViz {...selectedSwarm} />}
              {!selectedSwarm && (
                <div className="text-center py-4 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                  No swarm data available for this invoice.
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-2 border-t border-border">
                {/* Payment button */}
                {(selected.status === "PARSED_READY" || selected.policy_decision === "ALLOW") && (
                  <Button
                    onClick={() => handleProcessPayment(selected)}
                    disabled={processingPayment === selected.invoice_id}
                    className="flex-1"
                  >
                    {processingPayment === selected.invoice_id ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing Payment…</>
                    ) : (
                      <><CreditCard className="h-4 w-4 mr-2" /> Process Payment</>
                    )}
                  </Button>
                )}

                {/* Delete button */}
                {selected.status?.toUpperCase() !== "PAYMENT_PROCESSING" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(selected)}
                    disabled={deletingId === selected.invoice_id}
                  >
                    {deletingId === selected.invoice_id ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting…</>
                    ) : (
                      <><Trash2 className="h-4 w-4 mr-2" /> Delete Invoice</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
