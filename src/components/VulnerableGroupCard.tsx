import React, { useState } from 'react';
import { ShieldAlert, Baby, HeartPulse, Activity, Check } from 'lucide-react';
import { AQICategory } from '@/types/aqi';

interface VulnerableGroupCardProps {
  aqi: number;
  category: AQICategory;
}

type GroupKey = 'children' | 'elderly' | 'respiratory';

export const VulnerableGroupCard: React.FC<VulnerableGroupCardProps> = ({
  aqi,
  category,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<GroupKey>('children');

  const groups = {
    children: {
      label: 'Children & Infants',
      icon: Baby,
      vulnerability: 'Higher respiration rate per kg body weight; airway branching is still developing.',
      riskStatus: aqi > 250 ? 'Critical Hazard' : aqi > 150 ? 'Moderate Risk' : 'Low Exposure Risk',
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
      riskStatus: aqi > 250 ? 'High Cardiac Strain' : aqi > 150 ? 'Moderate Precaution' : 'Safe for Walking',
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
      riskStatus: aqi > 200 ? 'Severe Bronchospasm Alert' : 'Advisory Mode',
      guidance: [
        'Pre-treat with prescribed prophylactic inhalers prior to mandatory outdoor commutes.',
        'Wear a certified, headstrap-fitted N95 respirator whenever outside.',
        'Position bedroom HEPA air purifiers at least 1m away from walls in continuous night mode.',
      ],
    },
  };

  const active = groups[selectedGroup];
  const Icon = active.icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <ShieldAlert className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Vulnerable Population Atmospheric Advisory
          </h3>
        </div>

        {/* Group Selector Pills */}
        <div className="flex space-x-1.5 p-1 bg-slate-100 rounded-xl mb-4 border border-slate-200/80">
          {(Object.keys(groups) as GroupKey[]).map((key) => {
            const isCurrent = selectedGroup === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedGroup(key)}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
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
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {active.label}
              </span>
              <span className="text-[11px] text-slate-500 leading-snug">
                {active.vulnerability}
              </span>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex-shrink-0">
            {active.riskStatus}
          </span>
        </div>

        {/* Clinical Guidance Checklist */}
        <div className="space-y-2 mt-4">
          {active.guidance.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-2 text-xs text-slate-700 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/60"
            >
              <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">
                {idx + 1}
              </div>
              <span className="leading-snug">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 mt-4">
        Clinical protocol based on Indian Chest Society & WHO atmospheric exposure standards.
      </div>
    </div>
  );
};
