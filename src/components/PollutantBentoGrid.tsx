import React, { useState } from 'react';
import { HelpCircle, AlertCircle } from 'lucide-react';
import { PollutantValues } from '@/types/aqi';

interface PollutantBentoGridProps {
  pollutants: PollutantValues;
  dominant: string;
}

interface PollutantMetric {
  key: string;
  symbol: string;
  value: number | null;
  unit: string;
  whoLimit: number;
  whoLimitLabel: string;
  source: string;
  healthImpact: string;
  isDominant?: boolean;
}

export const PollutantBentoGrid: React.FC<PollutantBentoGridProps> = ({
  pollutants,
  dominant,
}) => {
  const [activeTooltipKey, setActiveTooltipKey] = useState<string | null>(null);

  const metrics: PollutantMetric[] = [
    {
      key: 'pm25',
      symbol: 'PM2.5',
      value: pollutants.pm25 ?? null,
      unit: 'µg/m³',
      whoLimit: 15,
      whoLimitLabel: '15 µg/m³ (24h)',
      source: 'Combustion, crop residue, diesel exhaust',
      healthImpact: 'Crosses blood-air barrier into alveoli, increasing systemic vascular inflammation and stroke risk.',
      isDominant: dominant.includes('2.5'),
    },
    {
      key: 'pm10',
      symbol: 'PM10',
      value: pollutants.pm10 ?? null,
      unit: 'µg/m³',
      whoLimit: 45,
      whoLimitLabel: '45 µg/m³ (24h)',
      source: 'Road dust, construction debris, mechanical wear',
      healthImpact: 'Irritates upper respiratory tract and triggers acute asthmatic bronchospasms.',
      isDominant: dominant.includes('10'),
    },
    {
      key: 'no2',
      symbol: 'NO2',
      value: pollutants.no2 ?? null,
      unit: 'µg/m³',
      whoLimit: 25,
      whoLimitLabel: '25 µg/m³ (24h)',
      source: 'High-temperature internal combustion engines',
      healthImpact: 'Inflames airway linings, reducing resistance to respiratory infections and wheezing.',
      isDominant: dominant.toUpperCase().includes('NO2'),
    },
    {
      key: 'co',
      symbol: 'CO',
      value: pollutants.co ?? null,
      unit: 'mg/m³',
      whoLimit: 4,
      whoLimitLabel: '4 mg/m³ (24h)',
      source: 'Incomplete vehicular combustion & idling',
      healthImpact: 'Binds with hemoglobin to form carboxyhemoglobin, impairing oxygen delivery to tissues.',
      isDominant: dominant.toUpperCase() === 'CO',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm w-full flex flex-col justify-between transition-colors">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Atmospheric Speciation Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a pollutant card to inspect WHO guidelines and health effects
            </p>
          </div>
          <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded">
            Sensor Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {metrics.map((m) => {
            const isSelected = activeTooltipKey === m.key;
            const ratio = m.value !== null ? m.value / m.whoLimit : 0;
            const barWidth = m.value !== null ? Math.min(100, Math.max(8, Math.round((ratio / 6) * 100))) : 0;
            const barColor =
              ratio > 3 ? 'bg-rose-500' : ratio > 1 ? 'bg-amber-500' : 'bg-emerald-500';

            return (
              <button
                key={m.key}
                type="button"
                aria-expanded={isSelected}
                onClick={() => setActiveTooltipKey(isSelected ? null : m.key)}
                className={`text-left rounded-xl border p-4 transition-all cursor-pointer relative focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  isSelected
                    ? 'border-slate-400 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                      {m.symbol}
                    </span>
                    {m.isDominant && (
                      <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                        Dominant
                      </span>
                    )}
                  </div>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                </div>

                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
                      {m.value !== null ? m.value : 'N/A'}
                    </span>
                    {m.value !== null && (
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{m.unit}</span>
                    )}
                  </div>
                  {m.value !== null && (
                    <span
                      className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                        ratio > 3
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : ratio > 1
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {ratio.toFixed(1)}x WHO
                    </span>
                  )}
                </div>

                {/* WHO Ratio Meter */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                  <span>WHO Limit:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{m.whoLimitLabel}</span>
                </div>

                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1 text-[11px]">
                      <AlertCircle className="w-3 h-3 text-slate-600 dark:text-slate-400" aria-hidden="true" />
                      <span>Plain-English Health Effect:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                      {m.value === null
                        ? 'Sensor did not report this pollutant for the current reading.'
                        : m.healthImpact}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                      Source: {m.source}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
