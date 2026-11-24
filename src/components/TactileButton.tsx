'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'telemetry';
  glowColor?: string;
  className?: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  children,
  onClick,
  disabled,
  variant = 'primary',
  glowColor = '#10B981',
  className = '',
  ...rest
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (!prefersReducedMotion) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 2;

      const newRipple: Ripple = {
        id: Date.now(),
        x: clickX,
        y: clickY,
        size,
      };

      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    }

    if (onClick) {
      onClick(e);
    }
  };

  // Base styles for 3D physical depth
  let variantStyles = '';
  if (variant === 'primary') {
    variantStyles =
      'bg-slate-900 text-white border border-slate-800 shadow-[0_4px_0_#020617,0_8px_16px_-2px_rgba(15,23,42,0.25)] active:translate-y-[3px] active:shadow-[0_1px_0_#020617,0_2px_4px_rgba(15,23,42,0.15)]';
  } else if (variant === 'telemetry') {
    variantStyles =
      'bg-white text-slate-900 border border-slate-300 shadow-[0_3px_0_#cbd5e1,0_6px_12px_-2px_rgba(15,23,42,0.08)] active:translate-y-[2px] active:shadow-[0_1px_0_#cbd5e1,0_2px_4px_rgba(15,23,42,0.05)]';
  } else {
    variantStyles =
      'bg-slate-100 text-slate-800 border border-slate-200 shadow-[0_3px_0_#cbd5e1,0_4px_8px_rgba(0,0,0,0.05)] active:translate-y-[2px] active:shadow-[0_1px_0_#cbd5e1]';
  }

  return (
    <button
      ref={buttonRef}
      disabled={disabled}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden font-semibold rounded-xl transition-all duration-100 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${variantStyles} ${className}`}
      {...rest}
    >
      {/* (b) Cursor-tracking specular light sheen */}
      {mousePos && !disabled && !prefersReducedMotion && (
        <span
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-150"
          style={{
            background: `radial-gradient(circle 80px at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.25) 0%, transparent 80%)`,
          }}
        />
      )}

      {/* (c) Time-based state feedback micro-ripple */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute rounded-full animate-ping opacity-60 z-10"
          style={{
            left: r.x - r.size / 2,
            top: r.y - r.size / 2,
            width: r.size,
            height: r.size,
            background: glowColor,
            animationDuration: '600ms',
          }}
        />
      ))}

      {/* Button content */}
      <span className="relative z-20 flex items-center justify-center space-x-2">
        {children}
      </span>
    </button>
  );
};
