import React from 'react';
import { Users, Baby, HeartPulse, Briefcase, Dumbbell, Sparkles } from 'lucide-react';
import { PersonaType, UserContext } from '@/types/aqi';
import { INDIAN_MONITORED_CITIES } from '@/lib/constants';
import { TactileButton } from './TactileButton';

interface PersonaSelectorProps {
  userContext: UserContext;
  onChangeUserContext: (updated: UserContext) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  userContext,
  onChangeUserContext,
  onGenerate,
  isLoading,
}) => {
  const personas: Array<{
    id: PersonaType;
    label: string;
    description: string;
    icon: React.ElementType;
  }> = [
    {
      id: 'parent_kids',
      label: 'Parent with Kids',
      description: 'Developing lungs, school bus commute & outdoor play',
      icon: Baby,
    },
    {
      id: 'senior_sensitive',
      label: 'Senior / Asthmatic',
      description: 'Cardiopulmonary sensitivity & morning walk routines',
      icon: HeartPulse,
    },
    {
      id: 'daily_commuter',
      label: 'Daily Commuter',
      description: 'Transit peak exposure, road idling & route chaining',
      icon: Briefcase,
    },
    {
      id: 'fitness_enthusiast',
      label: 'Outdoor Fitness',
      description: 'Joggers, cyclists & high-ventilation rate athletes',
      icon: Dumbbell,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
          <Users className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Household Persona & Routine Context</h2>
          <p className="text-xs text-slate-500">Personalize AI reasoning based on age, vulnerability, and exposure habits</p>
        </div>
      </div>

      {/* City Dropdown */}
      <div className="mb-5">
        <label htmlFor="city-select" className="block text-xs font-semibold text-slate-700 mb-1.5">
          Select Monitored Indian Metro:
        </label>
        <select
          id="city-select"
          value={userContext.city}
          onChange={(e) =>
            onChangeUserContext({
              ...userContext,
              city: e.target.value,
            })
          }
          className="w-full text-sm bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-slate-700 font-medium"
        >
          {INDIAN_MONITORED_CITIES.map((c) => (
            <option key={c.city} value={c.city}>
              {c.city} ({c.defaultStation})
            </option>
          ))}
        </select>
      </div>

      {/* Persona Cards */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Household Persona:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {personas.map((p) => {
            const Icon = p.icon;
            const isSelected = userContext.persona === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() =>
                  onChangeUserContext({
                    ...userContext,
                    persona: p.id,
                  })
                }
                className={`flex items-start space-x-3 p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50/70'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">{p.label}</div>
                  <div className="text-[11px] text-slate-500 leading-snug">{p.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Household Habits / Environmental Context */}
      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50">
          <input
            type="checkbox"
            checked={userContext.routine.hasAirPurifier}
            onChange={(e) =>
              onChangeUserContext({
                ...userContext,
                routine: {
                  ...userContext.routine,
                  hasAirPurifier: e.target.checked,
                },
              })
            }
            className="rounded text-slate-900 focus:ring-slate-700 w-4 h-4"
          />
          <div className="text-xs">
            <span className="font-semibold text-slate-800 block">Has HEPA Air Purifier</span>
            <span className="text-[11px] text-slate-500">Optimizes room placement & door seals</span>
          </div>
        </label>

        <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50">
          <input
            type="checkbox"
            checked={userContext.routine.indoorPlants}
            onChange={(e) =>
              onChangeUserContext({
                ...userContext,
                routine: {
                  ...userContext.routine,
                  indoorPlants: e.target.checked,
                },
              })
            }
            className="rounded text-slate-900 focus:ring-slate-700 w-4 h-4"
          />
          <div className="text-xs">
            <span className="font-semibold text-slate-800 block">Has Air-Filtering Plants</span>
            <span className="text-[11px] text-slate-500">Snake plant / Areca palm placement</span>
          </div>
        </label>
      </div>

      {/* Tactile 4D Action Button */}
      <TactileButton
        onClick={onGenerate}
        disabled={isLoading}
        variant="primary"
        glowColor="#10B981"
        className="w-full py-3.5 px-4 text-sm font-bold"
      >
        <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        <span>{isLoading ? 'Synthesizing Grounded Plan...' : 'Generate Personalized Daily Plan'}</span>
      </TactileButton>
    </div>
  );
};
