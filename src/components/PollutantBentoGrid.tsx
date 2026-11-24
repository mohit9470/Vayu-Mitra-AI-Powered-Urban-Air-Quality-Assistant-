import React, { useState } from 'react';
import { HelpCircle, AlertCircle } from 'lucide-react';
import { PollutantValues } from '@/types/aqi';

interface PollutantBentoGridProps {
  pollutants: PollutantValues;
  dominant: string;
}

interface PollutantMetric {
  key: string;
  name: string;
  symbol: string;
  value: number;
  unit: string;
  whoLimit: string;
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
      name: 'Fine Particulate Matter',
      symbol: 'PM2.5',
      value: pollutants.pm25,
      unit: 'µg/m³',
      whoLimit: '15 µg/m³ (24h)',
      source: 'Combustion, crop residue, diesel exhaust',
      healthImpact: 'Crosses blood-air barrier into alveoli, increasing systemic vascular inflammation and stroke risk.',
      isDominant: dominant.includes('2.5'),
    },
    {
      key: 'pm10',
      name: 'Coarse Inhalable Dust',
      symbol: 'PM10',
      value: pollutants.pm10,
      unit: 'µg/m³',
      whoLimit: '45 µg/m³ (24h)',
      source: 'Road dust, construction debris, mechanical wear',
      healthImpact: 'Irritates upper respiratory tract, nasopharynx, and triggers acute asthmatic bronchospasms.',
      isDominant: dominant.includes('10'),
    },
    {
      key: 'no2',
      name: 'Nitrogen Dioxide',
      symbol: 'NO2',
      value: pollutants.no2 || 48.5,
      unit: 'µg/m³',
      whoLimit: '25 µg/m³ (24h)',
      source: 'High-temperature internal combustion engines',
      healthImpact: 'Inflames airway linings, reducing resistance to respiratory infections and wheezing.',
    },
    {
      key: 'co',
      name: 'Carbon Monoxide',
      symbol: 'CO',
      value: pollutants.co || 1.8,
      unit: 'mg/m³',
      whoLimit: '4 mg/m³ (24h)',
      source: 'Incomplete vehicular combustion & idling',
      healthImpact: 'Binds with hemoglobin to form carboxyhemoglobin, impairing oxygen delivery to myocardial tissues.',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Atmospheric Speciation Breakdown
          </h3>
          <p className="text-xs text-slate-500">
            Real-time chemical pollutants measured in tabular telemetry
          </p>
        </div>
        <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
          CPCB Sensor Bus
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {metrics.map((m) => {
          const isSelected = activeTooltipKey === m.key;
          return (
            <div
              key={m.key}
              onClick={() => setActiveTooltipKey(isSelected ? null : m.key)}
              className={`rounded-xl border p-4 transition-all cursor-pointer relative ${
                isSelected
                  ? 'border-slate-400 bg-slate-50/90 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold font-mono text-slate-900">
                    {m.symbol}
                  </span>
                  {m.isDominant && (
                    <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                      Dominant
                    </span>
                  )}
                </div>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
              </div>

              <div className="flex items-baseline space-x-1.5 mb-2">
                <span className="text-2xl font-black font-mono tabular-nums text-slate-900 tracking-tight">
                  {m.value}
                </span>
                <span className="text-xs font-mono text-slate-500">{m.unit}</span>
              </div>

              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>WHO Threshold:</span>
                <span className="font-mono text-slate-700 font-medium">{m.whoLimit}</span>
              </div>

              {/* Expandable Plain-English Clinical Tooltip */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-700 space-y-1 animate-fadeIn">
                  <div className="font-semibold text-slate-900 flex items-center space-x-1 text-[11px]">
                    <AlertCircle className="w-3 h-3 text-slate-600" />
                    <span>Plain-English Health Effect:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    {m.healthImpact}
                  </p>
                  <p className="text-[10px] text-slate-400 italic">
                    Source: {m.source}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
