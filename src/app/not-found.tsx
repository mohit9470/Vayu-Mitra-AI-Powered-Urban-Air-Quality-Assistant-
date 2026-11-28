import Link from 'next/link';
import { Wind, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 flex items-center justify-center mx-auto">
          <Wind className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Page Not Found</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          The page you requested does not exist. Return to the live air quality monitor to check conditions in your area.
        </p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-teal-600 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-teal-500 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Back to VayuMitra</span>
        </Link>
      </div>
    </div>
  );
}
