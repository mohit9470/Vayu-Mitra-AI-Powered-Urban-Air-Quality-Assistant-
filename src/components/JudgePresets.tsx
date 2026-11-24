import React from 'react';
import { Award, ArrowRight } from 'lucide-react';
import { JUDGE_PRESETS } from '@/lib/constants';
import { JudgePreset } from '@/types/aqi';

interface JudgePresetsProps {
  selectedPresetId: string | null;
  onSelectPreset: (preset: JudgePreset) => void;
}

export const JudgePresets: React.FC<JudgePresetsProps> = ({
  selectedPresetId,
  onSelectPreset,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Judge & Evaluator Quick Profiles</h2>
            <p className="text-xs text-slate-500">1-click test scenarios to instantly inspect personalized interventions</p>
          </div>
        </div>
        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full self-start sm:self-auto">
          One-Click Presets
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {JUDGE_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`text-left p-3.5 rounded-xl border transition-all relative ${
                isSelected
                  ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-slate-900 block mb-1">
                  {preset.label}
                </span>
                <ArrowRight className={`w-3.5 h-3.5 mt-0.5 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
              </div>
              <p className="text-[11px] text-slate-500 mb-2 leading-tight">
                {preset.subtitle}
              </p>
              <div className="flex items-center space-x-1.5 text-[10px] font-medium">
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  {preset.city}
                </span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                  {preset.persona.replace('_', ' ')}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
