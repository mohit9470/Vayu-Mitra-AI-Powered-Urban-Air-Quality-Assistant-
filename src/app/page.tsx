'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { PersistentBanner } from '@/components/PersistentBanner';
import { BentoHeroCard } from '@/components/BentoHeroCard';
import { ForecastSparkline } from '@/components/ForecastSparkline';
import { PollutantBentoGrid } from '@/components/PollutantBentoGrid';
import { VulnerableGroupCard } from '@/components/VulnerableGroupCard';
import { TiltCard } from '@/components/TiltCard';
import { JudgePresets } from '@/components/JudgePresets';
import { PersonaSelector } from '@/components/PersonaSelector';
import { ActionCards } from '@/components/ActionCards';
import { ImpactBreakdown } from '@/components/ImpactBreakdown';
import { AdoptedChecklist } from '@/components/AdoptedChecklist';
import { AirQualityData, JudgePreset, RecommendationResponse, UserContext } from '@/types/aqi';
import { JUDGE_PRESETS } from '@/lib/constants';

export default function Dashboard() {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('delhi-family');
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [userContext, setUserContext] = useState<UserContext>({
    city: 'Delhi',
    persona: 'parent_kids',
    routine: {
      morningOutdoorTime: '07:00 - 08:30 (Stroller / School Bus)',
      commuteTime: '08:45 - 09:30',
      commuteMode: 'car_cab',
      eveningOutdoorTime: '17:30 - 18:30 (Playground)',
      hasAirPurifier: true,
      indoorPlants: true,
    },
  });

  const [plan, setPlan] = useState<RecommendationResponse | null>(null);
  const [isLoadingAQI, setIsLoadingAQI] = useState<boolean>(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState<boolean>(false);

  const fetchPlanForContext = useCallback(async (context: UserContext) => {
    setIsLoadingPlan(true);
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.airQuality) setAirQuality(json.airQuality);
        if (json.plan) setPlan(json.plan);
      }
    } catch (err) {
      console.error('Failed to load plan:', err);
    } finally {
      setIsLoadingPlan(false);
    }
  }, []);

  const refreshAQI = async () => {
    if (!userContext.city) return;
    setIsLoadingAQI(true);
    try {
      const response = await fetch(`/api/aqi?city=${encodeURIComponent(userContext.city)}`);
      if (response.ok) {
        const data = await response.json();
        setAirQuality(data);
      }
    } catch (err) {
      console.error('Failed to refresh AQI:', err);
    } finally {
      setIsLoadingAQI(false);
    }
  };

  useEffect(() => {
    fetchPlanForContext(userContext);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectPreset = (preset: JudgePreset) => {
    setSelectedPresetId(preset.id);
    const updatedContext: UserContext = {
      city: preset.city,
      persona: preset.persona,
      routine: preset.routine,
    };
    setUserContext(updatedContext);
    fetchPlanForContext(updatedContext);
  };

  const handleContextChange = (updated: UserContext) => {
    setSelectedPresetId(null);
    setUserContext(updated);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-slate-800 selection:text-white">
      <Header />

      <PersistentBanner
        airQuality={airQuality}
        isLoading={isLoadingAQI}
        onRefresh={refreshAQI}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7">
        {/* Judge & Evaluator Presets Banner */}
        <JudgePresets
          selectedPresetId={selectedPresetId}
          onSelectPreset={handleSelectPreset}
        />

        {/* SECTION 1: Asymmetric Atmospheric Bento Grid with 3D Depth & Telemetry */}
        {airQuality ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <div>
                <h2 className="text-base font-bold tracking-tight text-[#0F172A]">
                  Atmospheric Telemetry & Exposure Bento Grid
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time CPCB station feeds, 24-hour diurnal forecasts, and clinical vulnerability matrices
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-500 bg-white border border-[#E2E8F0] px-2.5 py-0.5 rounded-full">
                Tactile 3D Grid
              </span>
            </div>

            {/* Bento Grid Layer 1: Hero Card (col-7) + 24-Hour Forecast (col-5) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <div className="lg:col-span-7 flex">
                <TiltCard className="w-full flex" maxTilt={4}>
                  <BentoHeroCard airQuality={airQuality} />
                </TiltCard>
              </div>
              <div className="lg:col-span-5 flex">
                <TiltCard className="w-full flex" maxTilt={4}>
                  <ForecastSparkline
                    forecast={airQuality.hourlyForecast || []}
                    cityName={airQuality.city}
                  />
                </TiltCard>
              </div>
            </div>

            {/* Bento Grid Layer 2: Chemical Speciation (col-6) + Vulnerable Group Matrix (col-6) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <div className="lg:col-span-6 flex">
                <TiltCard className="w-full flex" maxTilt={4}>
                  <PollutantBentoGrid
                    pollutants={airQuality.pollutants}
                    dominant={airQuality.dominantPollutant}
                  />
                </TiltCard>
              </div>
              <div className="lg:col-span-6 flex">
                <TiltCard className="w-full flex" maxTilt={4}>
                  <VulnerableGroupCard
                    aqi={airQuality.aqi}
                    category={airQuality.category}
                  />
                </TiltCard>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center animate-pulse">
            <span className="text-sm font-semibold text-slate-500">
              Synchronizing with Indian Central Atmospheric Telemetry Bus...
            </span>
          </div>
        )}

        {/* SECTION 2: Household Persona & Routine Context Form */}
        <div className="pt-2">
          <PersonaSelector
            userContext={userContext}
            onChangeUserContext={handleContextChange}
            onGenerate={() => fetchPlanForContext(userContext)}
            isLoading={isLoadingPlan}
          />
        </div>

        {/* SECTION 3: The 3 Core Functional Pillars (Actionable Plans) */}
        {plan && (
          <div className="space-y-6 pt-3">
            <div className="border-t border-[#E2E8F0] pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-[#0F172A]">
                    {plan.personaTitle}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Interpreted strictly for {plan.city} • CPCB Station AQI: <span className="font-mono font-bold">{plan.liveAQI}</span> ({plan.category})
                  </p>
                </div>
              </div>

              <ActionCards plan={plan} />
            </div>

            {/* Impact & Justification */}
            <ImpactBreakdown plan={plan} />

            {/* Interactive Checklist: Adopted for Today */}
            <AdoptedChecklist items={plan.actionChecklist} />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-[#E2E8F0] py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-700 mb-1">
            VayuMitra — Urban Air Quality Assistant (PromptWars Virtual Challenge 6)
          </p>
          <p>
            Atmospheric Bento Grid & 4D Tactile Telemetry • Zero AQI Hallucination Architecture • 100% Web Software
          </p>
        </div>
      </footer>
    </div>
  );
}
