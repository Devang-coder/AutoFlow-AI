import { useNavigate } from "react-router-dom";
import {
  Zap, Upload, LayoutDashboard, ArrowRight, CheckCircle, XCircle,
  CreditCard, FileText, Bot, AlertTriangle, Play,
  ChevronRight, Clock, ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/Layout";
import { useSheetData } from "@/hooks/use-sheet-data";
import { CapabilitiesSection } from "@/components/CapabilitiesSection";
import { DemoMode } from "@/components/DemoMode";
import { cn } from "@/lib/utils";

const PIPELINE_STEPS = [
  { id: "ocr", label: "OCR", desc: "Text extraction from document" },
  { id: "supervisor", label: "Supervisor", desc: "Quality validation" },
  { id: "policy", label: "Policy", desc: "Compliance rules" },
  { id: "swarm", label: "Swarm Vote", desc: "3-agent risk voting" },
  { id: "payment", label: "Payment", desc: "Execute payment" },
  { id: "verify", label: "Verify", desc: "Confirm & audit" },
];

const STEP_STYLES = [
  { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  { color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200" },
];

const STEP_ICONS = [FileText, Bot, AlertTriangle, Zap, CreditCard, CheckCircle];

const HOW_IT_WORKS = [
  { step: "01", title: "Upload Invoice", desc: "Drop a PDF, JPG or PNG invoice. OCR extracts all fields automatically.", Icon: Upload },
  { step: "02", title: "AI Evaluates", desc: "Swarm agents assess anomalies, currency risk and vendor trust in parallel.", Icon: Bot },
  { step: "03", title: "Autonomous Payment", desc: "If approved, payment executes autonomously. Rejections are logged with reasons.", Icon: CreditCard },
];

const ONBOARDING_STEPS = [
  { step: 1, label: "Upload Invoice", desc: "Go to Upload Invoice and drop your file", cta: "Upload now", href: "/upload" },
  { step: 2, label: "Monitor Pipeline", desc: "Watch the pipeline process in real-time", cta: "Open monitor", href: "/dashboard" },
  { step: 3, label: "Review Decisions", desc: "Check AI decisions and payment status", cta: "View decisions", href: "/policy" },
];

function getDecisionIcon(decision: string) {
  const d = decision?.toUpperCase();
  if (d === "ALLOW" || d === "APPROVED" || d === "PARSED_READY" || d === "PAYMENT_SUCCESS") {
    return <CheckCircle className="w-4 h-4 text-emerald-500" />;
  }
  if (d === "DENY" || d === "REJECTED" || d === "PAYMENT_FAILED") {
    return <XCircle className="w-4 h-4 text-red-500" />;
  }
  return <Clock className="w-4 h-4 text-amber-500" />;
}

function getDecisionLabel(decision: string) {
  const d = decision?.toUpperCase();
  if (d === "ALLOW" || d === "PARSED_READY") return "Approved";
  if (d === "DENY") return "Rejected";
  if (d === "PAYMENT_SUCCESS") return "Payment Executed";
  if (d === "NEEDS_HUMAN") return "Needs Review";
  return decision || "—";
}

export default function HomePage() {
  const navigate = useNavigate();
  const { data: invoicesData } = useSheetData("invoices");
  const { data: policyData } = useSheetData("policy_decisions");

  const invoices = invoicesData as Record<string, string>[];
  const policy = policyData as Record<string, string>[];

  const totalProcessed = invoices.length;
  const automationRate = totalProcessed > 0
    ? Math.round((policy.filter((r) => r.auto_approved?.toLowerCase() === "true").length / totalProcessed) * 100)
    : 0;
  const highRiskAlerts = policy.filter((r) => r.risk_level?.toUpperCase() === "HIGH").length;

  const recentDecisions = [...policy].slice(-5).reverse();

  const handleDemoInvoice = () => {
    const demoText = `INVOICE
Invoice Number: INV-DEMO-001
Date: 2026-03-20
Due Date: 2026-04-19

FROM:
TechSupplies Corp
123 Business Ave, New York, NY 10001

TO:
AutoFlow Systems Inc
456 Innovation Drive, San Francisco, CA 94105

DESCRIPTION QTY UNIT PRICE TOTAL
Cloud Infrastructure 1 ₹4,500.00 ₹4,500.00
Software Licenses 5 ₹299.00 ₹1,495.00
Support Services 1 ₹750.00 ₹750.00

Subtotal: ₹6,745.00
Tax (8.5%): ₹573.33
TOTAL DUE: ₹7,318.33

Bank: Chase Business
Account: 1234567890
Routing: 021000021
Currency: INR
PO Reference: PO-2026-0088`;

    sessionStorage.setItem("autoflow_demo_text", demoText);
    navigate("/upload");
  };

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl glass-card p-8 hero-glow">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 mb-4">
              <Zap className="w-3 h-3" /> AutoFlow AI
            </span>
            <h1 className="text-3xl font-bold text-foreground mb-3 leading-tight text-balance">
              Autonomous Procure-to-Pay<br />with Swarm Intelligence
            </h1>
            <p className="text-muted-foreground mb-6 max-w-lg">
              Upload an invoice and watch our multi-agent AI pipeline extract, validate, assess risk, and autonomously execute payment — all in seconds.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate("/upload")} className="gap-2">
                <Upload className="w-4 h-4" /> Upload Invoice
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard")} className="gap-2">
                <LayoutDashboard className="w-4 h-4" /> Explore Dashboard
              </Button>
              <Button variant="ghost" onClick={handleDemoInvoice} className="gap-2">
                <Play className="w-4 h-4" /> Try Demo Invoice
              </Button>
            </div>
          </div>
        </div>

        {/* System Snapshot */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-6 flex flex-col justify-center md:row-span-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Invoices Processed</span>
            <span className="text-3xl font-bold tabular-nums text-foreground">{totalProcessed}</span>
          </div>
          <div className="glass-card p-5 flex flex-col justify-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">Automation Rate</span>
            <span className="text-2xl font-bold tabular-nums text-foreground">{automationRate}%</span>
          </div>
          <div className="glass-card p-5 flex flex-col justify-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-1">Active Agents</span>
            <span className="text-2xl font-bold tabular-nums text-foreground">3</span>
          </div>
          <div className="glass-card p-5 flex flex-col justify-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-1">High Risk Alerts</span>
            <span className="text-2xl font-bold tabular-nums text-foreground">{highRiskAlerts}</span>
          </div>
        </div>

        {/* Demo Mode */}
        <DemoMode />

        {/* Pipeline Preview */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pipeline Architecture</h2>
            <span className="text-xs text-muted-foreground">Conceptual preview</span>
          </div>
          <div className="flex items-center overflow-x-auto gap-2 pb-2">
            {PIPELINE_STEPS.map((step, i) => {
              const Icon = STEP_ICONS[i];
              const s = STEP_STYLES[i];
              const isLast = i === PIPELINE_STEPS.length - 1;
              return (
                <div key={step.id} className="flex items-center">
                  <div className={cn("flex flex-col items-center min-w-[100px] rounded-lg border p-3 transition-transform hover:scale-105", s.bg, s.border)}>
                    <Icon className={cn("w-5 h-5 mb-1", s.color)} />
                    <span className={cn("text-xs font-medium", s.color)}>{step.label}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 text-center">{step.desc}</span>
                  </div>
                  {!isLast && (
                    <div className="mx-1 flex items-center">
                      <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* System Capabilities */}
        <div>
          <h2 className="text-lg font-semibold mb-4">System Capabilities</h2>
          <CapabilitiesSection />
        </div>

        {/* Recent Decisions */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Decisions</h2>
          {recentDecisions.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No decisions yet</p>
              <p className="text-xs text-muted-foreground">Upload an invoice to start</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentDecisions.map((row, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition">
                  <div className="shrink-0">{getDecisionIcon(row.decision || "")}</div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground block truncate">{row.vendor_name || row.invoice_id || "Invoice"}</span>
                    <span className="text-xs text-muted-foreground">
                      {getDecisionLabel(row.decision || "")}
                      {row.amount && ` · ₹${parseFloat(row.amount).toLocaleString()} ${row.currency || ""}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button variant="ghost" className="w-full mt-3 text-xs" onClick={() => navigate("/policy")}>
            View all decisions →
          </Button>
        </div>

        {/* How It Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="glass-card p-6">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-xs font-bold text-primary">{item.step}</span>
              </div>
              <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Start Here Panel */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-1">Start Here</h2>
          <p className="text-xs text-muted-foreground mb-4">Follow these steps to process your first invoice.</p>
          <div className="space-y-3">
            {ONBOARDING_STEPS.map((item) => (
              <div key={item.step} className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/30 transition">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{item.step}</span>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium">{item.label}</span>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate(item.href)} className="text-xs shrink-0">
                  {item.cta} <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
