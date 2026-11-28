import React from 'react';
import { MapPin, LocateFixed } from 'lucide-react';
import { INDIAN_MONITORED_CITIES } from '@/lib/constants';

interface LocationQuickBarProps {
  activeCity: string;
  onSelectCity: (city: string) => void;
  onUseLiveLocation: () => void;
  isLocating: boolean;
  isLiveLocationActive: boolean;
}

export const LocationQuickBar: React.FC<LocationQuickBarProps> = ({
  activeCity,
  onSelectCity,
  onUseLiveLocation,
  isLocating,
  isLiveLocationActive,
}) => {
  return (
    <section
      aria-label="Location selector"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0 border border-teal-100 dark:border-teal-900">
            <MapPin className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Location &amp; Live Air Monitor
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Detect your live GPS coordinates or choose a city for automatic real-time updates
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onUseLiveLocation}
          disabled={isLocating}
          aria-pressed={isLiveLocationActive}
          className={`inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all self-start sm:self-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:opacity-60 ${
            isLiveLocationActive
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500/30'
              : 'border-slate-300 dark:border-slate-700 bg-slate-900 dark:bg-teal-600 text-white hover:bg-slate-800 dark:hover:bg-teal-500 shadow-sm'
          }`}
        >
          <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>
            {isLocating
              ? 'Detecting Live Location...'
              : isLiveLocationActive
              ? `Live GPS: ${activeCity}`
              : 'Use My Live Location'}
          </span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Quick city selection">
        {INDIAN_MONITORED_CITIES.map((item) => {
          const isSelected =
            !isLiveLocationActive && activeCity.toLowerCase() === item.city.toLowerCase();
          return (
            <button
              key={item.city}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectCity(item.city)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                isSelected
                  ? 'border-teal-600 dark:border-teal-500 bg-teal-50 dark:bg-teal-950/70 text-teal-900 dark:text-teal-200 font-semibold shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.city}
            </button>
          );
        })}
      </div>
    </section>
  );
};
