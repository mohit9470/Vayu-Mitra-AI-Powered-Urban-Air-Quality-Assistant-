import React from 'react';
import { Leaf, HeartHandshake, ShieldCheck, TrendingDown } from 'lucide-react';
import { RecommendationResponse } from '@/types/aqi';

interface ImpactBreakdownProps {
  plan: RecommendationResponse;
}

export const ImpactBreakdown: React.FC<ImpactBreakdownProps> = ({ plan }) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-400/30 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Direct Health & Environmental Impact</h2>
            <p className="text-xs text-slate-400">Pillar 3 Justification Engine • Measurable Harm Reduction</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-800/80 border border-slate-700 px-4 py-2.5 rounded-xl">
          <TrendingDown className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          <div>
            <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Estimated Personal Harm Reduction</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 leading-none">
              ~{plan.overallExposureReduction}% Inhaled PM2.5
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/60">
          <div className="flex items-center space-x-2 text-xs font-semibold text-teal-300 mb-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" aria-hidden="true" />
            <span>Health Rationale & Vulnerability Defense</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {plan.summaryQuote}
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/60">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-300 mb-2">
            <Leaf className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span>Collective Environmental Contribution</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {plan.environmentalBenefit}
          </p>
        </div>
      </div>
    </div>
  );
};
