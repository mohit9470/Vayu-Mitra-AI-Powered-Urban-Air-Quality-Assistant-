import React, { useState } from 'react';
import { CheckSquare, Square, CheckCircle, Sparkles } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  category: string;
}

interface AdoptedChecklistProps {
  items: ChecklistItem[];
}

export const AdoptedChecklist: React.FC<AdoptedChecklistProps> = ({ items }) => {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set(['chk-1']));

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const completedCount = checkedIds.size;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-semibold text-slate-900">Adopted for Today (Interactive Checklist)</h2>
            <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              {completedCount} / {totalCount} Done
            </span>
          </div>
          <p className="text-xs text-slate-500">Track and commit to your daily clean air interventions</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full sm:w-48">
          <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
            <span>Commitment</span>
            <span className="font-mono text-teal-700">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
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
              onClick={() => toggleCheck(item.id)}
              className={`w-full flex items-start space-x-3 p-3 rounded-xl border text-left transition-all ${
                isDone
                  ? 'bg-emerald-50/50 border-emerald-300 text-slate-900'
                  : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="mt-0.5 text-teal-600 flex-shrink-0">
                {isDone ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <span className={`text-xs font-medium block leading-snug ${isDone ? 'line-through text-slate-500' : ''}`}>
                  {item.text}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  {item.category}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {progressPercent === 100 && (
        <div className="mt-4 p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-semibold flex items-center space-x-2 border border-emerald-300">
          <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Maximum protection achieved today! Your family&apos;s exposure is minimized.</span>
        </div>
      )}
    </div>
  );
};
