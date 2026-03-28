import { FileText, Shield, Zap, CreditCard, RotateCcw, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const CAPABILITIES = [
  {
    icon: FileText,
    title: "OCR Extraction",
    desc: "Extracts text and structured fields from PDF, JPG, PNG invoices using Tesseract.js",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    icon: Shield,
    title: "Policy Engine",
    desc: "Applies configurable compliance rules and threshold checks before approval",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  {
    icon: Zap,
    title: "Swarm Intelligence",
    desc: "3 independent AI agents (Anomaly, Currency, Vendor) vote on risk using weighted consensus",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  {
    icon: CreditCard,
    title: "Payment Automation",
    desc: "Autonomously executes approved payments and records verification status",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    icon: RotateCcw,
    title: "Remediation Agent",
    desc: "Automatically retries failed operations and tracks remediation attempts",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  {
    icon: ClipboardList,
    title: "Audit Ledger",
    desc: "Full timeline of every agent action with structured metadata and trace IDs",
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
  },
];

export function CapabilitiesSection() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {CAPABILITIES.map((cap) => (
        <Tooltip key={cap.title}>
          <TooltipTrigger asChild>
            <div className={cn("glass-card p-4 cursor-help transition-all hover:scale-[1.02]")}>
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", cap.bg, "border", cap.border)}>
                <cap.icon className={cn("w-4.5 h-4.5", cap.color)} />
              </div>
              <h4 className="text-sm font-semibold mb-1">{cap.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">{cap.desc}</p>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-xs">{cap.desc}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
