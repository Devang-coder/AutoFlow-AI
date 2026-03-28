import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedNumber({ value, className, prefix = "", suffix = "", decimals = 0 }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const duration = 1000;

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;
    const from = 0;
    const to = value;
    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * ease);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  const formatted = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString();
  return <span className={className}>{prefix}{formatted}{suffix}</span>;
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  variant: "blue" | "green" | "amber" | "red";
  format?: "currency" | "percent";
  prefix?: string;
  suffix?: string;
  decimals?: number;
  subtitle?: string;
  className?: string;
  delay?: number;
}

const iconColors = {
  blue: "text-indigo-600",
  green: "text-emerald-600",
  amber: "text-amber-600",
  red: "text-red-500",
};

const titleColors = {
  blue: "text-indigo-700",
  green: "text-emerald-700",
  amber: "text-amber-700",
  red: "text-red-600",
};

const valueColors = {
  blue: "text-indigo-950",
  green: "text-emerald-950",
  amber: "text-amber-950",
  red: "text-red-950",
};

export function MetricCard({ title, value, icon, variant, format, prefix, suffix, decimals, subtitle, className, delay = 0 }: MetricCardProps) {
  const resolvedPrefix = prefix ?? (format === "currency" ? "₹" : "");
  const resolvedSuffix = suffix ?? (format === "percent" ? "%" : "");
  const resolvedDecimals = decimals ?? (format === "percent" ? 1 : 0);
  const displayValue = format === "percent" ? value * 100 : value;
  return (
    <div
      className={cn(`metric-card-${variant} rounded-xl p-5 page-enter`, className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={cn("text-xs font-semibold uppercase tracking-wider", titleColors[variant])}>{title}</span>
        <span className={iconColors[variant]}>{icon}</span>
      </div>
      <AnimatedNumber value={displayValue} prefix={resolvedPrefix} suffix={resolvedSuffix} decimals={resolvedDecimals} className={cn("text-2xl font-bold tabular-nums", valueColors[variant])} />
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
