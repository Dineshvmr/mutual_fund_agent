import { useState, useMemo } from "react";
import { type MutualFundRecommendation } from "@workspace/api-client-react";
import {
  CheckCircle2, TrendingUp, ShieldAlert, Building2,
  IndianRupee, BarChart2, Receipt, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";

// ─── helpers ────────────────────────────────────────────────────────────────

function getRiskColor(risk: string) {
  switch (risk) {
    case "low": return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "moderate": return "bg-blue-100 text-blue-800 border-blue-200";
    case "moderately-high": return "bg-amber-100 text-amber-800 border-amber-200";
    case "high": return "bg-orange-100 text-orange-800 border-orange-200";
    case "very-high": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

// ─── custom tooltip ─────────────────────────────────────────────────────────

function NavTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const nav = payload.find((p: any) => p.dataKey === "nav");
  return (
    <div className="bg-white border border-border rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {nav?.value != null && (
        <p className="text-blue-600">NAV: ₹{nav.value.toFixed(2)}</p>
      )}
    </div>
  );
}

// ─── performance bar chart (fallback) ───────────────────────────────────────

function PerformanceBarChart({ performance }: { performance: NonNullable<MutualFundRecommendation["performance"]> }) {
  const bars = [
    { label: "1Y", value: performance.oneYear },
    { label: "3Y", value: performance.threeYear },
    { label: "5Y", value: performance.fiveYear },
    { label: "Inception", value: performance.sinceInception },
  ];
  const maxVal = Math.max(...bars.map((b) => Math.abs(b.value)), 1);
  const color = (v: number) =>
    v >= 15 ? "#10b981" : v >= 10 ? "#3b82f6" : v >= 0 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex items-end gap-3 h-20">
      {bars.map((b) => {
        const pct = Math.max((Math.abs(b.value) / maxVal) * 100, 6);
        const c = color(b.value);
        return (
          <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[11px] font-bold" style={{ color: c }}>
              {b.value > 0 ? "+" : ""}{b.value.toFixed(1)}%
            </span>
            <div className="w-full flex items-end justify-center" style={{ height: 52 }}>
              <div className="w-full rounded-t-md" style={{ height: `${pct}%`, backgroundColor: c, opacity: 0.85, minHeight: 4 }} />
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground">{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

interface FundCardProps {
  fund: MutualFundRecommendation;
}

export function FundCard({ fund }: FundCardProps) {
  const [costsOpen, setCostsOpen] = useState(false);

  // Build historical NAV chart data (monthly sampled, max 80 display points)
  const { chartData, hasNavData } = useMemo(() => {
    const nav = fund.navHistory ?? [];
    if (nav.length === 0) return { chartData: [], hasNavData: false };

    const stride = Math.max(1, Math.floor(nav.length / 80));
    const chartData = nav
      .filter((_, i) => i % stride === 0 || i === nav.length - 1)
      .map((p) => ({
        date: format(new Date(p.date), "MMM yyyy"),
        nav: p.nav,
      }));

    return { chartData, hasNavData: true };
  }, [fund.navHistory]);

  // Y-axis domain with some padding
  const yDomain = useMemo((): [number | string, number | string] => {
    if (!hasNavData) return ["auto", "auto"];
    const vals = chartData.map((d) => d.nav);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = (max - min) * 0.08;
    return [Math.max(0, min - pad), max + pad];
  }, [chartData, hasNavData]);

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border/60 overflow-hidden flex flex-col group">

      {/* ── header ── */}
      <div className="p-6 pb-4">
        {fund.taxBenefit && (
          <div className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider rounded-full mb-3 shadow-sm">
            80C Tax Saving
          </div>
        )}
        <div className="flex gap-2 mb-3 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            {fund.category}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRiskColor(fund.riskLevel)} capitalize`}>
            {fund.riskLevel.replace("-", " ")} Risk
          </span>
        </div>
        <h3 className="font-display text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors mb-1">
          {fund.name}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Building2 className="w-3.5 h-3.5" />
          {fund.amcName}
          {fund.performance?.inceptionYear && (
            <span className="text-muted-foreground/50">· Since {fund.performance.inceptionYear}</span>
          )}
        </div>
      </div>

      {/* ── expected return pill ── */}
      <div className="mx-6 mb-4 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
        <span className="text-sm font-medium text-emerald-700">Expected Return</span>
        <span className="font-display font-bold text-emerald-700 flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          {fund.returnPotential}
        </span>
      </div>

      {/* ── NAV chart (real AMFI data) or fallback bar chart ── */}
      <div className="mx-6 mb-4 rounded-xl border border-border/40 overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {hasNavData ? "NAV History" : "Historical Performance (CAGR %)"}
              </span>
            </div>
            {fund.schemeCode && (
              <span className="text-[10px] text-muted-foreground">AMFI #{fund.schemeCode}</span>
            )}
          </div>

          {hasNavData ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id={`navGrad-${fund.schemeCode}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={yDomain}
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v.toFixed(0)}`}
                  width={44}
                />
                <Tooltip content={<NavTooltip />} />
                <Area
                  type="monotone"
                  dataKey="nav"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill={`url(#navGrad-${fund.schemeCode})`}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : fund.performance ? (
            <PerformanceBarChart performance={fund.performance} />
          ) : null}
        </div>

        {/* CAGR summary row */}
        {fund.performance && (
          <div className="border-t border-border/40 grid grid-cols-4 divide-x divide-border/40">
            {[
              { label: "1Y", val: fund.performance.oneYear },
              { label: "3Y", val: fund.performance.threeYear },
              { label: "5Y", val: fund.performance.fiveYear },
              { label: "Inception", val: fund.performance.sinceInception },
            ].map(({ label, val }) => (
              <div key={label} className="text-center py-2">
                <div className={`text-xs font-bold ${val >= 15 ? "text-emerald-600" : val >= 10 ? "text-blue-600" : "text-amber-600"}`}>
                  {val > 0 ? "+" : ""}{val.toFixed(1)}%
                </div>
                <div className="text-[10px] text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── why this fits you ── */}
      <div className="mx-6 mb-4 bg-secondary/40 rounded-xl p-4 border border-secondary">
        <h4 className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-primary" /> Why this fits you
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{fund.whyRecommended}</p>
      </div>

      {/* ── key highlights ── */}
      <div className="mx-6 mb-4 space-y-2">
        {fund.keyHighlights.map((h: string, i: number) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{h}</span>
          </div>
        ))}
      </div>

      {/* ── min investment ── */}
      <div className="mx-6 mb-4 grid grid-cols-2 gap-3">
        <div className="bg-secondary/30 rounded-xl p-3 border border-border/40">
          <div className="text-xs text-muted-foreground mb-1">Min. SIP</div>
          <div className="font-bold text-foreground flex items-center gap-0.5 text-sm">
            <IndianRupee className="w-3 h-3 text-muted-foreground" />
            {fund.sipMinAmount.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="bg-secondary/30 rounded-xl p-3 border border-border/40">
          <div className="text-xs text-muted-foreground mb-1">Min. Lump Sum</div>
          <div className="font-bold text-foreground flex items-center gap-0.5 text-sm">
            <IndianRupee className="w-3 h-3 text-muted-foreground" />
            {fund.lumpSumMinAmount.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* ── costs & charges (expandable) ── */}
      {fund.costs && (
        <div className="mx-6 mb-6">
          <button
            onClick={() => setCostsOpen(!costsOpen)}
            className="w-full flex items-center justify-between text-sm font-semibold text-foreground bg-secondary/30 hover:bg-secondary/50 border border-border/40 rounded-xl px-4 py-3 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              Costs & Charges
              <span className="text-xs font-normal text-muted-foreground">
                · {fund.costs.expenseRatio}% p.a. expense ratio
              </span>
            </span>
            {costsOpen
              ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
              : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>

          {costsOpen && (
            <div className="mt-2 border border-border/40 rounded-xl overflow-hidden divide-y divide-border/40">
              <div className="flex items-start justify-between px-4 py-3 bg-card">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-0.5">Expense Ratio (Direct)</div>
                  <div className="text-sm font-bold text-primary">{fund.costs.expenseRatio}% per annum</div>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${fund.costs.expenseRatio < 0.5 ? "bg-emerald-100 text-emerald-700" : fund.costs.expenseRatio < 1.0 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                  {fund.costs.expenseRatio < 0.5 ? "Very Low" : fund.costs.expenseRatio < 1.0 ? "Low" : "Moderate"}
                </div>
              </div>
              <div className="px-4 py-3 bg-card">
                <div className="text-xs font-semibold text-muted-foreground mb-0.5">Exit Load</div>
                <div className="text-sm text-foreground">{fund.costs.exitLoad}</div>
              </div>
              <div className="px-4 py-3 bg-card">
                <div className="text-xs font-semibold text-muted-foreground mb-0.5">Stamp Duty</div>
                <div className="text-sm text-foreground">{fund.costs.stampDuty}</div>
              </div>
              <div className="px-4 py-3 bg-card">
                <div className="text-xs font-semibold text-muted-foreground mb-0.5">Tax on Returns</div>
                <div className="text-sm text-foreground leading-relaxed">{fund.costs.taxOnReturns}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
