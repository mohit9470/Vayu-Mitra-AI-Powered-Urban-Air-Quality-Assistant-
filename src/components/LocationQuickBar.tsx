import React from 'react';
import { LocateFixed, Radio } from 'lucide-react';
import { Coordinates } from '@/types/aqi';

interface LocationQuickBarProps {
  activeCity: string;
  coordinates: Coordinates | null;
  onUseLiveLocation: () => void;
  isLocating: boolean;
  isLiveLocationActive: boolean;
}

export const LocationQuickBar: React.FC<LocationQuickBarProps> = ({
  activeCity,
  coordinates,
  onUseLiveLocation,
  isLocating,
  isLiveLocationActive,
}) => {
  return (
    <section
      aria-label="Live location status"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
              isLiveLocationActive
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900'
            }`}
          >
            <Radio className={`w-4 h-4 ${isLocating ? 'animate-pulse' : ''}`} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Location &amp; Live Air Monitor
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isLocating ? (
                'Requesting browser location permission to fetch your local AQI...'
              ) : isLiveLocationActive && coordinates ? (
                <span>
                  Live GPS locked on <strong className="text-slate-800 dark:text-slate-200">{activeCity}</strong>{' '}
                  <span className="font-mono text-[11px]">
                    ({coordinates.latitude.toFixed(3)}°, {coordinates.longitude.toFixed(3)}°)
                  </span>
                </span>
              ) : (
                <span>
                  Showing <strong className="text-slate-800 dark:text-slate-200">{activeCity}</strong> telemetry — allow location access for automatic local updates
                </span>
              )}
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
              ? 'Refresh Live GPS'
              : 'Use My Live Location'}
          </span>
        </button>
      </div>
    </section>
  );
};
