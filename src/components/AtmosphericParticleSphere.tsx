'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getAQITheme } from '@/lib/constants';
import { AQICategory } from '@/types/aqi';

interface AtmosphericParticleSphereProps {
  aqi: number;
  category: AQICategory;
  size?: number;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  radius: number;
  baseAlpha: number;
}

export const AtmosphericParticleSphere: React.FC<AtmosphericParticleSphereProps> = ({
  aqi,
  category,
  size = 220,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);
  const theme = getAQITheme(category);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMotionChange);
    return () => mediaQuery.removeEventListener('change', handleMotionChange);
  }, []);

  useEffect(() => {
    if (!mounted || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Particle density and speed calibrated to AQI
    const particleCount = Math.min(130, Math.max(35, Math.round(aqi * 0.28)));
    const rotationSpeed = Math.min(0.016, 0.004 + (aqi / 500) * 0.012);
    const sphereRadius = size * 0.38;
    const center = size / 2;

    // Generate 3D spherical points (Fibonacci sphere distribution)
    const particles: Particle3D[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const r = sphereRadius * (0.8 + Math.random() * 0.35);
      particles.push({
        x: Math.cos(theta) * radiusAtY * r,
        y: y * r,
        z: Math.sin(theta) * radiusAtY * r,
        radius: 1.2 + Math.random() * 2.2,
        baseAlpha: 0.25 + Math.random() * 0.55,
      });
    }

    let angleY = 0;
    let angleX = 0.25;
    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      angleY += rotationSpeed;
      angleX += rotationSpeed * 0.4;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Depth camera constant
      const cameraDistance = sphereRadius * 2.5;

      // Sort particles by depth for correct painter's algorithm
      const projected = particles.map((p) => {
        // Rotate around Y
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;

        // Rotate around X
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        const scale = cameraDistance / (cameraDistance + z2);
        const projX = center + x1 * scale;
        const projY = center + y2 * scale;
        const depthAlpha = Math.max(0.1, Math.min(1, (z2 + sphereRadius) / (sphereRadius * 2)));

        return {
          x: projX,
          y: projY,
          z: z2,
          radius: p.radius * scale,
          alpha: p.baseAlpha * depthAlpha,
        };
      });

      projected.sort((a, b) => a.z - b.z);

      // Render particles
      projected.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.6, p.radius), 0, Math.PI * 2);
        ctx.fillStyle = theme.hex;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted, prefersReducedMotion, aqi, theme.hex, size]);

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ opacity: 0.85 }}
    >
      {/* Pure CSS ambient gradient fallback */}
      <div
        className="absolute w-44 h-44 rounded-full blur-2xl transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${theme.glowHex} 0%, transparent 70%)`,
        }}
      />

      {/* 3D Canvas Layer */}
      {mounted && !prefersReducedMotion && (
        <canvas
          ref={canvasRef}
          style={{ width: size, height: size }}
          className="relative z-0"
        />
      )}
    </div>
  );
};
