import { useSheetData } from "@/hooks/use-sheet-data";
import { cn } from "@/lib/utils";
import { Activity, CheckCircle, Loader2, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function SystemStatusBanner() {
  const { data: invoices, isFetching } = useSheetData("invoices");
  const { data: errors } = useSheetData("errors");

  const processing = (invoices as Record<string, string>[]).filter(
    (r) => r.status?.toUpperCase() === "PROCESSING" || r.status?.toUpperCase() === "OCR_RUNNING"
  );

  const hasErrors = (errors as Record<string, string>[]).filter(
    (r) => r.status?.toUpperCase() !== "RESOLVED" && r.status?.toUpperCase() !== "RETRIED"
  );

  // ✅ FIX: rename for correctness
  const configuredSwarmAgents = 3;

  // ✅ FIX: proper label
  const activeAgentsLabel = `${configuredSwarmAgents} swarm agents configured`;

  const isHealthy = hasErrors.length === 0 && processing.length === 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2 text-xs border-b",
        isHealthy
          ? "bg-emerald-50/50 border-emerald-100 text-emerald-700"
          : processing.length > 0
          ? "bg-blue-50/50 border-blue-100 text-blue-700"
          : "bg-amber-50/50 border-amber-100 text-amber-700"
      )}
    >
      <div className="flex items-center gap-1.5">
        {isHealthy ? (
          <CheckCircle className="w-3.5 h-3.5" />
        ) : processing.length > 0 ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Activity className="w-3.5 h-3.5" />
        )}

        <span className="font-medium">
          {isHealthy
            ? "System Operational"
            : processing.length > 0
            ? `Processing ${processing.length} invoice${processing.length > 1 ? "s" : ""}`
            : `${hasErrors.length} error${hasErrors.length > 1 ? "s" : ""} require${hasErrors.length === 1 ? "s" : ""} attention`}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center gap-1 cursor-help">
              <Activity className="w-3 h-3" />
              {/* ✅ FIXED LABEL */}
              {activeAgentsLabel}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              Anomaly Detection, Currency Risk, and Vendor Trust agents are configured in the swarm consensus engine.
            </p>
          </TooltipContent>
        </Tooltip>

        <span className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-3 h-3" />
          {isFetching ? "Refreshing…" : `Last refresh: ${new Date().toLocaleTimeString()}`}
        </span>
      </div>
    </div>
  );
}