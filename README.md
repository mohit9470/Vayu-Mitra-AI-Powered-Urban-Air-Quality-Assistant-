# VayuMitra — AI-Powered Urban Air Quality Assistant

> A 100% web-based application helping families and urban communities navigate air pollution through live atmospheric telemetry, personalized daily routines, indoor air quality actions, and zero-hallucination Generative AI guidance.

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Passing-green?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![SonarQube](https://img.shields.io/badge/SonarQube-Configured-4E9BCD?style=for-the-badge&logo=sonarqube)](sonar-project.properties)

---

## Key Capabilities

1. **Live GPS Location & Automatic Live Fetching**:
   - Browser geolocation support (`Use My Live Location`) resolves user coordinates and fetches real-time air quality automatically.
   - Selecting any city auto-fetches live telemetry and updates recommendations immediately, backed by an **Auto-Live (5-minute)** background sync toggle.
   - Multi-tier atmospheric ingestion: **WAQI (CPCB Network)** when `WAQI_API_TOKEN` is configured, zero-key **Open-Meteo Live Atmospheric Feed** (computing official Indian CPCB AQI), and calibrated offline baselines when disconnected.
2. **Zero-Hallucination AQI Grounding**:
   - Strict separation between atmospheric ingestion and GenAI reasoning: missing pollutants report `N/A`, offline baselines are clearly flagged in the banner, and Gemini never invents AQI figures.
3. **Three Core Action Pillars**:
   - **Outdoor Timing & Low-Emission Routines**: Shifts outdoor play, exercise, and commutes away from morning thermal inversions to midday solar mixing windows.
   - **Indoor Air Quality (IAQ) Hacks**: Micro-ventilation windows, damp microfiber mopping, air purifier placement, and MERV-13 DIY filtration.
   - **Sustainable Alternatives & Impact Justification**: Quantified personal inhaled PM2.5 reduction estimates and CO2/NOx emission savings.
4. **Adaptive Light & Dark Mode + Production Hardening**:
   - Persistent theme toggle (`Light` / `Dark` mode synced with `localStorage` and OS preference with zero paint flash).
   - Saved user context in `localStorage`, HTTP security headers in `next.config.js`, and React App Router `error.tsx` / `not-found.tsx` boundaries.

---

## System Architecture

```
┌────────────────────────────────────────────────────────┐
│            Frontend Client (Next.js 14 + Dark UI)      │
│  - Persistent Live / Baseline Attribution Banner       │
│  - Location & Live GPS Selector + Auto-Sync Toggle     │
│  - Persona, Transit Mode & Routine Persistence         │
│  - 3D Particle Canvas & Radial Exposure Gauge          │
│  - 24-Hour Diurnal Curve & WHO Speciation Grid         │
│  - 3 Pillar Action Cards & Daily Commitment Checklist  │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS REST
┌──────────────────────────▼─────────────────────────────┐
│               API Gateway (Next.js App Router)         │
│                                                        │
│  ┌───────────────────────┐   ┌──────────────────────┐  │
│  │   GET /api/aqi        │   │  POST /api/recommend │  │
│  │  - City or lat/lon    │   │  - Input validation  │  │
│  │  - Bounded TTL cache  │   │  - Grounded context  │  │
│  └───────────┬───────────┘   └──────────┬───────────┘  │
│              └─────────────┬────────────┘              │
│                            ▼                           │
│        ┌───────────────────────────────────────┐       │
│        │  GenAI Reasoning Engine (Gemini API)  │       │
│        │  - x-goog-api-key Auth + Timeout      │       │
│        │  - Runtime JSON Schema Validation     │       │
│        │  - Deterministic Fail-Safe Engine     │       │
│        └───────────────────────────────────────┘       │
└────────────────────────────────────────────────────────┘
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional)
```bash
cp .env.example .env.local
```
Set `GEMINI_API_KEY` (Google AI Studio) and optionally `WAQI_API_TOKEN`. Even without API tokens, VayuMitra uses the zero-key Open-Meteo live atmospheric grid and calibrated deterministic reasoning engine.

### 3. Verify & Run
```bash
npm test
npm run lint
npm run build
npm start
```
For local development:
```bash
npm run dev
```
Open https://vayumitra-rosy.vercel.app/
