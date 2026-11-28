# Production Security Audit & Sign-Off Report — VayuMitra

**Audit Date:** 2026-11-28  
**Target Stack:** Next.js `16.4.6` (App Router, TypeScript `5.6.3`, React `18.3.1`)  
**Application Architecture:** Stateless environmental telemetry & advisory web app (no database, no user authentication/sessions, no file storage buckets, no payment/email webhooks).

---

## Executive Summary & Architecture Scope

All 10 pre-launch security domains were audited directly against the codebase, dependencies, configuration, and Git history. Applicable vulnerabilities were remediated directly in source and verified via unit/integration tests, TypeScript strict checking, ESLint 9 flat config, production build, dependency vulnerability audit, and live HTTP header/API E2E checks against `next start`.

Domains specific to **Supabase PostgreSQL / RLS / Auth / Storage (Domains 2–4)** and **Webhook signature verification (Domain 9)** are **Not Applicable (`N/A`)** in the current stateless codebase because no database, user accounts, session cookies, or incoming webhooks exist. They are explicitly documented below alongside the requested manual Supabase & Vercel launch checklist if backend persistence is introduced later.

---

## 1. Fixed Vulnerabilities (Exact File & Line Changes)

| Domain | Severity | Issue Remediated | File & Lines | Change Implemented |
| :--- | :--- | :--- | :--- | :--- |
| **1. Secrets & Env Hygiene** | Medium | `.gitignore` only excluded `.env*.local` and `.env`, leaving `.env.production` / `.env.staging` at risk of accidental commit | [`.gitignore`](.gitignore#L20-L22) | Updated to ignore `.env*` while explicitly keeping `!.env.example`. |
| **5. XSS / Script Surface** | Medium | Inline bootstrap theme script used `dangerouslySetInnerHTML` in root layout | [`src/app/layout.tsx`](src/app/layout.tsx#L28), [`public/theme-init.js`](public/theme-init.js#L1-L11) | Extracted dark-mode pre-paint initializer to external static script `public/theme-init.js` loaded via `<Script src="/theme-init.js" strategy="beforeInteractive" />`, leaving zero `dangerouslySetInnerHTML` calls in the repository. |
| **5. Schema Validation** | High | Manual ad-hoc query/body parsing lacked strict schema validation and rejected unexpected keys inconsistently | [`src/app/api/aqi/route.ts`](src/app/api/aqi/route.ts#L12-L65), [`src/app/api/recommend/route.ts`](src/app/api/recommend/route.ts#L13-L91), [`src/lib/constants.ts`](src/lib/constants.ts) | Installed `zod` (`^4.6.7`). Enforced `aqiQuerySchema` (bounded city regex, finite lat `[-90, 90]`, lon `[-180, 180]`, strict `fresh` enum, partial-coordinate rejection -> `400`) and `.strict()` `recommendBodySchema` (rejects unknown properties -> `400`). Removed superseded `isValidCityInput` / `parseCoordinates` helpers. |
| **6. HTTP Security Headers & CSP** | High | Missing HSTS, CSP, and explicit `X-Powered-By` suppression; static/runtime posture incomplete | [`next.config.js`](next.config.js#L4-L42) | Configured global `/(.*)` headers: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(self), browsing-topics=()` (preserving intentional browser GPS telemetry), `Content-Security-Policy` (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, dev-gated `'unsafe-eval'` / `upgrade-insecure-requests`), and `poweredByHeader: false`. |
| **7. Rate Limiting & Denial-of-Wallet** | High | Public `/api/aqi` and Gemini-backed `/api/recommend` lacked per-IP throttling and raw body size caps | [`src/lib/rate-limit.ts`](src/lib/rate-limit.ts#L1-L60), [`src/app/api/aqi/route.ts`](src/app/api/aqi/route.ts#L9-L34), [`src/app/api/recommend/route.ts`](src/app/api/recommend/route.ts#L9-L79) | Added bounded in-memory sliding-window limiter (`MAX_BUCKETS = 2000`): `60 req/min` per IP on `GET /api/aqi` and `20 req/min` per IP on `POST /api/recommend` returning HTTP `429` + `Retry-After`. Enforced `MAX_BODY_BYTES = 16_384` (Content-Length + UTF-8 byte count check before `JSON.parse`) returning `413 Payload Too Large`. |
| **8. Info Disclosure & Error Handling** | Medium | Stack/raw error objects could log verbosely; production source maps not explicitly disabled | [`next.config.js`](next.config.js#L21), [`src/app/api/aqi/route.ts`](src/app/api/aqi/route.ts#L74-L79), [`src/app/api/recommend/route.ts`](src/app/api/recommend/route.ts#L123-L128), [`src/lib/aqi-service.ts`](src/lib/aqi-service.ts#L363-L366), [`src/lib/aqi-service.ts`](src/lib/aqi-service.ts#L419-L422), [`src/lib/gemini-service.ts`](src/lib/gemini-service.ts#L70-L72) | Set `productionBrowserSourceMaps: false`. Standardized error responses to generic safe JSON (`Unable to fetch air quality data`, `Unable to process recommendation request`) and restricted catch logs to `error.message` only (also fixed `cache: 'no-store'` on Gemini API calls at [`src/lib/gemini-service.ts`](src/lib/gemini-service.ts#L120)). |
| **10. Vulnerable Dependencies** | Critical | `npm audit --audit-level=high` initially flagged 12 advisories (4 moderate, 5 high, 3 critical) across `next@14`, `eslint-config-next@14`, `vitest@2`, and transitive deps | [`package.json`](package.json#L1-L35), `package-lock.json`, [`eslint.config.mjs`](eslint.config.mjs#L1-L13) | Upgraded to `next@^16.4.6`, `eslint@^9.39.5`, `eslint-config-next@^16.4.6`, `vitest@^5.1.2`, `vite@^7.3.8`, `@types/node@^24.19.4`. Migrated `.eslintrc.json` to ESLint 9 flat config `eslint.config.mjs` (replacing removed `next lint`), set `"build": "next build --webpack"` for reliable Windows Tailwind/PostCSS compilation, and refactored React 19 hook rules across [`src/lib/use-reduced-motion.ts`](src/lib/use-reduced-motion.ts), [`src/app/page.tsx`](src/app/page.tsx), [`src/components/AQIRadialGauge.tsx`](src/components/AQIRadialGauge.tsx), [`src/components/AdoptedChecklist.tsx`](src/components/AdoptedChecklist.tsx), [`src/components/AtmosphericParticleSphere.tsx`](src/components/AtmosphericParticleSphere.tsx), [`src/components/Header.tsx`](src/components/Header.tsx), [`src/components/TactileButton.tsx`](src/components/TactileButton.tsx), and [`src/components/TiltCard.tsx`](src/components/TiltCard.tsx). Re-audit result: **0 vulnerabilities**. |

---

## 2. Verified Controls Across All 10 Domains

1. **Secrets & Bundle Hygiene — PASS**
   - `git ls-files ".env*"` tracks only `.env.example`.
   - Repository source (`src/`, `public/`) and all commits (`git rev-list --all`) scanned clean for `NEXT_PUBLIC_`, API key prefixes (`AIzaSy`), private keys (`-----BEGIN`), DB URIs, and JWTs.
   - `GEMINI_API_KEY` ([`src/lib/gemini-service.ts`](src/lib/gemini-service.ts#L64), sent via `x-goog-api-key` header) and `WAQI_API_TOKEN` ([`src/lib/aqi-service.ts`](src/lib/aqi-service.ts#L445)) are read strictly on the server.
2. **Supabase Database & RLS — N/A**
   - No `supabase/` directory, `@supabase/*` dependency, SQL schema, or storage bucket exists in this repository.
3. **Authentication & Middleware Integrity — N/A**
   - Public read-only environmental monitor; no login, cookie session, `/auth/callback`, or protected route middleware is required or present.
4. **Authorization & IDOR Prevention — N/A**
   - No persisted user records or resource `id` lookups exist.
5. **Input Validation & Injection Protection — PASS**
   - Strict `zod` validation guards both HTTP endpoints (`GET /api/aqi`, `POST /api/recommend`); zero SQL interpolation, `eval`, `new Function`, or `dangerouslySetInnerHTML` occurrences exist.
6. **HTTP Security Headers & CSP — PASS**
   - Verified via live HTTP request to `next start`: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy: geolocation=(self)`, `Content-Security-Policy` (`frame-ancestors 'none'`), and absence of `X-Powered-By`.
7. **Rate Limiting & Anti-Abuse — PASS (with Serverless Scaling Note)**
   - Verified via automated route tests (`413` on `>16 KB` body, `429` + `Retry-After` after `20` requests/min on `/api/recommend`).
   - *Residual Scaling Risk:* [`src/lib/rate-limit.ts`](src/lib/rate-limit.ts#L7-L56) uses process-local memory (`MAX_BUCKETS = 2000`), so multi-instance serverless deployments do not share counters across isolates. Pair with Vercel WAF rate limits or Upstash Redis if scaling beyond a single Node instance.
8. **API Error Handling & Information Disclosure — PASS**
   - `productionBrowserSourceMaps: false` enabled; API `4xx`/`5xx` JSON bodies omit stack traces, paths, and raw upstream errors.
9. **Webhooks & CORS — N/A**
   - No webhook endpoints or custom permissive CORS (`Access-Control-Allow-Origin: *`) headers exist.
10. **Dependency & Supply Chain Audit — PASS**
    - `npm audit --audit-level=high` reports **`found 0 vulnerabilities`** with `package-lock.json` updated.

---

## 3. Verification Results (Executed Post-Final Edit)

- `npm run test` (`vitest run`): **5 test files, 33/33 tests passed**
- `npx tsc --noEmit`: **0 errors** (exit code `0`)
- `npm run lint` (`eslint .`): **0 errors, 0 warnings** (exit code `0`)
- `npm run build` (`next build --webpack`): **Passed** (`○ /`, `○ /_not-found`, `ƒ /api/aqi`, `ƒ /api/recommend`, exit code `0`)
- `npm audit --audit-level=high`: **`found 0 vulnerabilities`** (exit code `0`, `BypassSandbox: true` for npm registry access)
- Live HTTP E2E verification (`node e2e-check.mjs` against `next start`, `BypassSandbox: true` for local socket): **`E2E_ALL_PASSED`**

*Tooling Scope Note:* `eslint` / TypeScript / Vitest / `npm audit` / live HTTP E2E checks ran cleanly; external SonarQube CLI (`sonar`) / SonarQube MCP was not configured in this environment, and Turbopack `next build` failed on Windows under Node `v26.13.1` with a PostCSS child-process IPC panic so `"build"` uses Next.js 16's supported webpack builder (`next build --webpack`).

---

## 4. Pre-Launch Manual Dashboard Checklist

### Vercel / Hosting Dashboard (Required Before Switching DNS Live)
- [ ] **Environment Variables:** Configure `GEMINI_API_KEY` and `WAQI_API_TOKEN` in **Project Settings -> Environment Variables** (Production & Preview) as server-only secrets (never prefixed with `NEXT_PUBLIC_`).
- [ ] **Deployment Protection & WAF:** Enable Vercel Firewall / Attack Challenge Mode if public traffic surges, and optionally configure an IP-based rate-limit rule covering `/api/*` (`<= 20 req/min` for `/api/recommend`) to reinforce the per-instance limiter at the edge.
- [ ] **HTTPS & HSTS:** Confirm custom domain enforces HTTPS redirect and TLS 1.2+ so the `Strict-Transport-Security` header (`max-age=63072000; includeSubDomains; preload`) takes effect cleanly.
- [ ] **Usage / Billing Alerts:** Set spend caps / quota alerts on Google AI Studio (`GEMINI_API_KEY`) and WAQI API usage to prevent billing spikes.
- [ ] **Node.js Runtime:** Set Project Node.js Version to `20.x` or `22.x` LTS (React `18.3.1` works on Next 16; plan React 19 upgrade before Next 17).

### Supabase Dashboard (Applicable Only If Adding Auth / Database Later)
- [ ] **Auth Providers & Redirect Allowlist:** Set exact production `Site URL` and strict `Redirect URLs` allowlist (`https://yourdomain.com/**`, no wildcard `*` open redirects).
- [ ] **Password Policy & Leaked Passwords:** Enable **Leaked Password Protection** (HaveIBeenPwned integration), enforce minimum 8–12 character passwords, and require email confirmation before session issuance.
- [ ] **MFA & Bot Protection:** Enable CAPTCHA (Turnstile / hCaptcha) on signup/login/password-reset and make TOTP MFA available for user accounts.
- [ ] **Database Backups & RLS:** Enable Point-in-Time Recovery (PITR) / daily automated backups and verify `ENABLE ROW LEVEL SECURITY` + explicit `auth.uid()` policies on every new `public` table before launch.
