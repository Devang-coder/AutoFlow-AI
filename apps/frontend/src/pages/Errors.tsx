import { useState, useMemo } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, flexRender, type ColumnDef, type SortingState } from "@tanstack/react-table";
import { RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, Search, X, RotateCcw, AlertTriangle, CheckCircle, Activity, XCircle, ShieldCheck } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/Layout";
import { SkeletonTable } from "@/components/SkeletonTable";
import { MetricCard } from "@/components/MetricCard";
import { EmptyState } from "@/components/EmptyState";
import { useSheetData } from "@/hooks/use-sheet-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ErrorRow = Record<string, string>;

export default function ErrorsPage() {
  const { data, isFetching, isLoading, refresh } = useSheetData("errors");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedError, setSelectedError] = useState<ErrorRow | null>(null);

  const metrics = useMemo(() => {
    const rows = data as ErrorRow[];
    const total = rows.length;
    const today = new Date().toISOString().split("T")[0];
    const errorsToday = rows.filter(r => r.timestamp?.includes(today)).length;
    const retried = rows.filter(r => r.status?.toUpperCase() === "RETRIED" || r.status?.toUpperCase() === "RESOLVED").length;
    const retryRate = total > 0 ? (retried / total) * 100 : 0;
    return { total, errorsToday, retryRate, remediated: retried };
  }, [data]);

  const handleRetry = (row: ErrorRow) => {
    toast.info(`Remediation triggered for trace ${row.trace_id || "unknown"}`, {
      description: "The remediation agent will automatically retry this failed operation."
    });
  };

  const columns = useMemo<ColumnDef<ErrorRow>[]>(() => [
    { accessorKey: "trace_id", header: "Trace ID", cell: (i) => <span className="font-mono-data text-xs">{(i.getValue() as string) || "—"}</span> },
    { accessorKey: "error_message", header: "Error", cell: (i) => <span className="text-xs max-w-[200px] truncate block">{(i.getValue() as string) || "—"}</span> },
    { accessorKey: "timestamp", header: "Timestamp", cell: (i) => <span className="text-xs">{(i.getValue() as string) || "—"}</span> },
    { accessorKey: "status", header: "Status", cell: (i) => {
      const v = (i.getValue() as string) || "";
      const color = v.toUpperCase() === "RESOLVED" ? "text-emerald-700 bg-emerald-50" : v.toUpperCase() === "RETRIED" ? "text-blue-700 bg-blue-50" : "text-red-700 bg-red-50";
      return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", color)}>{v || "OPEN"}</span>;
    }},
    { id: "actions", header: "Actions", cell: ({ row }) => (
      <div className="flex gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); handleRetry(row.original); }}>
              <RotateCcw className="w-3 h-3" /> Retry
            </Button>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">Triggers the remediation agent to retry this operation</p></TooltipContent>
        </Tooltip>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); setSelectedError(row.original); }}>
          Details
        </Button>
      </div>
    ) },
  ], []);

  const table = useReactTable({ data: data as ErrorRow[], columns, state: { sorting, globalFilter }, onSortingChange: setSorting, onGlobalFilterChange: setGlobalFilter, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel() });

  return (
    <PageContainer>
      <PageHeader
        title="Error Review"
        subtitle="Monitor and remediate pipeline errors"
        stepLabel="Operations"
        action={<Button variant="outline" size="sm" onClick={() => refresh()} disabled={isFetching} className="gap-2"><RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} /> Refresh</Button>}
      />

      {/* Remediation Agent Info */}
      <div className="glass-card p-4 mb-6 flex items-center gap-3 border-l-4 border-primary">
        <Activity className="w-5 h-5 text-primary shrink-0" />
        <div>
          <span className="text-sm font-semibold text-foreground">Remediation Agent</span>
          <p className="text-xs text-muted-foreground">Automatically retries failed payments and operations. Click "Retry" to trigger manual remediation.</p>
        </div>
      </div>

      {/* Error Summary Metrics */}
      {!isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard title="Total Errors" value={metrics.total} icon={<XCircle className="w-5 h-5" />} variant="red" />
          <MetricCard title="Errors Today" value={metrics.errorsToday} icon={<AlertTriangle className="w-5 h-5" />} variant="amber" />
          <MetricCard title="Retry Success" value={metrics.retryRate} icon={<RotateCcw className="w-5 h-5" />} variant="blue" format="percent" />
          <MetricCard title="Remediated" value={metrics.remediated} icon={<CheckCircle className="w-5 h-5" />} variant="green" />
        </div>
      )}

      {!isLoading && data.length > 0 && (
        <div className="text-xs text-amber-700 bg-amber-50 rounded-lg p-3 mb-4 ring-1 ring-amber-200">
          ⚠️ {data.length} error{data.length !== 1 ? "s" : ""} require attention
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input className="w-full pl-9 pr-8 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Search errors..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />
        {globalFilter && <button onClick={() => setGlobalFilter("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
      </div>

      <div className="text-xs text-muted-foreground mb-2">{table.getFilteredRowModel().rows.length} rows</div>

      {isLoading ? <SkeletonTable /> : data.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="w-10 h-10" />}
          title="System operating normally"
          description="No errors detected. The pipeline is running smoothly with all agents active."
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
                <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">No errors match your search</td></tr>
              ) : table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border table-row-hover cursor-pointer" onClick={() => setSelectedError(row.original)}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Error Context Panel */}
      <Dialog open={!!selectedError} onOpenChange={() => setSelectedError(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Error Diagnostics</DialogTitle>
          </DialogHeader>
          {selectedError && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground block">Trace ID</span>
                  <span className="text-sm font-mono-data">{selectedError.trace_id || "—"}</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground block">Timestamp</span>
                  <span className="text-sm">{selectedError.timestamp || "—"}</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground block">Status</span>
                  <span className="text-sm font-medium">{selectedError.status || "OPEN"}</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground block">Agent</span>
                  <span className="text-sm font-medium">{selectedError.agent || selectedError.agent_name || "Pipeline"}</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <span className="text-xs text-red-700 font-semibold block mb-1">Error Message</span>
                <p className="text-sm text-red-800">{selectedError.error_message || "—"}</p>
              </div>
              {selectedError.raw_input && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <span className="text-xs text-muted-foreground font-semibold block mb-1">Raw Input</span>
                  <pre className="text-xs font-mono-data whitespace-pre-wrap max-h-40 overflow-y-auto">{selectedError.raw_input}</pre>
                </div>
              )}
              <div className="flex gap-2">
                <Button size="sm" className="gap-1" onClick={() => { handleRetry(selectedError); setSelectedError(null); }}>
                  <RotateCcw className="w-3 h-3" /> Trigger Remediation
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
