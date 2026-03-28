import { cn } from "@/lib/utils";

type StatusVariant =
  | "PARSED_READY"
  | "NEEDS_HUMAN"
  | "ALLOW"
  | "DENY"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "ERROR"
  | string;

const VARIANTS: Record<string, string> = {
  PARSED_READY: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  NEEDS_HUMAN: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  ALLOW: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  DENY: "bg-red-50 text-red-700 ring-1 ring-red-200",
  PAYMENT_SUCCESS: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  PAYMENT_FAILED: "bg-red-50 text-red-700 ring-1 ring-red-200",
  ERROR: "bg-red-50 text-red-700 ring-1 ring-red-200",
  SUCCESS: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  LOW: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  HIGH: "bg-red-50 text-red-700 ring-1 ring-red-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-1 ring-red-200",
  PROCESSING: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
};

const DEFAULT = "bg-secondary text-secondary-foreground ring-1 ring-border";

interface StatusBadgeProps {
  status: StatusVariant;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cls = VARIANTS[status?.toUpperCase?.()] ?? DEFAULT;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", cls, className)}>
      {status || "—"}
    </span>
  );
}
