'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[VayuMitra Runtime Error]:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold tracking-tight">Something went wrong</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          An unexpected issue occurred while loading atmospheric telemetry. Your saved settings are intact.
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-teal-600 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-teal-500 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}
