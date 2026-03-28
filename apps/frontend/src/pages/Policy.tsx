import { useState, useMemo, useEffect } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, flexRender, type ColumnDef, type SortingState } from "@tanstack/react-table";
import { RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, Search, X, AlertCircle, ClipboardList, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonTable } from "@/components/SkeletonTable";
import { EmptyState } from "@/components/EmptyState";
import { useSheetData } from "@/hooks/use-sheet-data";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type PolicyRow = Record<string, string>;

function RiskBar({ score }: { score: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);
  const pct = Math.max(0, Math.min(1, score)) * 100;
  const color = score < 0.3 ? "bg-emerald-500" : score < 0.7 ? "bg-amber-500" : "bg-red-500";
  const label = score < 0.3 ? "LOW" : score < 0.7 ? "MED" : "HIGH";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 cursor-help">
          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
            <div className={cn("h-full rounded-full risk-bar-transition", color)} style={{ width: mounted ? `${pct}%` : "0%" }} />
          </div>
          <span className="text-xs font-mono-data">{score.toFixed(2)} <span className="text-muted-foreground">{label}</span></span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">Risk score {(pct).toFixed(0)}% — {label} risk level</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function PolicyPage() {
  const navigate = useNavigate();
  const { data, isFetching, isLoading, refresh } = useSheetData("policy_decisions");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<PolicyRow>[]>(() => [
    { accessorKey: "trace_id", header: "Trace ID", cell: (i) => <span className="font-mono-data text-xs">{(i.getValue() as string) || "—"}</span> },
    { accessorKey: "invoice_id", header: "Invoice ID", cell: (i) => <span className="font-mono-data text-xs">{(i.getValue() as string) || "—"}</span> },
    { accessorKey: "vendor_name", header: "Vendor" },
    { accessorKey: "amount", header: "Amount", cell: (i) => { const val = parseFloat(i.getValue() as string); return <span className="font-mono-data tabular-nums">{isNaN(val) ? "—" : val.toLocaleString()}</span>; } },
    { accessorKey: "currency", header: "CCY", cell: (i) => <span className="font-mono-data text-xs">{(i.getValue() as string) || "—"}</span> },
    { accessorKey: "decision", header: "Decision", cell: (i) => <StatusBadge status={i.getValue() as string} /> },
    { accessorKey: "risk_score", header: "Risk Score", cell: (i) => { const val = parseFloat(i.getValue() as string); return isNaN(val) ? <span className="text-muted-foreground">—</span> : <RiskBar score={val} />; } },
    { accessorKey: "reason_codes", header: "Reason", cell: (i) => <span className="text-xs max-w-[150px] truncate block">{(i.getValue() as string) || "—"}</span> },
    { accessorKey: "auto_approved", header: "Auto-Approved", cell: (i) => (i.getValue() as string)?.toLowerCase() === "true" ? <span className="text-emerald-600 font-medium text-xs">Yes</span> : <span className="text-muted-foreground text-xs">No</span> },
  ], []);

  const table = useReactTable({ data: data as PolicyRow[], columns, state: { sorting, globalFilter }, onSortingChange: setSorting, onGlobalFilterChange: setGlobalFilter, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel() });

  return (
    <PageContainer>
      <PageHeader
        title="Policy Decisions"
        subtitle="AI-driven compliance and risk assessment results"
        stepLabel="Governance"
        action={<Button variant="outline" size="sm" onClick={() => refresh()} disabled={isFetching} className="gap-2"><RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} /> Refresh</Button>}
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input className="w-full pl-9 pr-8 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Search decisions..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />
        {globalFilter && <button onClick={() => setGlobalFilter("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
      </div>

      <div className="text-xs text-muted-foreground mb-2">{table.getFilteredRowModel().rows.length} of {data.length} rows</div>

      {isLoading ? <SkeletonTable /> : data.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-10 h-10" />}
          title="No decisions yet"
          description="Policy decisions will appear here after invoices are processed through the AI pipeline."
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
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground cursor-pointer select-none" onClick={h.column.getToggleSortingHandler()}>
                      <div className="flex items-center gap-1">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getCanSort() && (h.column.getIsSorted() === "asc" ? <ArrowUp className="w-3 h-3" /> : h.column.getIsSorted() === "desc" ? <ArrowDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3 opacity-40" />)}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">No decisions match your search</td></tr>
              ) : table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border table-row-hover">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}
