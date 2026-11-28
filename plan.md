# VayuMitra — AI-Powered Urban Air Quality Assistant
## Production Architecture & Execution Plan

> **Core Mission**: A 100% web-based production application designed to help families and urban communities navigate severe winter smog and urban air pollution through live atmospheric telemetry and grounded, zero-hallucination Generative AI interventions.

---

## 1. Core Functional Architecture

### 1.1 Three Core Functional Pillars
1. **Low-Emission Daily Routines & Activity Rescheduling**
   - Practical commute timing adjustments and activity rescheduling based on diurnal boundary-layer physics (shifting outdoor runs, school play, and elder walks away from morning smog inversions toward the midday solar convection window).
2. **Actionable Indoor Air Quality (IAQ) Hacks**
   - Micro-ventilation timing (12:30 PM – 2:00 PM), damp microfiber mopping over dry sweeping, HEPA purifier central placement, door draft sealing, and DIY MERV-13 fan filters.
3. **Sustainable Alternatives & Impact Justification**
   - Quantified estimates of inhaled PM2.5 reduction paired with CO2 and NOx savings from transit shifts and trip chaining.

### 1.2 Production Standards & Grounding Guarantees
- **100% Web Software**: No custom IoT sensors or physical hardware required.
- **Multi-Tier Live Ingestion + GPS Location**:
  - Live GPS browser geolocation (`Use My Live Location`) and automatic 5-minute background live polling.
  - WAQI (CPCB monitoring network) -> zero-key Open-Meteo Live Atmospheric Feed (Indian CPCB AQI calculation) -> calibrated offline baselines.
- **Zero-Hallucination Grounding**: Missing pollutants display `N/A`, offline baselines are tagged `Offline Reference Baseline`, and Gemini responses pass runtime schema validation before rendering.
- **Dark Mode & Persistence**: Class-based dark/light theme with zero-flash SSR bootstrap and `localStorage` persistence for user preferences.
- **Production Security & Resilience**: Security headers in `next.config.js`, strict API input validation (`400` on invalid queries/payloads), API keys passed in headers (not query strings), `error.tsx` boundary, and `not-found.tsx`.

---

## 2. Sprint Execution Status

### Completed Production Milestones
- [x] **Data Pipeline**: Bounded TTL cache, WAQI + Open-Meteo live coordinate/city ingestion, IST timestamp normalization, and Indian CPCB AQI sub-index math.
- [x] **GenAI & Deterministic Engine**: Header-authenticated Gemini client, runtime JSON schema validation, and calibrated deterministic fallback supporting all 4 personas (`parent_kids`, `senior_sensitive`, `daily_commuter`, `fitness_enthusiast`).
- [x] **Production UI & Dark Mode**: Removed hackathon example presets in favor of `LocationQuickBar` + live GPS button, added adaptive Light/Dark mode toggle, accessible semantic controls, WHO threshold meters, and daily checklist.
- [x] **Quality & Security Hardening**: Added `next.config.js` security headers, `error.tsx`, `not-found.tsx`, Vitest unit/API/user-flow tests, strict `tsc --noEmit`, ESLint, and `next build` verification.

### Remaining Release Actions
- [ ] Configure production `GEMINI_API_KEY` and optional `WAQI_API_TOKEN` in hosting environment (Vercel / Cloud Run).
- [ ] Run live SonarQube scanner (`sonar-project.properties`) against a SonarQube instance if required.
- [ ] Commit and push to remote Git repository and deploy (`vercel --prod`).
