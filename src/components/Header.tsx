'use client';

import React, { useEffect, useState } from 'react';
import { Wind, ShieldCheck, Sun, Moon } from 'lucide-react';

export const Header: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('vayumitra_theme', next ? 'dark' : 'light');
    } catch {
      // Ignore storage errors in restricted browsing modes
    }
  };

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Wind className="w-6 h-6 animate-pulse-slow" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                VayuMitra
              </h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                Live AI
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Real-Time Urban Air Quality &amp; Daily Health Guidance
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>Zero-Hallucination Telemetry</span>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-pressed={isDark}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" aria-hidden="true" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
