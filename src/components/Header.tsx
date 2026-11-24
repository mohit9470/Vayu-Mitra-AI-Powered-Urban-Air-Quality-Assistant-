import React from 'react';
import { Wind, ShieldCheck, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Wind className="w-6 h-6 animate-pulse-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">VayuMitra</h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                100% Web AI
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Urban Air Quality Assistant • Grounded Daily Interventions
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero Hallucination AQI Grounding</span>
          </div>
          <div className="flex items-center space-x-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>PromptWars Challenge 6</span>
          </div>
        </div>
      </div>
    </header>
  );
};
