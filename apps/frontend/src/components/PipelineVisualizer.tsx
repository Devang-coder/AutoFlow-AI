import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Loader2, Clock, SkipForward } from "lucide-react";

export type StepStatus = "pending" | "running" | "success" | "failed" | "skipped";

export interface PipelineStep {
  id: string;
  label: string;
  description: string;
  status: StepStatus;
  failureReason?: string;
  completedAt?: string;
}

interface PipelineVisualizerProps {
  steps: PipelineStep[];
  className?: string;
}

const statusConfig: Record<StepStatus, {
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  labelClass: string;
  ringClass: string;
  bgClass: string;
}> = {
  pending: {
    icon: Clock,
    iconClass: "text-muted-foreground",
    labelClass: "text-muted-foreground",
    ringClass: "ring-border",
    bgClass: "bg-muted/40",
  },
  running: {
    icon: Loader2,
    iconClass: "text-primary animate-spin",
    labelClass: "text-primary font-semibold",
    ringClass: "ring-primary/40",
    bgClass: "bg-primary/5 pipeline-step-active",
  },
  success: {
    icon: CheckCircle,
    iconClass: "text-emerald-500",
    labelClass: "text-foreground",
    ringClass: "ring-emerald-200",
    bgClass: "bg-emerald-50",
  },
  failed: {
    icon: XCircle,
    iconClass: "text-destructive",
    labelClass: "text-destructive font-semibold",
    ringClass: "ring-destructive/30",
    bgClass: "bg-red-50",
  },
  skipped: {
    icon: SkipForward,
    iconClass: "text-muted-foreground",
    labelClass: "text-muted-foreground italic",
    ringClass: "ring-border",
    bgClass: "bg-muted/20",
  },
};

function StepConnector({ fromStatus }: { fromStatus: StepStatus; toStatus: StepStatus }) {
  const isActive = fromStatus === "success";
  return (
    <div className="flex items-center mx-1">
      <div className={cn("h-0.5 w-6 rounded-full transition-colors duration-500", isActive ? "bg-emerald-300" : "bg-border")} />
    </div>
  );
}

export function PipelineVisualizer({ steps, className }: PipelineVisualizerProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-start overflow-x-auto pb-2">
        {steps.map((step, i) => {
          const cfg = statusConfig[step.status];
          const Icon = cfg.icon;
          const isLast = i === steps.length - 1;
          const nextStep = steps[i + 1];

          return (
            <div key={step.id} className="flex items-center">
              <div className={cn("flex flex-col items-center min-w-[80px] px-2 py-2 rounded-lg ring-1", cfg.bgClass, cfg.ringClass)}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1">
                  <Icon className={cn("w-5 h-5", cfg.iconClass)} />
                </div>
                <span className={cn("text-xs text-center leading-tight", cfg.labelClass)}>
                  {step.label}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {step.status === "running" ? "Processing..." : step.status}
                </span>
                {step.status === "failed" && step.failureReason && (
                  <span className="text-[10px] text-destructive mt-0.5 text-center">
                    {step.failureReason}
                  </span>
                )}
              </div>
              {!isLast && nextStep && (
                <StepConnector fromStatus={step.status} toStatus={nextStep.status} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function buildPipelineSteps(state: string, failureReason?: string): PipelineStep[] {
  const steps: PipelineStep[] = [
    { id: "ocr", label: "OCR", description: "Extract text from document" },
    { id: "supervisor", label: "Supervisor", description: "Validate extraction quality" },
    { id: "policy", label: "Policy", description: "Apply compliance rules" },
    { id: "swarm", label: "Swarm Vote", description: "Multi-agent risk evaluation" },
    { id: "payment", label: "Payment", description: "Execute payment" },
    { id: "verify", label: "Verify", description: "Confirm transaction" },
  ].map((s) => ({ ...s, status: "pending" as StepStatus }));

  const stateMap: Record<string, number> = {
    OCR_RUNNING: 0,
    OCR_DONE: 0,
    SUBMITTING: 1,
    SUCCESS: 5,
    NEEDS_HUMAN: 3,
    DUPLICATE: 1,
    ERROR: -1,
  };

  const currentIdx = stateMap[state] ?? -1;

  return steps.map((step, i) => {
    if (state === "ERROR" && i === 0) return { ...step, status: "failed" as StepStatus, failureReason: failureReason || "Processing error" };
    if (state === "OCR_RUNNING" && i === 0) return { ...step, status: "running" as StepStatus };
    if (state === "SUBMITTING" && i === 0) return { ...step, status: "success" as StepStatus };
    if (state === "SUBMITTING" && i === 1) return { ...step, status: "running" as StepStatus };
    if (state === "NEEDS_HUMAN" && i <= 2) return { ...step, status: (i < 2 ? "success" : "failed") as StepStatus, failureReason: i === 2 ? "Human review required" : undefined };
    if (state === "NEEDS_HUMAN" && i > 2) return { ...step, status: "skipped" as StepStatus };
    if (state === "SUCCESS") return { ...step, status: "success" as StepStatus };
    if (i < currentIdx) return { ...step, status: "success" as StepStatus };
    if (i === currentIdx) return { ...step, status: "running" as StepStatus };
    return { ...step, status: "pending" as StepStatus };
  });
}
