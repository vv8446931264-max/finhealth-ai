# Project Tracker — FinHealth AI
**Last Updated:** 2026-07-10

---

## Status Legend
`✅ Done` · `🚧 In Progress` · `📋 Planned` · `❌ Blocked`

---

## Phase 1 — Core App ✅

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | Assessment form (4 steps, 12 inputs) | ✅ | All fields working |
| 2 | Scoring engine (5 dimensions) | ✅ | `computeScores()` in finhealth.ts |
| 3 | Dashboard — score card + radar chart | ✅ | Recharts RadarChart + RadialBar |
| 4 | Rule-based recommendations | ✅ | `generateRecommendations()` |
| 5 | 30-day action plan | ✅ | `generateActionPlan()` |
| 6 | Session persistence (sessionStorage) | ✅ | `saveAssessment()` / `loadAssessment()` |
| 7 | Routing (TanStack Router) | ✅ | `/`, `/assessment`, `/dashboard` |
| 8 | Responsive design (mobile-first) | ✅ | Tailwind v4 |

---

## Phase 2 — AI Integration ✅

| # | Task | Status | Notes |
|---|---|---|---|
| 9 | Vertex AI GCP project setup | ✅ | `finhealth-vertex-ai` under vv153011 |
| 10 | Service account + IAM | ✅ | `finhealth-sa@...` with aiplatform.user |
| 11 | Vercel serverless proxy (`/api/generate`) | ✅ | ESM, RS256 JWT auth |
| 12 | AI score narrative | ✅ | `getAIScoreNarrative()` |
| 13 | AI recommendations (5) | ✅ | `getAIRecommendations()` |
| 14 | AI chat advisor | ✅ | `sendChatMessage()` with history |
| 15 | Model: gemini-2.5-flash | ✅ | Confirmed working in us-central1 |

---

## Phase 3 — Security ✅

| # | Task | Status | Notes |
|---|---|---|---|
| 16 | No client-side API keys | ✅ | All auth server-side |
| 17 | CORS origin lock | ✅ | Own domain only, 403 for others |
| 18 | Rate limiting (20 req/min/IP) | ✅ | In-memory Map in serverless fn |
| 19 | Input validation | ✅ | `contents[]` required |
| 20 | Error message sanitisation | ✅ | Generic errors only |
| 21 | Secrets out of git history | ✅ | `.gitignore` verified, no leaks |

---

## Phase 4 — Deployment ✅

| # | Task | Status | Notes |
|---|---|---|---|
| 22 | GitHub repo | ✅ | github.com/vv8446931264-max/finhealth-ai |
| 23 | Vercel project | ✅ | vv8446931264-4185s-projects |
| 24 | Production URL | ✅ | https://finhealth-ai-rho.vercel.app |
| 25 | GCP billing linked | ✅ | Account 01E6D0-C99677-731A94 |

---

## Phase 5 — Documentation ✅

| # | Task | Status | Notes |
|---|---|---|---|
| 26 | PRD | ✅ | `docs/PRD.md` |
| 27 | Tech Spec | ✅ | `docs/TECH_SPEC.md` |
| 28 | Schema | ✅ | `docs/SCHEMA.md` |
| 29 | App Flow | ✅ | `docs/APP_FLOW.md` |
| 30 | Implementation Guide | ✅ | `docs/IMPLEMENTATION.md` |
| 31 | Rules | ✅ | `docs/RULES.md` |
| 32 | Design Guide | ✅ | `docs/DESIGN.md` |
| 33 | Tracker | ✅ | `docs/TRACKER.md` (this file) |

---

## Backlog (Post-Hackathon)

| # | Task | Priority |
|---|---|---|
| B1 | PDF export of score report | Medium |
| B2 | Email delivery of report | Medium |
| B3 | Hindi language support | High |
| B4 | Rate limit with Redis (persistent across instances) | Medium |
| B5 | PDF/CSV upload for bank statement parsing | Low |
| B6 | IDBI product deep-links from recommendations | High |
| B7 | Analytics (page views, completion rate) | Medium |
| B8 | Share score on WhatsApp/LinkedIn | Medium |

---

## Known Issues

| # | Issue | Severity | Status |
|---|---|---|---|
| I1 | Rate limit resets if Vercel cold-starts a new instance | Low | Won't fix (use Redis for fix) |
| I2 | `VITE_GEMINI_API_KEY` text appears in old Dashboard.tsx (unused file) | Low | Cosmetic only, no key present |
