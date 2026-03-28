import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { RefreshCw, FileText, DollarSign, TrendingUp } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/Layout";
import { MetricCard } from "@/components/MetricCard";
import { SkeletonCard } from "@/components/SkeletonTable";
import { useSheetData } from "@/hooks/use-sheet-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InvoiceRow = Record<string, string>;
const CHART_AXIS = "#94A3B8";
const STATUS_COLORS: Record<string, string> = { PARSED_READY: "#10B981", NEEDS_HUMAN: "#F59E0B" };
const RISK_COLORS: Record<string, string> = { LOW: "#10B981", MEDIUM: "#F59E0B", HIGH: "#EF4444" };

export default function AnalyticsPage() {
  const { data: rawData, isFetching, isLoading, refresh } = useSheetData("invoices");
  const data = rawData as InvoiceRow[];

  const totalInvoices = data.length;
  const totalSpend = useMemo(() => data.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0), [data]);
  const avgConfidence = useMemo(() => {
    const vals = data.map((r) => parseFloat(r.confidence)).filter((v) => !isNaN(v));
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }, [data]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((r) => { const s = r.status || "UNKNOWN"; counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  const riskData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((r) => { const s = (r.risk_level || "UNKNOWN").toUpperCase(); counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  const vendorData = useMemo(() => {
    const spend: Record<string, number> = {};
    data.forEach((r) => { if (r.vendor_name) spend[r.vendor_name] = (spend[r.vendor_name] || 0) + (parseFloat(r.amount) || 0); });
    return Object.entries(spend).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name: name.length > 14 ? name.slice(0, 14) + "…" : name, value }));
  }, [data]);

  return (
    <PageContainer>
      <PageHeader
        title="System Analytics"
        subtitle="Invoice processing insights and trends"
        stepLabel="Analytics"
        action={<Button variant="outline" size="sm" onClick={() => refresh()} disabled={isFetching} className="gap-2"><RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} /> Refresh</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <MetricCard title="Total Invoices" value={totalInvoices} icon={<FileText className="w-5 h-5" />} variant="blue" delay={0} />
            <MetricCard title="Total Spend" value={totalSpend} icon={<DollarSign className="w-5 h-5" />} variant="green" delay={80} format="currency" />
            <MetricCard title="Avg Confidence" value={avgConfidence} icon={<TrendingUp className="w-5 h-5" />} variant="amber" delay={160} format="percent" />
          </>
        )}
      </div>

      {/* Main visualization + supporting charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Spend by Vendor</h3>
          {isLoading ? <div className="h-64 skeleton-pulse rounded-lg" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={vendorData}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: CHART_AXIS }} />
                <YAxis tick={{ fontSize: 10, fill: CHART_AXIS }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(239, 84%, 67%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid grid-rows-2 gap-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-3">Status Distribution</h3>
            {isLoading ? <div className="h-28 skeleton-pulse rounded-lg" /> : (
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={45} label={({ name, percent }) => `${(name as string).slice(0, 8)} ${Math.round(percent * 100)}%`} labelLine={false} fontSize={10}>
                    {statusData.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#94A3B8"} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-3">Risk Distribution</h3>
            {isLoading ? <div className="h-28 skeleton-pulse rounded-lg" /> : (
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={45} label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`} labelLine={false} fontSize={10}>
                    {riskData.map((entry) => <Cell key={entry.name} fill={RISK_COLORS[entry.name] || "#94A3B8"} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
