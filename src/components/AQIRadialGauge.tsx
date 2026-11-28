'use client';

import React, { useEffect, useId, useState } from 'react';
import { getAQITheme } from '@/lib/constants';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';
import { AQICategory } from '@/types/aqi';

export const MAX_AQI_SCALE = 500;
const START_ANGLE = 240; // 8 o'clock (symmetric 240° arc centered at 12 o'clock)
const END_ANGLE = 480;   // 4 o'clock
const SWEEP_ANGLE = END_ANGLE - START_ANGLE;

interface AQIRadialGaugeProps {
  aqi: number;
  category: AQICategory;
  size?: number;
}

export interface GaugeMetrics {
  clampedAQI: number;
  progress: number;
  radius: number;
  circumference: number;
  arcLength: number;
  targetOffset: number;
  trackPath: string;
}

function polarToCartesian(centerX: number, centerY: number, r: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + r * Math.cos(angleInRadians),
    y: centerY + r * Math.sin(angleInRadians),
  };
}

/**
 * Computes clamped progress, static clockwise SVG arc geometry, and stroke-dashoffset metrics.
 */
export function computeGaugeMetrics(aqi: number, size = 200, strokeWidth = 14): GaugeMetrics {
  const safeSize = Number.isFinite(size) && size > strokeWidth ? size : 200;
  const radius = (safeSize - strokeWidth) / 2;
  const center = safeSize / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (SWEEP_ANGLE / 360) * circumference;

  const clampedAQI = Number.isFinite(aqi)
    ? Math.min(Math.max(aqi, 0), MAX_AQI_SCALE)
    : 0;
  const progress = Math.min(Math.max(clampedAQI / MAX_AQI_SCALE, 0), 1);
  const targetOffset = Math.min(Math.max(arcLength * (1 - progress), 0), arcLength);

  // Static clockwise 240° arc prevents SVG largeArcFlag flipping or chord inversion
  const start = polarToCartesian(center, center, radius, START_ANGLE);
  const end = polarToCartesian(center, center, radius, END_ANGLE);
  const trackPath = [
    'M',
    start.x.toFixed(3),
    start.y.toFixed(3),
    'A',
    radius,
    radius,
    0,
    1,
    1,
    end.x.toFixed(3),
    end.y.toFixed(3),
  ].join(' ');

  return {
    clampedAQI,
    progress,
    radius,
    circumference,
    arcLength,
    targetOffset,
    trackPath,
  };
}

export const AQIRadialGauge: React.FC<AQIRadialGaugeProps> = ({
  aqi,
  category,
  size = 200,
}) => {
  const gradientId = useId();
  const theme = getAQITheme(category);
  const strokeWidth = 14;
  const metrics = computeGaugeMetrics(aqi, size, strokeWidth);

  const prefersReducedMotion = usePrefersReducedMotion();
  const targetKey = `${metrics.arcLength}:${metrics.targetOffset}`;
  const [anim, setAnim] = useState<{ key: string; offset: number; animate: boolean }>(() => ({
    key: targetKey,
    offset: metrics.arcLength,
    animate: false,
  }));

  const isStale = anim.key !== targetKey;
  const dashOffset = prefersReducedMotion
    ? metrics.targetOffset
    : isStale
      ? metrics.arcLength
      : anim.offset;
  const transitionEnabled = !prefersReducedMotion && !isStale && anim.animate;

  useEffect(() => {
    if (prefersReducedMotion) return;

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setAnim({ key: targetKey, offset: metrics.targetOffset, animate: true });
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [targetKey, metrics.targetOffset, prefersReducedMotion]);

  const displayAQI = Number.isFinite(aqi) ? Math.max(0, Math.round(aqi)) : 0;

  return (
    <div
      role="img"
      aria-label={`Indian AQI ${displayAQI}, ${category}`}
      className="relative flex flex-col items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="overflow-visible text-slate-200 dark:text-slate-800"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={theme.hex} stopOpacity="0.85" />
            <stop offset="100%" stopColor={theme.hex} stopOpacity="1" />
          </linearGradient>
        </defs>

        <path
          d={metrics.trackPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        <path
          d={metrics.trackPath}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${metrics.arcLength} ${metrics.circumference}`}
          style={{
            strokeDashoffset: dashOffset,
            strokeOpacity: metrics.clampedAQI > 0 ? 1 : 0,
            transition: transitionEnabled
              ? 'stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1), stroke-opacity 200ms ease-out'
              : 'none',
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Indian AQI
        </span>
        <span className="text-5xl font-black text-slate-900 dark:text-white font-mono tabular-nums tracking-tighter leading-none mt-1">
          {displayAQI}
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
