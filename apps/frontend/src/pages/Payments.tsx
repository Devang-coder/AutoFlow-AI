import { useState, useMemo } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, flexRender, type ColumnDef, type SortingState } from "@tanstack/react-table";
import { RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, Search, X, CreditCard, CheckCircle, DollarSign, BadgeCheck } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonTable, SkeletonCard } from "@/components/SkeletonTable";
import { EmptyState } from "@/components/EmptyState";
import { useSheetData } from "@/hooks/use-sheet-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaymentRow = Record<string, string>;

export default function PaymentsPage() {
  const { data, isFetching, isLoading, refresh } = useSheetData("payment_ledger");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const stats = useMemo(() => {
    const rows = data as PaymentRow[];
    const total = rows.length;
    const success = rows.filter((r) => r.status?.toUpperCase() === "PAYMENT_SUCCESS").length;
    const successRate = total > 0 ? (success / total) * 100 : 0;
    const totalAmount = rows.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
    const verified = rows.filter((r) => r.verified?.toLowerCase() === "true").length;
    return { total, successRate, totalAmount, verified };
  }, [data]);

  const columns = useMemo<ColumnDef<PaymentRow>[]>(() => [
    { accessorKey: "trace_id", header: "Trace ID", cell: (i) => <span className="font-mono-data text-xs">{(i.getValue() as string) || "—"}</span> },
    { accessorKey: "invoice_id", header: "Invoice ID", cell: (i) => <span className="font-mono-data text-xs">{(i.getValue() as string) || "—"}</span> },
    { accessorKey: "vendor_name", header: "Vendor" },
    { accessorKey: "amount", header: "Amount", cell: (i) => { const v = parseFloat(i.getValue() as string); return <span className="font-mono-data tabular-nums">{isNaN(v) ? "—" : v.toLocaleString()}</span>; } },
    { accessorKey: "currency", header: "CCY", cell: (i) => <span className="font-mono-data text-xs">{(i.getValue() as string) || "—"}</span> },
    { accessorKey: "status", header: "Status", cell: (i) => <StatusBadge status={i.getValue() as string} /> },
    { accessorKey: "verified", header: "Verified", cell: (i) => (i.getValue() as string)?.toLowerCase() === "true" ? <span className="text-emerald-600 font-medium text-xs">✓ Yes</span> : <span className="text-muted-foreground text-xs">No</span> },
    { accessorKey: "timestamp", header: "Timestamp", cell: (i) => <span className="text-xs">{(i.getValue() as string) || "—"}</span> },
  ], []);

  const table = useReactTable({ data: data as PaymentRow[], columns, state: { sorting, globalFilter }, onSortingChange: setSorting, onGlobalFilterChange: setGlobalFilter, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel() });

  return (
    <PageContainer>
      <PageHeader
        title="Payments"
        subtitle="Payment execution ledger and verification status"
        stepLabel="Finance"
        action={<Button variant="outline" size="sm" onClick={() => refresh()} disabled={isFetching} className="gap-2"><RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} /> Refresh</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <MetricCard title="Total Payments" value={stats.total} icon={<CreditCard className="w-5 h-5" />} variant="blue" delay={0} />
            <MetricCard title="Success Rate" value={stats.successRate / 100} icon={<CheckCircle className="w-5 h-5" />} variant="green" delay={80} format="percent" />
            <MetricCard title="Total Amount" value={stats.totalAmount} icon={<DollarSign className="w-5 h-5" />} variant="amber" delay={160} format="currency" />
            <MetricCard title="Verified" value={stats.verified} icon={<BadgeCheck className="w-5 h-5" />} variant="green" delay={240} />
          </>
        )}
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input className="w-full pl-9 pr-8 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Search payments..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />
        {globalFilter && <button onClick={() => setGlobalFilter("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
      </div>

      <div className="text-xs text-muted-foreground mb-2">{table.getFilteredRowModel().rows.length} rows</div>

      {isLoading ? <SkeletonTable /> : data.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-10 h-10" />}
          title="No payments yet"
          description="Payments will appear here after invoices are approved and processed through the pipeline."
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
                <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">No payments match your search</td></tr>
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
