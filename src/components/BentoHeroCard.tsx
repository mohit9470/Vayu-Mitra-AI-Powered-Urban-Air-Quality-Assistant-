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

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm transition-all h-full flex flex-col justify-between"
      style={{
        boxShadow: `0 4px 20px -2px rgba(15, 23, 42, 0.05)`,
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
        className="pointer-events-none absolute -left-12 -top-12 h-80 w-80 rounded-full blur-3xl opacity-70 transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${theme.glowHex} 0%, transparent 70%)`,
        }}
      />

      {/* Header telemetry line */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: theme.hex }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: theme.hex }}
            />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Live Telemetry
          </span>
          <span className="text-slate-300">•</span>
          <div className="flex items-center space-x-1 text-xs text-slate-600 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{airQuality.city}</span>
            <span className="text-slate-400">({airQuality.stationName})</span>
          </div>
        </div>

        {/* Status Pill */}
        <div
          className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-xs"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E2E8F0',
            color: '#0F172A',
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: theme.hex }}
          />
          <span>{airQuality.category} Air Quality</span>
        </div>
      </div>

      {/* Hero Body: Radial Gauge + Plain-English Primary Health Action */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-6">
        {/* Radial Gauge Visual */}
        <div className="md:col-span-5 flex justify-center py-2 relative">
          <AQIRadialGauge aqi={airQuality.aqi} category={airQuality.category} size={190} />
        </div>

        {/* Primary Health Action & Clinical Directive */}
        <div className="md:col-span-7 flex flex-col justify-center space-y-3.5">
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-slate-700" />
            <span>Primary Atmospheric Health Action</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-snug">
            {airQuality.primaryHealthAction ||
              `Severe thermal inversion in ${airQuality.city}. Restrict morning outdoor exertion; wait for the midday solar ventilation window.`}
          </h2>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 backdrop-blur-xs">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                Dominant Vector
              </span>
              <span className="text-base font-bold text-slate-900 font-mono">
                {airQuality.dominantPollutant}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Alveolar penetrative fine particulate
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 backdrop-blur-xs">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                Live PM2.5 Load
              </span>
              <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                {airQuality.pollutants.pm25} <span className="text-xs font-normal text-slate-500">µg/m³</span>
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {(airQuality.pollutants.pm25 / 15).toFixed(1)}x WHO 24h Threshold
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
