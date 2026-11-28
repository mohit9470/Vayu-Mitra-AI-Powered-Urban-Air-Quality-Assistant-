import React, { useState } from 'react';
import { ShieldAlert, Baby, HeartPulse, Activity } from 'lucide-react';

interface VulnerableGroupCardProps {
  aqi: number;
}

type GroupKey = 'children' | 'elderly' | 'respiratory';

export const VulnerableGroupCard: React.FC<VulnerableGroupCardProps> = ({ aqi }) => {
  const [selectedGroup, setSelectedGroup] = useState<GroupKey>('children');

  const isCritical = aqi > 250;
  const isElevated = aqi > 150;

  const groups = {
    children: {
      label: 'Children & Infants',
      icon: Baby,
      vulnerability: 'Higher respiration rate per kg body weight; airway branching is still developing.',
      riskStatus: isCritical ? 'Critical Hazard' : isElevated ? 'Moderate Risk' : 'Low Exposure Risk',
      guidance: [
        'Move school recess & sports activities strictly indoors or after 1:00 PM.',
        'Stroller rides should be equipped with an electrostatic shield to avoid tailpipe-level plumes.',
        'Ensure school transit bus windows remain sealed during arterial road transit.',
      ],
    },
    elderly: {
      label: 'Elderly Citizens',
      icon: HeartPulse,
      vulnerability: 'Decreased cardiopulmonary reserve; cold-induced vasoconstriction multiplies cardiac stress.',
      riskStatus: isCritical ? 'High Cardiac Strain' : isElevated ? 'Moderate Precaution' : 'Safe for Walking',
      guidance: [
        'Cancel pre-dawn and early morning (05:30 – 08:00 AM) park walks completely.',
        'Carry out light stretching or seated yoga indoors until midday ambient temperatures climb.',
        'Keep emergency pulmonary inhalers and blood pressure medications readily accessible.',
      ],
    },
    respiratory: {
      label: 'Asthma / Bronchitis',
      icon: Activity,
      vulnerability: 'Hyper-reactive bronchial epithelium triggered directly by PM2.5 and nitrogen dioxide.',
      riskStatus: aqi > 200 ? 'Severe Bronchospasm Alert' : isElevated ? 'Elevated Trigger Risk' : 'Advisory Mode',
      guidance: [
        'Pre-treat with prescribed prophylactic inhalers prior to mandatory outdoor commutes.',
        'Wear a certified, headstrap-fitted N95 respirator whenever outside.',
        'Position bedroom HEPA air purifiers at least 1m away from walls in continuous night mode.',
      ],
    },
  };

  const active = groups[selectedGroup];
  const Icon = active.icon;
  const riskBadgeClass =
    aqi > 200
      ? 'text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800'
      : isElevated
      ? 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800'
      : 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between w-full transition-colors">
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <ShieldAlert className="w-4 h-4 text-slate-700 dark:text-teal-400" aria-hidden="true" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Vulnerable Population Atmospheric Advisory
          </h3>
        </div>

        {/* Group Selector Pills */}
        <div
          className="flex space-x-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 border border-slate-200/80 dark:border-slate-700"
          role="tablist"
          aria-label="Vulnerable population groups"
        >
          {(Object.keys(groups) as GroupKey[]).map((key) => {
            const isCurrent = selectedGroup === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                onClick={() => setSelectedGroup(key)}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {groups[key].label}
              </button>
            );
          })}
        </div>

        {/* Selected Group Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                {active.label}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                {active.vulnerability}
              </span>
            </div>
          </div>

          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex-shrink-0 ${riskBadgeClass}`}>
            {active.riskStatus}
          </span>
        </div>

        {/* Clinical Guidance Checklist */}
        <div className="space-y-2 mt-4">
          {active.guidance.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/70"
            >
              <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">
                {idx + 1}
              </div>
              <span className="leading-snug">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 mt-4">
        Clinical protocol based on Indian Chest Society &amp; WHO atmospheric exposure standards.
      </div>
    </div>
  );
};
