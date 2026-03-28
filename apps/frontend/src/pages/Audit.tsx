import { useState, useMemo } from "react";
import { RefreshCw, ClipboardList, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/Layout";
import { SkeletonLine } from "@/components/SkeletonTable";
import { EmptyState } from "@/components/EmptyState";
import { useSheetData } from "@/hooks/use-sheet-data";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type AuditRow = Record<string, any>;

const AGENT_CONFIG: Record<string, any> = {
  IntakeAgent: { color: "text-blue-700", bg: "bg-blue-500" },
  SupervisorAgent: { color: "text-purple-700", bg: "bg-purple-500" },
  ActionAgent: { color: "text-emerald-700", bg: "bg-emerald-500" },
  VerificationAgent: { color: "text-teal-700", bg: "bg-teal-500" },
  SystemEntry: { color: "text-indigo-700", bg: "bg-indigo-500" },
  UnattributedEntry: { color: "text-slate-700", bg: "bg-slate-500" },
};

const DEFAULT_AGENT = {
  color: "text-indigo-700",
  bg: "bg-indigo-500",
};

function inferAgentName(row: AuditRow) {
  const explicit = (
    row.agent || row.Agent || row.agent_name || row["agent_name"] || ""
  )
    ?.toString()
    .trim();

  if (
    explicit &&
    explicit !== "undefined" &&
    explicit !== "null" &&
    explicit !== "UnknownAgent" &&
    explicit !== "UnattributedEntry" &&
    explicit !== "-"
  ) {
    return explicit;
  }

  const action = (row.action || row.Action || "").toString().toUpperCase();

  if (action.includes("INTAKE") || action.includes("PARSE")) return "IntakeAgent";
  if (action.includes("SUPERVIS") || action.includes("ROUTE")) return "SupervisorAgent";
  if (action.includes("PAYMENT") || action.includes("EXECUTE")) return "ActionAgent";
  if (action.includes("VERIFY") || action.includes("AUDIT")) return "VerificationAgent";

  const hasContent = (row.input_snapshot || row.output_snapshot || row.evidence || "")
    .toString()
    .trim();
  if (hasContent) return "SystemEntry";

  return "UnattributedEntry";
}

function formatAction(action: any) {
  const val = (action || "").toString().trim();
  if (!val) return "\u2014";
  return val.replace(/_/g, " ").toUpperCase();
}

function formatResult(row: AuditRow) {
  const val = (
    row.result || row.Result || row.status || ""
  ).toString().trim();

  if (val) return val.toUpperCase();
  if (row.output_snapshot) return "COMPLETED";
  return "\u2014";
}

function TimelineEntry({
  row,
  isLast,
}: {
  row: AuditRow;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const name = inferAgentName(row);
  const cfg = AGENT_CONFIG[name] || DEFAULT_AGENT;

  const action = formatAction(row.action);
  const result = formatResult(row);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white",
                cfg.bg
              )}
            >
              {name.charAt(0)}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{name}</p>
          </TooltipContent>
        </Tooltip>

        {!isLast && <div className="w-0.5 flex-1 bg-border mt-1" />}
      </div>

      <div className="flex-1 pb-6">
        <button
          className="w-full text-left"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex justify-between">
            <span className={cn("text-sm font-semibold", cfg.color)}>
              {name}
            </span>
          </div>

          <div className="flex gap-3 mt-1 text-xs">
            {action !== "\u2014" && (
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {action}
              </span>
            )}
            {result !== "\u2014" && (
              <span className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                result.includes("SUCCESS") || result.includes("VERIFIED") || result.includes("COMPLETED")
                  ? "bg-emerald-50 text-emerald-700"
                  : result.includes("FAIL") || result.includes("DENY") || result.includes("BLOCK")
                  ? "bg-red-50 text-red-700"
                  : result.includes("REVIEW") || result.includes("HUMAN")
                  ? "bg-amber-50 text-amber-700"
                  : "bg-muted text-muted-foreground"
              )}>
                {result}
              </span>
            )}
          </div>

          <span className="text-[11px] text-muted-foreground">
            {row.timestamp || ""}
          </span>
        </button>

        {expanded && (
          <div className="mt-3 space-y-2 text-xs">
            {row.input_snapshot && (
              <pre className="bg-muted p-2 rounded max-h-40 overflow-auto">
                {row.input_snapshot}
              </pre>
            )}
            {row.output_snapshot && (
              <pre className="bg-muted p-2 rounded max-h-40 overflow-auto">
                {row.output_snapshot}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuditPage() {
  const navigate = useNavigate();

  const { data = [], isLoading, refresh } = useSheetData("audit_ledger");

  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (!filter) return data;

    return data.filter((r: any) =>
      (r.trace_id || "")
        .toString()
        .toLowerCase()
        .includes(filter.toLowerCase())
    );
  }, [data, filter]);

  return (
    <PageContainer>
      <PageHeader
        title="Audit Trail"
        subtitle="System activity timeline"
        action={
          <Button onClick={() => refresh()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        }
      />

      <input
        placeholder="Filter trace id"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-4 border p-2 rounded"
      />

      {isLoading ? (
        <SkeletonLine width="full" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardList />}
          title="No audit entries"
          action={
            <Button onClick={() => navigate("/upload")}>
              <Upload className="w-4 h-4" /> Upload
            </Button>
          }
        />
      ) : (
        <div>
          {filtered.map((row: any, i: number) => (
            <TimelineEntry
              key={i}
              row={row}
              isLast={i === filtered.length - 1}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}