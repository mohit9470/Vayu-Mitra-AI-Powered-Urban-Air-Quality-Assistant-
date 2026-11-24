import React from 'react';
import { Radio, RefreshCw } from 'lucide-react';
import { AirQualityData } from '@/types/aqi';
import { getAQITheme } from '@/lib/constants';
import { TactileButton } from './TactileButton';

interface PersistentBannerProps {
  airQuality: AirQualityData | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const PersistentBanner: React.FC<PersistentBannerProps> = ({
  airQuality,
  isLoading,
  onRefresh,
}) => {
  if (!airQuality) return null;

  const theme = getAQITheme(airQuality.category);
  const formattedTime = new Date(airQuality.timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className="bg-slate-900 text-white text-xs border-b border-slate-800 px-4 py-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: theme.hex }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: theme.hex }}
            />
          </span>
          <span className="font-semibold text-slate-300">Live Data Source:</span>
          <span className="font-medium text-emerald-300">{airQuality.source}</span>
          <span className="text-slate-500 hidden md:inline">|</span>
          <span className="text-slate-400 hidden md:inline">Station:</span>
          <span className="text-white hidden md:inline font-medium">{airQuality.stationName}</span>
        </div>

        <div className="flex items-center space-x-3 ml-auto">
          <div className="flex items-center space-x-1 text-slate-400">
            <Radio className="w-3.5 h-3.5 text-teal-400" />
            <span>Last Updated:</span>
            <span className="font-mono text-slate-200">{formattedTime} IST</span>
          </div>

          <TactileButton
            onClick={onRefresh}
            disabled={isLoading}
            variant="telemetry"
            glowColor={theme.hex}
            className="px-2.5 py-1 text-[11px] rounded-lg"
            title="Refresh Live Data with time-based telemetry pulse"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-teal-600' : 'text-slate-700'}`} />
            <span>Sync</span>
          </TactileButton>
        </div>
      </div>
    </div>
  );
};
