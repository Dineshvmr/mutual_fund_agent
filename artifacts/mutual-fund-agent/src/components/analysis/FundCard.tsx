import { formatINR } from "@/lib/utils";
import { type MutualFundRecommendation } from "@workspace/api-client-react";
import { CheckCircle2, TrendingUp, ShieldAlert, Building2, IndianRupee } from "lucide-react";

export function FundCard({ fund }: { fund: MutualFundRecommendation }) {
  
  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'low': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'moderate': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'moderately-high': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'very-high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/60 hover-lift relative overflow-hidden group">
      {fund.taxBenefit && (
        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-lg z-10 shadow-sm">
          80C Tax Saving
        </div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {fund.category}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRiskColor(fund.riskLevel)} capitalize`}>
              {fund.riskLevel.replace('-', ' ')} Risk
            </span>
          </div>
          <h3 className="font-display text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
            {fund.name}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
            <Building2 className="w-3.5 h-3.5" />
            {fund.amcName}
          </div>
        </div>
        
        <div className="text-right shrink-0 ml-4">
          <div className="text-sm font-medium text-muted-foreground">Expected Return</div>
          <div className="font-display text-xl font-bold text-emerald-600 flex items-center justify-end gap-1">
            <TrendingUp className="w-5 h-5" />
            {fund.returnPotential}
          </div>
        </div>
      </div>

      <div className="bg-secondary/40 rounded-xl p-4 mb-5 border border-secondary">
        <h4 className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-primary" /> Why this fits you:
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {fund.whyRecommended}
        </p>
      </div>

      <div className="space-y-2 mb-6">
        {fund.keyHighlights.map((highlight, idx) => (
          <div key={idx} className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{highlight}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-5 mt-auto">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Min. SIP Amount</div>
          <div className="font-semibold text-foreground flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5 text-muted-foreground" />
            {formatINR(fund.sipMinAmount).replace('₹', '')}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Min. Lump Sum</div>
          <div className="font-semibold text-foreground flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5 text-muted-foreground" />
            {formatINR(fund.lumpSumMinAmount).replace('₹', '')}
          </div>
        </div>
      </div>
    </div>
  );
}
