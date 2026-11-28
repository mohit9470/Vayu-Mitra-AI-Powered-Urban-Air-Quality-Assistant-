import React, { useState } from 'react';
import { Calendar, Home, Bike, ArrowUpRight } from 'lucide-react';
import { RecommendationResponse, RecommendationItem } from '@/types/aqi';

interface ActionCardsProps {
  plan: RecommendationResponse;
}

export const ActionCards: React.FC<ActionCardsProps> = ({ plan }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'outdoor' | 'indoor' | 'commute'>('all');

  const outdoorItems = plan.outdoorSchedulePlan ?? [];
  const indoorItems = plan.indoorAirHacks ?? [];
  const commuteItems = plan.commuteAlternatives ?? [];
  const totalCount = outdoorItems.length + indoorItems.length + commuteItems.length;

  const renderCard = (item: RecommendationItem, badgeColor: string) => (
    <div
      key={item.id}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
            {item.category === 'outdoor_schedule'
              ? 'Activity Schedule'
              : item.category === 'indoor_hacks'
              ? 'Indoor IAQ Hack'
              : 'Commute Alternative'}
          </span>
          {item.timeframe && (
            <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {item.timeframe}
            </span>
          )}
        </div>

        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 leading-snug">
          {item.title}
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
          {item.description}
        </p>
      </div>

      <div className="pt-3 border-t border-emerald-100 dark:border-emerald-900/60 mt-2 bg-emerald-50/50 dark:bg-emerald-950/40 -mx-5 -mb-5 p-4 rounded-b-2xl">
        <div className="flex items-start space-x-2">
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div className="text-xs">
            <span className="font-semibold text-emerald-900 dark:text-emerald-200 block mb-0.5">
              Why &amp; Health Impact:
            </span>
            <span className="text-emerald-800 dark:text-emerald-300/90 leading-snug text-[11px]">
              {item.impactJustification}
            </span>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            ~{item.exposureReductionPercent}% Less Inhalation
          </span>
          <span className="text-slate-600 dark:text-slate-400 font-medium">Difficulty: {item.difficulty}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div role="tablist" aria-label="Filter action recommendations by category" className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-slate-900 dark:bg-teal-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All Actions ({totalCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'outdoor'}
            onClick={() => setActiveTab('outdoor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'outdoor'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Outdoor Timing</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'indoor'}
            onClick={() => setActiveTab('indoor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'indoor'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Home className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Indoor Hacks</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'commute'}
            onClick={() => setActiveTab('commute')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'commute'
                ? 'bg-sky-700 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Bike className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Commute Shifts</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Grounded in Verified Station Metrics
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Actionable intervention cards">
        {(activeTab === 'all' || activeTab === 'outdoor') &&
          outdoorItems.map((item) =>
            renderCard(item, 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800')
          )}

        {(activeTab === 'all' || activeTab === 'indoor') &&
          indoorItems.map((item) =>
            renderCard(item, 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800')
          )}

        {(activeTab === 'all' || activeTab === 'commute') &&
          commuteItems.map((item) =>
            renderCard(item, 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800')
          )}
      </div>
    </div>
  );
};
