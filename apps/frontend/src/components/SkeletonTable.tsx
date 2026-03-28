import { cn } from "@/lib/utils";

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
  className?: string;
}

export function SkeletonTable({ rows = 6, cols = 5, className }: SkeletonTableProps) {
  return (
    <div className={cn("w-full overflow-hidden rounded-xl border border-border", className)}>
      <div className="flex gap-4 px-4 py-3 border-b border-border bg-muted/30">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded skeleton-pulse" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-3 border-b border-border last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-4 flex-1 rounded skeleton-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl p-5 skeleton-pulse h-28", className)} />
  );
}

export function SkeletonLine({ className, width = "full" }: { className?: string; width?: string }) {
  return <div className={cn("h-4 rounded skeleton-pulse", `w-${width}`, className)} />;
}
