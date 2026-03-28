import { useState, useCallback, useRef, useEffect } from "react";
import {
  Upload as UploadIcon, FileText, Loader2, CheckCircle, AlertTriangle,
  XCircle, Copy, Check, Settings, Clock, Info, ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageContainer, PageHeader } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { PipelineVisualizer, buildPipelineSteps } from "@/components/PipelineVisualizer";
import { extractTextFromFile, getOcrQuality, type OcrQuality } from "@/lib/ocr";
import { getApiBaseUrl, setApiBaseUrl } from "@/lib/config";
import { cn } from "@/lib/utils";

type UploadState = "IDLE" | "OCR_RUNNING" | "OCR_DONE" | "SUBMITTING" | "SUCCESS" | "NEEDS_HUMAN" | "DUPLICATE" | "ERROR";

interface WebhookResponse {
  success?: boolean; trace_id?: string; status?: string;
  invoice_summary?: Record<string, unknown>; confidence?: number;
  error?: string; risk_flags?: { rule: string; description: string }[];
  risk_score?: number; decision?: string; reason?: string;
}

const ACCEPTED = ".pdf,.jpg,.jpeg,.png";
const MAX_SIZE_MB = 5;

const qualityConfig: Record<OcrQuality, { label: string; cls: string }> = {
  GOOD: { label: "GOOD", cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  FAIR: { label: "FAIR", cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
  POOR: { label: "POOR", cls: "bg-red-50 text-red-700 ring-1 ring-red-200" },
};

const STAGE_LABELS: Record<string, string> = {
  IDLE: "", OCR_RUNNING: "OCR Extraction", OCR_DONE: "OCR Complete",
  SUBMITTING: "Swarm Vote", SUCCESS: "Complete", NEEDS_HUMAN: "Human Review",
  DUPLICATE: "Duplicate Detected", ERROR: "Error",
};

export default function UploadPage() {
  const { toast } = useToast();
  const [state, setState] = useState<UploadState>("IDLE");
  const [invoiceText, setInvoiceText] = useState("");
  const [ocrQuality, setOcrQuality] = useState<OcrQuality | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [response, setResponse] = useState<WebhookResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiUrlDraft, setApiUrlDraft] = useState(getApiBaseUrl());
  const [savedApiUrl, setSavedApiUrl] = useState(getApiBaseUrl());
  const [startTime, setStartTime] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const demo = sessionStorage.getItem("autoflow_demo_text");
    if (demo) { setInvoiceText(demo); setOcrQuality(getOcrQuality(demo)); setState("OCR_DONE"); sessionStorage.removeItem("autoflow_demo_text"); }
  }, []);

  const processFile = useCallback(async (file: File) => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) { setErrorMsg(`File exceeds ${MAX_SIZE_MB}MB limit.`); setState("ERROR"); return; }
    setFileName(file.name); setState("OCR_RUNNING"); setInvoiceText(""); setOcrQuality(null); setResponse(null); setErrorMsg(null);
    try { const text = await extractTextFromFile(file); setInvoiceText(text); setOcrQuality(getOcrQuality(text)); setState("OCR_DONE"); }
    catch (err) { setErrorMsg(err instanceof Error ? err.message : "OCR failed"); setState("ERROR"); }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) processFile(file); }, [processFile]);
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) processFile(file); e.target.value = ""; };

  const submit = async (text: string) => {
    if (!text.trim()) return;
    setState("SUBMITTING"); setStartTime(Date.now()); setResponse(null); setErrorMsg(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/webhook/intake-invoice`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invoice_text: text, source_event_id: `ui-upload-${Date.now()}` }) });
      if (res.status === 409) { setState("DUPLICATE"); return; }
      let data: WebhookResponse = {}; try { data = await res.json(); } catch { /* ignore */ }
      setResponse(data);
      if (res.status === 202 || data.status === "NEEDS_HUMAN") setState("NEEDS_HUMAN");
      else if (!res.ok) { setErrorMsg(data.error || `HTTP ${res.status}`); setState("ERROR"); }
      else setState("SUCCESS");
      window.dispatchEvent(new CustomEvent("invoice-submitted"));
      toast({ title: "Invoice Processed", description: "Your invoice has been parsed and is being analyzed by the swarm" });
    } catch (err) { setErrorMsg(err instanceof Error ? err.message : "Network error"); setState("ERROR"); }
  };

  const copyTrace = () => { if (response?.trace_id) { navigator.clipboard.writeText(response.trace_id); setCopied(true); setTimeout(() => setCopied(false), 2000); } };
  const saveApiUrl = () => { setApiBaseUrl(apiUrlDraft); setSavedApiUrl(apiUrlDraft); setShowSettings(false); };
  const resetUpload = () => { setState("IDLE"); setInvoiceText(""); setOcrQuality(null); setFileName(null); setResponse(null); setErrorMsg(null); setStartTime(null); };

  const isLoading = state === "OCR_RUNNING" || state === "SUBMITTING";
  const pipelineSteps = buildPipelineSteps(state, errorMsg || undefined);
  const currentStageLabel = STAGE_LABELS[state];

  return (
    <PageContainer>
      <PageHeader title="Upload Invoice" subtitle="Extract, validate, and process invoices" stepLabel="Step 1"
        action={<Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)} className="gap-2"><Settings className="w-4 h-4" /> API Settings</Button>}
      />

      {showSettings && (
        <div className="glass-card p-4 mb-6">
          <h3 className="text-sm font-semibold mb-2">Webhook Base URL</h3>
          <div className="flex gap-2">
            <input className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-sm" value={apiUrlDraft} onChange={(e) => setApiUrlDraft(e.target.value)} placeholder="https://your-n8n-instance.onrender.com" />
            <Button size="sm" onClick={saveApiUrl}>Save</Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Current: {savedApiUrl}</p>
        </div>
      )}

      {state !== "IDLE" && (
        <div className="glass-card p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            {isLoading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
            {state === "SUCCESS" && <CheckCircle className="w-4 h-4 text-emerald-500" />}
            {(state === "ERROR" || state === "NEEDS_HUMAN") && <AlertTriangle className="w-4 h-4 text-amber-500" />}
            <span className="text-sm font-medium">{fileName ? `Processing ${fileName}` : "Processing Invoice"}</span>
            {currentStageLabel && <span className="text-xs text-muted-foreground ml-auto">Stage: {currentStageLabel}</span>}
          </div>
          <PipelineVisualizer steps={pipelineSteps} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Tabs defaultValue="file">
            <TabsList><TabsTrigger value="file">Upload File</TabsTrigger><TabsTrigger value="text">Paste Text</TabsTrigger></TabsList>
            <TabsContent value="file" className="mt-4">
              {state === "IDLE" || state === "ERROR" ? (
                <div className={cn("border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors", dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}>
                  <input ref={fileInputRef} type="file" accept={ACCEPTED} className="hidden" onChange={onFileChange} />
                  <UploadIcon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium">Drop file here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG, JPEG, PNG — max {MAX_SIZE_MB}MB</p>
                  {state === "ERROR" && errorMsg && <p className="text-xs text-destructive mt-3">{errorMsg}</p>}
                </div>
              ) : state === "OCR_RUNNING" ? (
                <div className="border rounded-xl p-8 text-center"><Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-2" /><p className="text-sm">Extracting text from document…</p></div>
              ) : (
                <div className="space-y-3">
                  {ocrQuality && <div className="flex items-center gap-2"><span className="text-xs">OCR Quality:</span><span className={cn("text-xs rounded-full px-2 py-0.5", qualityConfig[ocrQuality].cls)}>{qualityConfig[ocrQuality].label}</span></div>}
                  <textarea className="w-full h-48 p-3 rounded-lg border border-border bg-card text-xs font-mono-data resize-none" value={invoiceText} onChange={(e) => { setInvoiceText(e.target.value); setOcrQuality(getOcrQuality(e.target.value)); }} />
                  <div className="flex gap-2">
                    <Button onClick={() => submit(invoiceText)} disabled={isLoading || !invoiceText.trim()} className="gap-2">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />} Process Invoice
                    </Button>
                    <Button variant="outline" onClick={resetUpload}>Reset</Button>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="text" className="mt-4">
              <textarea className="w-full h-48 p-3 rounded-lg border border-border bg-card text-xs font-mono-data resize-none" placeholder="Paste invoice text here..." value={invoiceText} onChange={(e) => { setInvoiceText(e.target.value); if (e.target.value.trim()) { setOcrQuality(getOcrQuality(e.target.value)); setState("OCR_DONE"); } }} />
              <div className="flex gap-2 mt-3">
                <Button onClick={() => submit(invoiceText)} disabled={isLoading || !invoiceText.trim()} className="gap-2">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />} Process Invoice
                </Button>
                <Button variant="outline" onClick={resetUpload}>Reset</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          {(state === "SUCCESS" || state === "NEEDS_HUMAN" || state === "ERROR" || state === "DUPLICATE") && (
            <div className={cn("glass-card p-5", state === "SUCCESS" ? "border-l-4 border-emerald-500" : state === "NEEDS_HUMAN" ? "border-l-4 border-amber-500" : "border-l-4 border-red-500")}>
              <div className="flex items-center gap-2 mb-3">
                {state === "SUCCESS" && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                {state === "NEEDS_HUMAN" && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {state === "ERROR" && <XCircle className="w-5 h-5 text-red-500" />}
                <span className="font-semibold text-sm">
                  {state === "SUCCESS" ? "✅ Invoice Approved" : state === "NEEDS_HUMAN" ? "⚠️ Human Review Required" : state === "DUPLICATE" ? "🔄 Duplicate Invoice" : "❌ Processing Failed"}
                </span>
              </div>
              {response?.status && <StatusBadge status={response.status} className="mb-3" />}
              {errorMsg && <p className="text-xs text-destructive mb-3">{errorMsg}</p>}
              {response?.reason && <p className="text-xs text-muted-foreground mb-3">{response.reason}</p>}
              {response?.risk_score !== undefined && (
                <div className="text-xs mb-2">Risk Score: <span className="font-bold">{(response.risk_score * 100).toFixed(0)}%</span></div>
              )}
              {response?.trace_id && (
                <button onClick={copyTrace} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Trace: {response.trace_id}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
