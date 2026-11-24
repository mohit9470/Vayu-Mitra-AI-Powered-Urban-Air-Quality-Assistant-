import React, { useState } from 'react';
import { Calendar, Home, Bike, ShieldAlert, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { RecommendationResponse, RecommendationItem } from '@/types/aqi';

interface ActionCardsProps {
  plan: RecommendationResponse;
  onAdoptAction?: (text: string) => void;
}

export const ActionCards: React.FC<ActionCardsProps> = ({ plan, onAdoptAction }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'outdoor' | 'indoor' | 'commute'>('all');

  const renderCard = (item: RecommendationItem, badgeColor: string) => (
    <div
      key={item.id}
      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
            {item.category === 'outdoor_schedule'
              ? 'Pillar 1: Activity Schedule'
              : item.category === 'indoor_hacks'
              ? 'Pillar 2: Indoor IAQ Hack'
              : 'Pillar 3: Commute Alternative'}
          </span>
          {item.timeframe && (
            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {item.timeframe}
            </span>
          )}
        </div>

        <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
          {item.title}
        </h3>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Impact & Justification Box */}
      <div className="pt-3 border-t border-slate-100 mt-2 bg-emerald-50/50 -mx-5 -mb-5 p-4 rounded-b-2xl border-t-emerald-100">
        <div className="flex items-start space-x-2">
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-emerald-900 block mb-0.5">
              Why & Health Impact:
            </span>
            <span className="text-emerald-800 leading-snug text-[11px]">
              {item.impactJustification}
            </span>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
            ~{item.exposureReductionPercent}% Less Inhalation
          </span>
          <span className="text-slate-500 font-medium">Difficulty: {item.difficulty}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Pillar Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All 3 Pillars ({plan.outdoorSchedulePlan.length + plan.indoorAirHacks.length + plan.commuteAlternatives.length})
          </button>
          <button
            onClick={() => setActiveTab('outdoor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'outdoor'
                ? 'bg-teal-700 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Outdoor Timing</span>
          </button>
          <button
            onClick={() => setActiveTab('indoor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'indoor'
                ? 'bg-emerald-700 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Indoor Hacks</span>
          </button>
          <button
            onClick={() => setActiveTab('commute')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'commute'
                ? 'bg-sky-700 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Commute Shifts</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Grounded in CPCB Live Metrics
        </span>
      </div>

      {/* Grid of Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(activeTab === 'all' || activeTab === 'outdoor') &&
          plan.outdoorSchedulePlan.map((item) =>
            renderCard(item, 'bg-teal-50 text-teal-800 border-teal-200')
          )}

        {(activeTab === 'all' || activeTab === 'indoor') &&
          plan.indoorAirHacks.map((item) =>
            renderCard(item, 'bg-emerald-50 text-emerald-800 border-emerald-200')
          )}

        {(activeTab === 'all' || activeTab === 'commute') &&
          plan.commuteAlternatives.map((item) =>
            renderCard(item, 'bg-sky-50 text-sky-800 border-sky-200')
          )}
      </div>
    </div>
  );
};
