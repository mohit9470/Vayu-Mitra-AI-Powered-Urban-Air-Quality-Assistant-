import React from 'react';
import { Radio, RefreshCw, LocateFixed } from 'lucide-react';
import { AirQualityData } from '@/types/aqi';
import { getAQITheme } from '@/lib/constants';
import { TactileButton } from './TactileButton';

interface PersistentBannerProps {
  airQuality: AirQualityData | null;
  isLoading: boolean;
  onRefresh: () => void;
  autoRefreshEnabled: boolean;
  onToggleAutoRefresh: () => void;
}

export const PersistentBanner: React.FC<PersistentBannerProps> = ({
  airQuality,
  isLoading,
  onRefresh,
  autoRefreshEnabled,
  onToggleAutoRefresh,
}) => {
  if (!airQuality) return null;

  const theme = getAQITheme(airQuality.category);
  const formattedTime = new Date(airQuality.timestamp).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const isFallback = Boolean(airQuality.isFallback);

  return (
    <div className="bg-slate-900 dark:bg-slate-950 text-white text-xs border-b border-slate-800 px-4 py-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="relative flex h-2 w-2">
            {!isFallback && (
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: theme.hex }}
              />
            )}
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: isFallback ? '#F59E0B' : theme.hex }}
            />
          </span>
          <span className="font-semibold text-slate-300">
            {isFallback ? 'Offline Reference Baseline:' : 'Live Data Source:'}
          </span>
          <span className={`font-medium ${isFallback ? 'text-amber-300' : 'text-emerald-300'}`}>
            {airQuality.source}
          </span>
          {airQuality.isLiveLocation && (
            <span className="inline-flex items-center space-x-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded text-[10px] font-semibold">
              <LocateFixed className="w-2.5 h-2.5" aria-hidden="true" />
              <span>GPS</span>
            </span>
          )}
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-slate-400 hidden md:inline">Station:</span>
          <span className="text-white hidden md:inline font-medium">{airQuality.stationName}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 ml-auto">
          <div className="flex items-center space-x-1 text-slate-400">
            <Radio className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
            <span>{isFallback ? 'Snapshot:' : 'Last Updated:'}</span>
            <span className="font-mono text-slate-200">{formattedTime} IST</span>
          </div>

          <button
            type="button"
            aria-pressed={autoRefreshEnabled}
            onClick={onToggleAutoRefresh}
            className={`px-2 py-1 rounded-lg border text-[11px] font-medium transition-colors flex items-center space-x-1.5 ${
              autoRefreshEnabled
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle automatic 5-minute live telemetry refresh"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                autoRefreshEnabled ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            <span>Auto-Live {autoRefreshEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <TactileButton
            onClick={onRefresh}
            disabled={isLoading}
            variant="telemetry"
            glowColor={theme.hex}
            className="px-2.5 py-1 text-[11px] rounded-lg"
            title="Fetch fresh live air quality telemetry now"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-teal-600 dark:text-teal-400' : 'text-slate-700 dark:text-slate-200'}`} aria-hidden="true" />
            <span>Sync</span>
          </TactileButton>
        </div>
      </div>
    </div>
  );
};
