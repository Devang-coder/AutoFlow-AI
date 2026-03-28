import { useState } from "react";
import { Play, Loader2, CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PipelineVisualizer, buildPipelineSteps } from "@/components/PipelineVisualizer";
import { SwarmViz } from "@/components/SwarmViz";
import { cn } from "@/lib/utils";

const DEMO_SWARM = {
  votes: {
    anomaly: { vote: "GO", confidence: 0.92, weight: 0.35 },
    currency: { vote: "GO", confidence: 0.88, weight: 0.30 },
    vendor: { vote: "REVIEW", confidence: 0.71, weight: 0.35 },
  },
  decision: "GO",
  score: 0.18,
  blockVotes: 0,
};

const DEMO_STAGES: { state: string; label: string; delay: number }[] = [
  { state: "OCR_RUNNING", label: "Extracting text from invoice...", delay: 1200 },
  { state: "SUBMITTING", label: "Supervisor validating extraction...", delay: 1000 },
  { state: "SUBMITTING", label: "Policy engine checking compliance...", delay: 800 },
  { state: "SUBMITTING", label: "Swarm agents voting on risk...", delay: 1500 },
  { state: "SUCCESS", label: "Payment executed & verified!", delay: 0 },
];

export function DemoMode() {
  const [running, setRunning] = useState(false);
  const [stageIdx, setStageIdx] = useState(-1);
  const [showSwarm, setShowSwarm] = useState(false);

  const runDemo = async () => {
    setRunning(true);
    setShowSwarm(false);
    for (let i = 0; i < DEMO_STAGES.length; i++) {
      setStageIdx(i);
      if (i === 3) setShowSwarm(true);
      await new Promise((r) => setTimeout(r, DEMO_STAGES[i].delay));
    }
    setRunning(false);
  };

  const reset = () => {
    setStageIdx(-1);
    setShowSwarm(false);
    setRunning(false);
  };

  const currentState = stageIdx >= 0 ? DEMO_STAGES[stageIdx].state : "IDLE";
  const steps = buildPipelineSteps(currentState);

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Demo Mode</h3>
          <p className="text-xs text-muted-foreground">Watch a simulated pipeline execution in real-time</p>
        </div>
        <div className="flex gap-2">
          {stageIdx >= 0 && !running && (
            <Button variant="outline" size="sm" onClick={reset} className="gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </Button>
          )}
          <Button size="sm" onClick={runDemo} disabled={running} className="gap-1.5">
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {running ? "Running..." : "Run Demo"}
          </Button>
        </div>
      </div>

      {stageIdx >= 0 && (
        <>
          <div className="flex items-center gap-2 text-xs">
            {running ? (
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            )}
            <span className={cn("font-medium", running ? "text-primary" : "text-emerald-600")}>
              {DEMO_STAGES[stageIdx].label}
            </span>
          </div>
          <PipelineVisualizer steps={steps} />
          {showSwarm && (
            <div className="animate-fade-in">
              <SwarmViz {...DEMO_SWARM} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
