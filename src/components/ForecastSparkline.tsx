import React, { useState } from 'react';
import { Clock, Sun } from 'lucide-react';
import { HourlyForecast } from '@/types/aqi';
import { getAQITheme } from '@/lib/constants';

interface ForecastSparklineProps {
  forecast: HourlyForecast[];
  cityName: string;
}

export const ForecastSparkline: React.FC<ForecastSparklineProps> = ({
  forecast,
  cityName,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number>(6);

  if (!forecast || forecast.length === 0) return null;

  const maxAQI = Math.max(...forecast.map((f) => f.aqi), 400);
  const minAQI = Math.min(...forecast.map((f) => f.aqi), 50);
  const activeItem = forecast[hoveredIndex] || forecast[0];
  const activeTheme = getAQITheme(activeItem.category);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between w-full transition-colors">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              24-Hour Diurnal Exposure Curve
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
            <Sun className="w-3 h-3 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>Optimal Window: 12 PM – 3 PM</span>
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Boundary layer dynamics in {cityName}. Solar heating typically disperses ground-level smog between 12:00 PM and 3:30 PM.
        </p>

        {/* Selected Hour Telemetry Bar */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/70 p-3 mb-5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Hour: <span className="text-slate-900 dark:text-white font-bold font-mono">{activeItem.displayTime}</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Forecast AQI:{' '}
              <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                {activeItem.aqi}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              PM2.5:{' '}
              <span className="font-mono font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                {activeItem.pm25 !== null ? `${activeItem.pm25} µg/m³` : 'N/A'}
              </span>
            </div>
          </div>

          <span
            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
            style={{ color: activeTheme.hex }}
          >
            {activeItem.notes}
          </span>
        </div>

        {/* Interactive Sparkline Bar Chart */}
        <div className="h-28 flex items-end justify-between gap-1 sm:gap-2 pt-2 px-1" role="group" aria-label="24-hour AQI forecast slots">
          {forecast.map((item, idx) => {
            const heightPercent = Math.max(18, Math.round(((item.aqi - minAQI * 0.5) / maxAQI) * 100));
            const isHovered = hoveredIndex === idx;
            const theme = getAQITheme(item.category);

            return (
              <button
                key={item.hour}
                type="button"
                aria-pressed={isHovered}
                aria-label={`${item.displayTime}: AQI ${item.aqi}, ${item.category}`}
                onMouseEnter={() => setHoveredIndex(idx)}
                onFocus={() => setHoveredIndex(idx)}
                onClick={() => setHoveredIndex(idx)}
                className="flex-1 flex flex-col items-center group cursor-pointer h-full justify-end rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <div
                  className={`w-full rounded-t-md transition-all duration-200 ${
                    item.isSafeWindow
                      ? isHovered
                        ? 'bg-emerald-500 ring-2 ring-emerald-300 dark:ring-emerald-700'
                        : 'bg-emerald-400 dark:bg-emerald-500/80 hover:bg-emerald-500'
                      : isHovered
                      ? 'bg-slate-700 dark:bg-slate-300 ring-2 ring-slate-300 dark:ring-slate-600'
                      : 'bg-slate-200 dark:bg-slate-700 group-hover:bg-slate-300 dark:group-hover:bg-slate-600'
                  }`}
                  style={{
                    height: `${heightPercent}%`,
                    borderTop: isHovered ? `2px solid ${theme.hex}` : undefined,
                  }}
                />
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-2 tracking-tighter truncate">
                  {item.displayTime.replace(' ', '')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block" />
          <span>Midday Solar Convection Drop</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded bg-slate-300 dark:bg-slate-600 inline-block" />
          <span>Nocturnal &amp; Traffic Trapping</span>
        </span>
      </div>
    </div>
  );
};
