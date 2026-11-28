import React from 'react';
import { Users, Baby, HeartPulse, Briefcase, Dumbbell, Sparkles, LocateFixed } from 'lucide-react';
import { PersonaType, UserContext } from '@/types/aqi';
import { INDIAN_MONITORED_CITIES } from '@/lib/constants';
import { TactileButton } from './TactileButton';

interface PersonaSelectorProps {
  userContext: UserContext;
  onChangeUserContext: (updated: UserContext) => void;
  onSelectCity: (city: string) => void;
  onUseLiveLocation: () => void;
  onGenerate: () => void;
  isLoading: boolean;
  isLocating: boolean;
  isLiveLocationActive: boolean;
}

const PERSONAS: Array<{
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

const COMMUTE_MODES: Array<{
  id: NonNullable<UserContext['routine']['commuteMode']>;
  label: string;
}> = [
  { id: 'two_wheeler', label: 'Two-Wheeler' },
  { id: 'car_cab', label: 'Car / Cab' },
  { id: 'metro_transit', label: 'Metro / AC Bus' },
  { id: 'walking', label: 'Walking / Cycling' },
];

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  userContext,
  onChangeUserContext,
  onSelectCity,
  onUseLiveLocation,
  onGenerate,
  isLoading,
  isLocating,
  isLiveLocationActive,
}) => {
  const isKnownCity = INDIAN_MONITORED_CITIES.some(
    (c) => c.city.toLowerCase() === userContext.city.toLowerCase()
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center">
          <Users className="w-4 h-4" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Household Persona &amp; Routine Context
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Changing location automatically fetches live telemetry; customize routine details below
          </p>
        </div>
      </div>

      {/* Balanced City Dropdown + Live GPS Location Button */}
      <div className="mb-5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-8">
          <label htmlFor="city-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Location (Auto-Fetches Live Data):
          </label>
          <select
            id="city-select"
            value={userContext.city}
            onChange={(e) => onSelectCity(e.target.value)}
            className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
          >
            {!isKnownCity && (
              <option value={userContext.city}>
                Live GPS: {userContext.city}
              </option>
            )}
            {INDIAN_MONITORED_CITIES.map((c) => (
              <option key={c.city} value={c.city}>
                {c.city} ({c.defaultStation})
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-4">
          <button
            type="button"
            onClick={onUseLiveLocation}
            disabled={isLocating}
            className={`w-full py-2.5 px-3.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:opacity-60 ${
              isLiveLocationActive
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin text-teal-600 dark:text-teal-400' : 'text-teal-600 dark:text-teal-400'}`} aria-hidden="true" />
            <span>{isLocating ? 'Locating...' : isLiveLocationActive ? 'Refresh Live GPS' : 'Detect Live GPS'}</span>
          </button>
        </div>
      </div>

      {/* Persona Cards */}
      <div className="mb-5">
        <span id="persona-group-label" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Household Persona:
        </span>
        <div role="group" aria-labelledby="persona-group-label" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PERSONAS.map((p) => {
            const Icon = p.icon;
            const isSelected = userContext.persona === p.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() =>
                  onChangeUserContext({
                    ...userContext,
                    persona: p.id,
                  })
                }
                className={`flex items-start space-x-3 p-3 rounded-xl border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  isSelected
                    ? 'border-slate-900 dark:border-teal-500 bg-slate-50 dark:bg-teal-950/40 ring-1 ring-slate-900 dark:ring-teal-500 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:bg-slate-50/70 dark:hover:bg-slate-800'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-teal-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">{p.label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{p.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Commute Mode & Routine Window */}
      <div className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div>
          <span id="commute-mode-label" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Primary Transit / Outdoor Mode:
          </span>
          <div role="group" aria-labelledby="commute-mode-label" className="grid grid-cols-2 gap-2">
            {COMMUTE_MODES.map((mode) => {
              const active = userContext.routine.commuteMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    onChangeUserContext({
                      ...userContext,
                      routine: { ...userContext.routine, commuteMode: mode.id },
                    })
                  }
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                    active
                      ? 'border-teal-600 dark:border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="morning-window-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Typical Morning / Outdoor Window:
          </label>
          <input
            id="morning-window-input"
            type="text"
            maxLength={80}
            value={userContext.routine.morningOutdoorTime || ''}
            placeholder="e.g. 07:00 - 08:30 (Morning walk or commute)"
            onChange={(e) =>
              onChangeUserContext({
                ...userContext,
                routine: { ...userContext.routine, morningOutdoorTime: e.target.value },
              })
            }
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      {/* Household Habits / Environmental Context */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
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
            className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
          />
          <div className="text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">Has HEPA Air Purifier</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Optimizes room placement &amp; door seals</span>
          </div>
        </label>

        <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
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
            className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
          />
          <div className="text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">Has Air-Filtering Plants</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Snake plant / Areca palm placement</span>
          </div>
        </label>
      </div>

      {/* Tactile Action Button */}
      <TactileButton
        onClick={onGenerate}
        disabled={isLoading}
        variant="primary"
        glowColor="#10B981"
        className="w-full py-3.5 px-4 text-sm font-bold"
      >
        <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
        <span>{isLoading ? 'Synthesizing Grounded Plan...' : 'Update Personalized Daily Plan'}</span>
      </TactileButton>
    </div>
  );
};
