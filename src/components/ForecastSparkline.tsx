import React, { useState } from 'react';
import { Clock, Sun, TrendingDown, Info } from 'lucide-react';
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(6); // Default select 12 PM (safe window)

  if (!forecast || forecast.length === 0) return null;

  const maxAQI = Math.max(...forecast.map((f) => f.aqi), 400);
  const minAQI = Math.min(...forecast.map((f) => f.aqi), 50);
  const activeItem = hoveredIndex !== null ? forecast[hoveredIndex] : forecast[6];
  const activeTheme = getAQITheme(activeItem.category);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              24-Hour Atmospheric Forecast & Diurnal Inversion
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
            <Sun className="w-3 h-3 text-emerald-600" />
            <span>Optimal Window: 12 PM – 3 PM</span>
          </span>
        </div>

        <p className="text-xs text-slate-500 mb-5">
          Diurnal boundary layer dynamics in {cityName}. Solar thermal radiation breaks morning ground-level smog trapping between 12:00 PM and 3:30 PM.
        </p>

        {/* Selected Hour Telemetry Bar */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 mb-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-xs font-semibold text-slate-600">
              Hour: <span className="text-slate-900 font-bold font-mono">{activeItem.displayTime}</span>
            </div>
            <div className="text-xs text-slate-500">
              Forecast AQI:{' '}
              <span className="font-mono font-bold tabular-nums text-slate-900">
                {activeItem.aqi}
              </span>
            </div>
            <div className="text-xs text-slate-500 hidden sm:block">
              PM2.5:{' '}
              <span className="font-mono font-semibold tabular-nums text-slate-800">
                {activeItem.pm25} µg/m³
              </span>
            </div>
          </div>

          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E2E8F0',
              color: activeTheme.hex,
            }}
          >
            {activeItem.notes}
          </span>
        </div>

        {/* Interactive Sparkline Bar Chart */}
        <div className="h-28 flex items-end justify-between gap-1.5 sm:gap-2 pt-2 px-1">
          {forecast.map((item, idx) => {
            const heightPercent = Math.max(18, Math.round(((item.aqi - minAQI * 0.5) / maxAQI) * 100));
            const isHovered = hoveredIndex === idx;
            const theme = getAQITheme(item.category);

            return (
              <div
                key={item.hour}
                onMouseEnter={() => setHoveredIndex(idx)}
                onClick={() => setHoveredIndex(idx)}
                className="flex-1 flex flex-col items-center group cursor-pointer h-full justify-end"
              >
                {/* Bar */}
                <div
                  className={`w-full rounded-t-md transition-all duration-200 ${
                    item.isSafeWindow
                      ? 'bg-emerald-400 hover:bg-emerald-500'
                      : isHovered
                      ? 'bg-slate-700'
                      : 'bg-slate-200 group-hover:bg-slate-300'
                  }`}
                  style={{
                    height: `${heightPercent}%`,
                    borderTop: isHovered ? `2px solid ${theme.hex}` : undefined,
                  }}
                />
                {/* Hour Label */}
                <span className="text-[10px] font-mono text-slate-400 mt-2 tracking-tighter truncate">
                  {item.displayTime.replace(' ', '')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mt-2">
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block" />
          <span>Midday Solar Convection Drop</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded bg-slate-300 inline-block" />
          <span>Nocturnal & Traffic Trapping</span>
        </span>
      </div>
    </div>
  );
};
