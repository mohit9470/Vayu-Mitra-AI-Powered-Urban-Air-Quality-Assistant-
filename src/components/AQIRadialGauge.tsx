import React, { useId } from 'react';
import { getAQITheme } from '@/lib/constants';
import { AQICategory } from '@/types/aqi';

interface AQIRadialGaugeProps {
  aqi: number;
  category: AQICategory;
  size?: number;
}

export const AQIRadialGauge: React.FC<AQIRadialGaugeProps> = ({
  aqi,
  category,
  size = 200,
}) => {
  const gradientId = useId();
  const theme = getAQITheme(category);
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  const startAngle = 150;
  const endAngle = 390;
  const totalAngle = endAngle - startAngle;

  const clampedAQI = Math.min(Math.max(aqi, 0), 500);
  const percentage = clampedAQI / 500;
  const currentAngle = startAngle + percentage * totalAngle;

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, startA: number, endA: number) => {
    const start = polarToCartesian(x, y, r, endA);
    const end = polarToCartesian(x, y, r, startA);
    const largeArcFlag = endA - startA <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const bgArc = describeArc(center, center, radius, startAngle, endAngle);
  const activeArc = describeArc(center, center, radius, startAngle, currentAngle);

  return (
    <div
      role="img"
      aria-label={`Indian AQI ${aqi}, ${category}`}
      className="relative flex flex-col items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="overflow-visible text-slate-200 dark:text-slate-800" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.hex} stopOpacity="0.85" />
            <stop offset="100%" stopColor={theme.hex} stopOpacity="1" />
          </linearGradient>
        </defs>

        <path
          d={bgArc}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {percentage > 0.01 && (
          <path
            d={activeArc}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Indian AQI
        </span>
        <span className="text-5xl font-black text-slate-900 dark:text-white font-mono tabular-nums tracking-tighter leading-none mt-1">
          {aqi}
        </span>
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full mt-2 border ${theme.pillBg} ${theme.pillText} ${theme.pillBorder}`}
        >
          {category}
        </span>
      </div>
    </div>
  );
};
