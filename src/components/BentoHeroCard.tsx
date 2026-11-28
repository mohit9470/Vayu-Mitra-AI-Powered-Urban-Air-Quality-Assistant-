import React from 'react';
import { ShieldCheck, MapPin } from 'lucide-react';
import { AirQualityData } from '@/types/aqi';
import { getAQITheme } from '@/lib/constants';
import { AQIRadialGauge } from './AQIRadialGauge';
import { AtmosphericParticleSphere } from './AtmosphericParticleSphere';

interface BentoHeroCardProps {
  airQuality: AirQualityData;
}

export const BentoHeroCard: React.FC<BentoHeroCardProps> = ({ airQuality }) => {
  const theme = getAQITheme(airQuality.category);
  const pm25 = airQuality.pollutants.pm25;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm transition-colors h-full w-full flex flex-col justify-between"
      style={{
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
      }}
    >
      {/* 3D Atmospheric Particle Sphere & Ambient Glow */}
      <AtmosphericParticleSphere
        aqi={airQuality.aqi}
        category={airQuality.category}
        size={240}
      />

      {/* Subtle Ambient Radial Glow strictly behind the hero */}
      <div
        className="pointer-events-none absolute -left-12 -top-12 h-80 w-80 rounded-full blur-3xl opacity-70 dark:opacity-50 transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${theme.glowHex} 0%, transparent 70%)`,
        }}
      />

      {/* Header telemetry line */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex h-2 w-2 relative">
            {!airQuality.isFallback && (
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: theme.hex }}
              />
            )}
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: theme.hex }}
            />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {airQuality.isFallback ? 'Baseline Telemetry' : airQuality.isLiveLocation ? 'Live GPS Telemetry' : 'Live Telemetry'}
          </span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <div className="flex items-center space-x-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span>{airQuality.city}</span>
            <span className="text-slate-400 dark:text-slate-500 truncate max-w-[200px] sm:max-w-xs">
              ({airQuality.stationName})
            </span>
          </div>
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: theme.hex }}
          />
          <span>{airQuality.category} Air Quality</span>
        </div>
      </div>

      {/* Hero Body: Radial Gauge + Plain-English Primary Health Action */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-6">
        <div className="md:col-span-5 flex justify-center py-2 relative">
          <AQIRadialGauge aqi={airQuality.aqi} category={airQuality.category} size={190} />
        </div>

        <div className="md:col-span-7 flex flex-col justify-center space-y-3.5">
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-slate-700 dark:text-teal-400" aria-hidden="true" />
            <span>Primary Atmospheric Health Action</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
            {airQuality.primaryHealthAction ||
              `Elevated particulate levels in ${airQuality.city}. Prioritize midday ventilation windows.`}
          </h2>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/90 dark:bg-slate-800/80 p-3 backdrop-blur-sm">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                Dominant Vector
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                {airQuality.dominantPollutant}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Alveolar penetrative fine particulate
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/90 dark:bg-slate-800/80 p-3 backdrop-blur-sm">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                {airQuality.isFallback ? 'Baseline PM2.5' : 'Live PM2.5 Load'}
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {pm25 !== null ? (
                  <>
                    {pm25} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">µg/m³</span>
                  </>
                ) : (
                  'N/A'
                )}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                {pm25 !== null
                  ? `${(pm25 / 15).toFixed(1)}x WHO 24h Threshold`
                  : 'Station did not report PM2.5'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
