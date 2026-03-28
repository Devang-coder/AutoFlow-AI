import { cn } from "@/lib/utils";
import { Search, DollarSign, Building2, Info, Brain, Clock, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface SwarmVote {
  vote: string;
  confidence: number;
  weight: number;
}

interface SwarmData {
  anomaly?: SwarmVote;
  currency?: SwarmVote;
  vendor?: SwarmVote;
}

interface FeedbackAnalysis {
  adapted?: boolean;
  history_size?: number;
  resolved_size?: number;
  success_rate?: number;
}

interface SwarmConsensusDetail {
  weights_used?: Record<string, number>;
  base_weights?: Record<string, number>;
}

export interface SwarmVizProps {
  votes: SwarmData;
  decision: string;
  score: number;
  blockVotes: number;
  feedbackAnalysis?: FeedbackAnalysis;
  consensusDetail?: SwarmConsensusDetail;
}

const voteStyle = (vote: string) => {
  switch (vote?.toUpperCase()) {
    case "GO":
      return { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", bar: "bg-emerald-400", label: "GO", emoji: "✅" };
    case "REVIEW":
      return { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700", bar: "bg-amber-400", label: "REVIEW", emoji: "⚠️" };
    case "BLOCK":
      return { bg: "bg-red-50", border: "border-red-300", text: "text-red-700", bar: "bg-red-400", label: "BLOCK", emoji: "🛑" };
    default:
      return { bg: "bg-muted/50", border: "border-border", text: "text-muted-foreground", bar: "bg-muted", label: "-", emoji: "" };
  }
};

function AgentCard({
  name, role, icon: Icon, vote, subtitle,
}: {
  name: string;
  role: string;
  icon: React.ComponentType<{ className?: string }>;
  vote?: SwarmVote;
  subtitle: string;
}) {
  if (!vote) return null;
  const s = voteStyle(vote.vote);
  const confPct = Math.round(vote.confidence * 100);
  const weightPct = Math.round(vote.weight * 100);

  return (
    <div className={cn("rounded-lg border p-3", s.bg, s.border)}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("w-4 h-4", s.text)} />
        <span className={cn("text-sm font-semibold", s.text)}>{name}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{role}</span>
        <span className={cn("text-xs font-bold", s.text)}>{s.emoji} {s.label}</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span>Confidence</span>
          <span>{confPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className={cn("h-full rounded-full", s.bar)} style={{ width: `${confPct}%` }} />
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span>Vote Weight</span>
          <span>{weightPct}%</span>
        </div>
      </div>
    </div>
  );
}

export function SwarmViz({ votes, decision, score, blockVotes, feedbackAnalysis, consensusDetail }: SwarmVizProps) {
  const d = voteStyle(decision);
  const confidencePct = Math.round((1 - Math.min(score / 0.6, 1)) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Swarm Intelligence</h3>
        <span className="text-xs text-muted-foreground">3 Agents</span>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-help">
            <Info className="w-3 h-3" />
            <span>Swarm Intelligence</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-xs">Multiple AI agents evaluate risk independently and vote on approval. The consensus decision is based on weighted votes from all 3 agents.</p>
        </TooltipContent>
      </Tooltip>

      <div className="grid grid-cols-3 gap-3">
        <AgentCard name="Anomaly" role="Risk Detection" icon={Search} vote={votes.anomaly} subtitle="Checks for anomalous patterns" />
        <AgentCard name="Currency" role="FX Analysis" icon={DollarSign} vote={votes.currency} subtitle="Evaluates currency risk" />
        <AgentCard name="Vendor" role="Trust Score" icon={Building2} vote={votes.vendor} subtitle="Assesses vendor reliability" />
      </div>

      <div className={cn("rounded-lg border p-3", d.bg, d.border)}>
        <div className="text-xs text-muted-foreground mb-1">Swarm Consensus Decision</div>
        <div className="flex items-center gap-2">
          <span className={cn("text-lg font-bold", d.text)}>{d.emoji} {d.label}</span>
        </div>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span>Risk Score: {score.toFixed(3)}</span>
          <span>Blocks: {blockVotes}/3</span>
        </div>
        <div className="mt-2">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span>Swarm Confidence</span>
            <span>{confidencePct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className={cn("h-full rounded-full", d.bar)} style={{ width: `${confidencePct}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">GO &lt; 0.20 | REVIEW &lt; 0.45 | BLOCK ≥ 0.45</p>
        </div>
      </div>

      {/* Learning Status */}
      {feedbackAnalysis && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Learning Status</h4>
          <div className="flex gap-2 flex-wrap">
            <Badge variant={feedbackAnalysis.adapted ? "default" : "secondary"}>
              {feedbackAnalysis.adapted ? (
                <><Brain className="h-3 w-3 mr-1" /> Weights Adapted</>
              ) : (
                <><Clock className="h-3 w-3 mr-1" /> Using Base Weights</>
              )}
            </Badge>
            <Badge variant="outline">History: {feedbackAnalysis.history_size || 0} cases</Badge>
            <Badge variant="outline">Resolved: {feedbackAnalysis.resolved_size || 0}</Badge>
            {feedbackAnalysis.success_rate !== undefined && (
              <Badge variant={feedbackAnalysis.success_rate >= 0.8 ? "default" : feedbackAnalysis.success_rate >= 0.6 ? "secondary" : "destructive"}>
                Success Rate: {Math.round(feedbackAnalysis.success_rate * 100)}%
              </Badge>
            )}
          </div>

          {feedbackAnalysis.adapted && consensusDetail?.weights_used && consensusDetail?.base_weights && (
            <div className="text-xs space-y-1 mt-2 p-2 bg-muted rounded">
              <p className="font-medium">Weight Changes:</p>
              {Object.entries(consensusDetail.weights_used).map(([agent, weight]) => {
                const baseWeight = consensusDetail.base_weights?.[agent] ?? weight;
                const changed = weight !== baseWeight;
                return (
                  <div key={agent} className="flex items-center gap-2">
                    <span className="capitalize w-20">{agent}:</span>
                    {changed ? (
                      <span className="font-mono-data">
                        {baseWeight.toFixed(2)} → {(weight as number).toFixed(2)}
                        <TrendingUp className="inline h-3 w-3 ml-1 text-emerald-600" />
                      </span>
                    ) : (
                      <span className="font-mono-data text-muted-foreground">
                        {(weight as number).toFixed(2)} (unchanged)
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Parse from audit_ledger SwarmConsensusEngine row */
export function parseSwarmFromAudit(
  inputSnapshot: string,
  outputSnapshot: string
): SwarmVizProps | null {
  try {
    const votes = JSON.parse(inputSnapshot);
    const output = JSON.parse(outputSnapshot);
    if (!votes.anomaly && !votes.currency && !votes.vendor) return null;

    // Extract learning data from output if available
    const feedbackAnalysis: FeedbackAnalysis | undefined = output.feedback_analysis
      ? {
          adapted: output.feedback_analysis.adapted,
          history_size: output.feedback_analysis.history_size,
          resolved_size: output.feedback_analysis.resolved_size,
          success_rate: output.feedback_analysis.success_rate,
        }
      : undefined;

    const consensusDetail: SwarmConsensusDetail | undefined =
      output.weights_used || output.base_weights
        ? { weights_used: output.weights_used, base_weights: output.base_weights }
        : undefined;

    return {
      votes: { anomaly: votes.anomaly, currency: votes.currency, vendor: votes.vendor },
      decision: output.decision || "GO",
      score: output.score || 0,
      blockVotes: output.block_votes || 0,
      feedbackAnalysis,
      consensusDetail,
    };
  } catch {
    return null;
  }
}
