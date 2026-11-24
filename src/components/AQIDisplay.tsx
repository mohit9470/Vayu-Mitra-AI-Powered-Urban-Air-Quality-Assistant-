import React from 'react';
import { MapPin, AlertTriangle, Info, Clock, Gauge } from 'lucide-react';
import { AirQualityData } from '@/types/aqi';
import { getAQIStyle } from '@/lib/constants';

interface AQIDisplayProps {
  airQuality: AirQualityData;
}

export const AQIDisplay: React.FC<AQIDisplayProps> = ({ airQuality }) => {
  const style = getAQIStyle(airQuality.category);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-700">{airQuality.city}, {airQuality.state || airQuality.country}</span>
            <span>•</span>
            <span className="truncate max-w-xs">{airQuality.stationName}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Live Atmospheric Monitor
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Official CPCB AQI</div>
            <div className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
              {airQuality.aqi}
            </div>
          </div>
          <div className={`px-4 py-2 rounded-xl text-white font-semibold text-sm shadow-sm ${style.color}`}>
            {airQuality.category}
          </div>
        </div>
      </div>

      {/* Pollutant Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>PM2.5</span>
            <span className="text-[10px] text-teal-600 bg-teal-50 px-1 rounded">Primary</span>
          </div>
          <div className="text-xl font-bold text-slate-800 font-mono">
            {airQuality.pollutants.pm25} <span className="text-xs font-normal text-slate-500">µg/m³</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">WHO Limit: 15 µg/m³</div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            PM10
          </div>
          <div className="text-xl font-bold text-slate-800 font-mono">
            {airQuality.pollutants.pm10} <span className="text-xs font-normal text-slate-500">µg/m³</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Coarse dust particles</div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            NO2 (Traffic)
          </div>
          <div className="text-xl font-bold text-slate-800 font-mono">
            {airQuality.pollutants.no2 || 42.0} <span className="text-xs font-normal text-slate-500">µg/m³</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Vehicular emission tag</div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Dominant
          </div>
          <div className="text-xl font-bold text-teal-700 font-mono">
            {airQuality.dominantPollutant}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Health critical vector</div>
        </div>
      </div>

      {/* Advisory Banner */}
      <div className={`mt-5 p-3.5 rounded-xl border text-xs flex items-start space-x-2.5 ${style.bgLight} ${style.border}`}>
        <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.textColor}`} />
        <div>
          <span className={`font-semibold ${style.textColor}`}>
            Health Threshold Notice:
          </span>{' '}
          <span className="text-slate-700">
            {airQuality.aqi > 300
              ? 'Severe winter inversion trapping toxic fine particulates. Outdoor exercise is strictly contraindicated; seal indoor boundaries.'
              : airQuality.aqi > 200
              ? 'Unhealthy ambient levels for sensitive groups and children. Shift all high-effort activities to midday.'
              : 'Moderate particulate load. Keep indoor spaces well-ventilated during midday hours.'}
          </span>
        </div>
      </div>
    </div>
  );
};
