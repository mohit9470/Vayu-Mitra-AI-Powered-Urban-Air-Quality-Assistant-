'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Header } from '@/components/Header';
import { PersistentBanner } from '@/components/PersistentBanner';
import { BentoHeroCard } from '@/components/BentoHeroCard';
import { ForecastSparkline } from '@/components/ForecastSparkline';
import { PollutantBentoGrid } from '@/components/PollutantBentoGrid';
import { VulnerableGroupCard } from '@/components/VulnerableGroupCard';
import { TiltCard } from '@/components/TiltCard';
import { LocationQuickBar } from '@/components/LocationQuickBar';
import { PersonaSelector } from '@/components/PersonaSelector';
import { ActionCards } from '@/components/ActionCards';
import { ImpactBreakdown } from '@/components/ImpactBreakdown';
import { AdoptedChecklist } from '@/components/AdoptedChecklist';
import { VALID_COMMUTE_MODES, VALID_PERSONAS } from '@/lib/constants';
import {
  AirQualityData,
  Coordinates,
  RecommendationResponse,
  UserContext,
} from '@/types/aqi';

const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const CONTEXT_STORAGE_KEY = 'vayumitra_user_context';

const DEFAULT_CONTEXT: UserContext = {
  city: 'Delhi',
  persona: 'daily_commuter',
  routine: {
    morningOutdoorTime: '08:30 - 09:30',
    commuteTime: '08:30 - 09:30',
    commuteMode: 'metro_transit',
    hasAirPurifier: false,
    indoorPlants: true,
  },
};

function readSavedContext(): UserContext {
  try {
    const raw = localStorage.getItem(CONTEXT_STORAGE_KEY);
    if (!raw) return DEFAULT_CONTEXT;
    const parsed = JSON.parse(raw) as Partial<UserContext>;
    if (!parsed || typeof parsed !== 'object') return DEFAULT_CONTEXT;
    const persona =
      parsed.persona && VALID_PERSONAS.has(parsed.persona)
        ? parsed.persona
        : DEFAULT_CONTEXT.persona;
    const city =
      typeof parsed.city === 'string' && parsed.city.trim().length >= 2
        ? parsed.city.trim().slice(0, 60)
        : DEFAULT_CONTEXT.city;
    const r = parsed.routine;
    const commuteMode =
      r?.commuteMode && VALID_COMMUTE_MODES.has(r.commuteMode)
        ? r.commuteMode
        : DEFAULT_CONTEXT.routine.commuteMode;
    return {
      city,
      persona,
      routine: {
        morningOutdoorTime:
          typeof r?.morningOutdoorTime === 'string'
            ? r.morningOutdoorTime.slice(0, 80)
            : DEFAULT_CONTEXT.routine.morningOutdoorTime,
        commuteTime:
          typeof r?.commuteTime === 'string'
            ? r.commuteTime.slice(0, 80)
            : DEFAULT_CONTEXT.routine.commuteTime,
        commuteMode,
        hasAirPurifier: Boolean(r?.hasAirPurifier),
        indoorPlants: r?.indoorPlants !== undefined ? Boolean(r.indoorPlants) : true,
      },
    };
  } catch {
    return DEFAULT_CONTEXT;
  }
}

export default function Dashboard() {
  const [liveCoords, setLiveCoords] = useState<Coordinates | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [userContext, setUserContext] = useState<UserContext>(DEFAULT_CONTEXT);
  const [plan, setPlan] = useState<RecommendationResponse | null>(null);
  const [isLoadingAQI, setIsLoadingAQI] = useState<boolean>(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const userContextRef = useRef(userContext);
  userContextRef.current = userContext;
  const liveCoordsRef = useRef(liveCoords);
  liveCoordsRef.current = liveCoords;

  const persistContext = (ctx: UserContext) => {
    try {
      localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(ctx));
    } catch {
      // Ignore storage quota/privacy restrictions
    }
  };

  const fetchPlanForContext = useCallback(
    async (context: UserContext, coords?: Coordinates | null, forceRefresh = false) => {
      setIsLoadingPlan(true);
      setErrorNotice(null);
      try {
        const response = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...context,
            coordinates: coords ?? undefined,
            forceRefresh,
          }),
        });

        if (response.ok) {
          const json = await response.json();
          if (json.airQuality) {
            setAirQuality(json.airQuality);
            if (coords && json.airQuality.city) {
              setUserContext((prev) => {
                const synced = { ...prev, city: json.airQuality.city };
                persistContext(synced);
                return synced;
              });
            }
          }
          if (json.plan) setPlan(json.plan);
        } else {
          setErrorNotice('Unable to fetch live telemetry plan. Please verify inputs or retry.');
        }
      } catch (err) {
        console.error('Failed to load plan:', err);
        setErrorNotice('Network or telemetry connection interruption. Please retry in a moment.');
      } finally {
        setIsLoadingPlan(false);
      }
    },
    []
  );

  const refreshAQI = useCallback(async (forceRefresh = true) => {
    const activeCoords = liveCoordsRef.current;
    const activeCity = userContextRef.current.city;
    if (!activeCoords && !activeCity) return;

    setIsLoadingAQI(true);
    setErrorNotice(null);
    try {
      const params = activeCoords
        ? `lat=${encodeURIComponent(activeCoords.latitude)}&lon=${encodeURIComponent(activeCoords.longitude)}`
        : `city=${encodeURIComponent(activeCity)}`;
      const freshParam = forceRefresh ? '&fresh=1' : '';
      const response = await fetch(`/api/aqi?${params}${freshParam}`);
      if (response.ok) {
        const data: AirQualityData = await response.json();
        setAirQuality(data);
      } else {
        setErrorNotice('Unable to refresh station feed at this moment. Showing latest recorded metrics.');
      }
    } catch (err) {
      console.error('Failed to refresh AQI:', err);
      setErrorNotice('Station synchronization failed. Showing cached data.');
    } finally {
      setIsLoadingAQI(false);
    }
  }, []);

  // Request live browser location on app initialization and fetch local AQI
  useEffect(() => {
    const initial = readSavedContext();
    setUserContext(initial);

    let cancelled = false;
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setErrorNotice('Geolocation is not supported in this browser. Showing saved city telemetry.');
      fetchPlanForContext(initial, null, false);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        const coords: Coordinates = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setLiveCoords(coords);
        setIsLocating(false);
        fetchPlanForContext(initial, coords, true);
      },
      (geoError) => {
        if (cancelled) return;
        setIsLocating(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setErrorNotice('Location permission was denied. Showing saved city telemetry; you can switch cities below.');
        }
        fetchPlanForContext(initial, null, false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );

    return () => {
      cancelled = true;
    };
  }, [fetchPlanForContext]);

  // Automatic 5-minute background live data fetching
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    const intervalId = window.setInterval(() => {
      if (typeof document === 'undefined' || !document.hidden) {
        refreshAQI(true);
      }
    }, AUTO_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [autoRefreshEnabled, refreshAQI]);

  const handleSelectCity = (city: string) => {
    setLiveCoords(null);
    const updated: UserContext = { ...userContext, city };
    setUserContext(updated);
    persistContext(updated);
    fetchPlanForContext(updated, null, true);
  };

  const handleUseLiveLocation = () => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setErrorNotice('Geolocation is not supported in this browser. Choose a city above or below.');
      return;
    }

    setIsLocating(true);
    setErrorNotice(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLiveCoords(coords);
        setIsLocating(false);
        fetchPlanForContext(userContextRef.current, coords, true);
      },
      (geoError) => {
        setIsLocating(false);
        const msg =
          geoError.code === geoError.PERMISSION_DENIED
            ? 'Location permission was denied. Allow browser location access or select a city.'
            : 'Unable to determine your GPS coordinates right now. Please select a city or retry.';
        setErrorNotice(msg);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleContextChange = (updated: UserContext) => {
    setUserContext(updated);
    persistContext(updated);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-slate-800 selection:text-white transition-colors">
      <Header />

      <PersistentBanner
        airQuality={airQuality}
        isLoading={isLoadingAQI}
        onRefresh={() => refreshAQI(true)}
        autoRefreshEnabled={autoRefreshEnabled}
        onToggleAutoRefresh={() => setAutoRefreshEnabled((prev) => !prev)}
      />

      {errorNotice && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div
            className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-xl px-4 py-3 flex items-center justify-between text-xs shadow-sm"
            role="alert"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" aria-hidden="true" />
              <span className="font-medium">{errorNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorNotice(null)}
              className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-white p-1 rounded-md"
              aria-label="Dismiss alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7">
        {/* Live Location Monitor Bar */}
        <LocationQuickBar
          activeCity={airQuality?.city || userContext.city}
          coordinates={liveCoords}
          onUseLiveLocation={handleUseLiveLocation}
          isLocating={isLocating}
          isLiveLocationActive={liveCoords !== null}
        />

        {/* SECTION 1: Balanced Atmospheric Bento Grid */}
        {airQuality ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  Atmospheric Telemetry &amp; Exposure Overview
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Live station feeds, 24-hour diurnal forecasts, and clinical vulnerability guidance
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-0.5 rounded-full">
                {autoRefreshEnabled ? 'Auto-Sync Active' : 'Manual Sync'}
              </span>
            </div>

            {/* Bento Grid Layer 1 */}
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

            {/* Bento Grid Layer 2 */}
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
                  <VulnerableGroupCard aqi={airQuality.aqi} />
                </TiltCard>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center">
            {!isLoadingPlan && errorNotice ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Could not load initial atmospheric telemetry.
                </p>
                <button
                  type="button"
                  onClick={() => fetchPlanForContext(userContext, liveCoords, true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-teal-600 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-teal-500 transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            ) : (
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
                Synchronizing with Atmospheric Telemetry...
              </span>
            )}
          </div>
        )}

        {/* SECTION 2: Household Persona & Routine Context Form */}
        <div className="pt-2">
          <PersonaSelector
            userContext={userContext}
            onChangeUserContext={handleContextChange}
            onSelectCity={handleSelectCity}
            onUseLiveLocation={handleUseLiveLocation}
            onGenerate={() => fetchPlanForContext(userContext, liveCoords, false)}
            isLoading={isLoadingPlan}
            isLocating={isLocating}
            isLiveLocationActive={liveCoords !== null}
          />
        </div>

        {/* SECTION 3: Personalized Action Plan & Impact */}
        {plan && (
          <div className={`space-y-6 pt-3 transition-opacity duration-200 ${isLoadingPlan ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {plan.personaTitle}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Grounded for {plan.city} • Station AQI: <span className="font-mono font-bold">{plan.liveAQI}</span> ({plan.category})
                  </p>
                </div>
                {isLoadingPlan && (
                  <span className="text-xs font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-3 py-1 rounded-full self-start sm:self-auto">
                    Updating recommendations...
                  </span>
                )}
              </div>

              <ActionCards plan={plan} />
            </div>

            <ImpactBreakdown plan={plan} />
            <AdoptedChecklist items={plan.actionChecklist} />
          </div>
        )}
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-12 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
            VayuMitra — AI-Powered Urban Air Quality Assistant
          </p>
          <p>
            Real-Time Atmospheric Telemetry • Zero-Hallucination Grounding • Light &amp; Dark Adaptive UI
          </p>
        </div>
      </footer>
    </div>
  );
}
