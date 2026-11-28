import { describe, it, expect } from 'vitest';
import { computeGaugeMetrics, MAX_AQI_SCALE } from '../components/AQIRadialGauge';

describe('AQIRadialGauge Geometry & Clamping', () => {
  it('strictly clamps progress and dashoffset within valid bounds [0, MAX_AQI_SCALE]', () => {
    const neg = computeGaugeMetrics(-45, 190);
    expect(neg.clampedAQI).toBe(0);
    expect(neg.progress).toBe(0);
    expect(neg.targetOffset).toBeCloseTo(neg.arcLength, 6);

    const zero = computeGaugeMetrics(0, 190);
    expect(zero.progress).toBe(0);
    expect(zero.targetOffset).toBeCloseTo(zero.arcLength, 6);

    const mid = computeGaugeMetrics(250, 190);
    expect(mid.progress).toBe(0.5);
    expect(mid.targetOffset).toBeCloseTo(mid.arcLength * 0.5, 6);

    const max = computeGaugeMetrics(MAX_AQI_SCALE, 190);
    expect(max.progress).toBe(1);
    expect(max.targetOffset).toBe(0);

    const over = computeGaugeMetrics(999, 190);
    expect(over.clampedAQI).toBe(MAX_AQI_SCALE);
    expect(over.progress).toBe(1);
    expect(over.targetOffset).toBe(0);
  });

  it('safely handles NaN and Infinity without breaking SVG math', () => {
    const nanMetrics = computeGaugeMetrics(Number.NaN, 190);
    expect(nanMetrics.clampedAQI).toBe(0);
    expect(nanMetrics.progress).toBe(0);
    expect(Number.isFinite(nanMetrics.targetOffset)).toBe(true);

    const infMetrics = computeGaugeMetrics(Number.POSITIVE_INFINITY, 190);
    expect(infMetrics.clampedAQI).toBe(0);
    expect(Number.isFinite(infMetrics.targetOffset)).toBe(true);
  });

  it('keeps SVG arc geometry constant and prevents dasharray wrap-around overlap', () => {
    const low = computeGaugeMetrics(45, 190);
    const cross180 = computeGaugeMetrics(388, 190);
    expect(low.trackPath).toBe(cross180.trackPath);
    expect(low.trackPath).toContain(' 1 1 '); // Fixed largeArcFlag=1 and clockwise sweepFlag=1
    expect(low.circumference).toBeGreaterThan(low.arcLength);
  });
});
