import React, { useState } from 'react';
import { CheckSquare, Square, Sparkles } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  category: string;
}

interface AdoptedChecklistProps {
  items: ChecklistItem[];
}

export const AdoptedChecklist: React.FC<AdoptedChecklistProps> = ({ items = [] }) => {
  const [selection, setSelection] = useState<{ items: ChecklistItem[]; ids: Set<string> }>(() => ({
    items,
    ids: new Set(),
  }));
  const checkedIds = selection.items === items ? selection.ids : new Set<string>();

  const toggleCheck = (id: string) => {
    setSelection((prev) => {
      const next = new Set(prev.items === items ? prev.ids : []);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { items, ids: next };
    });
  };

  const completedCount = items.filter((item) => checkedIds.has(item.id)).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Daily Action Checklist
            </h2>
            <span className="text-[11px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
              {completedCount} / {totalCount} Done
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track and commit to your clean air routine for today
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full sm:w-48">
          <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
            <span>Commitment</span>
            <span className="font-mono text-teal-700 dark:text-teal-400">{progressPercent}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Daily action checklist completion"
            className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => {
          const isDone = checkedIds.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isDone}
              onClick={() => toggleCheck(item.id)}
              className={`w-full flex items-start space-x-3 p-3 rounded-xl border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                isDone
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-slate-100'
                  : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800'
              }`}
            >
              <div className="mt-0.5 text-teal-600 dark:text-teal-400 flex-shrink-0">
                {isDone ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                )}
              </div>
              <div className="flex-1">
                <span className={`text-xs font-medium block leading-snug ${isDone ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
                  {item.text}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  {item.category}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {totalCount > 0 && progressPercent === 100 && (
        <div className="mt-4 p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-semibold flex items-center space-x-2 border border-emerald-300 dark:border-emerald-800">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" aria-hidden="true" />
          <span>Maximum protection achieved today! Your household&apos;s exposure is minimized.</span>
        </div>
      )}
    </div>
  );
};
