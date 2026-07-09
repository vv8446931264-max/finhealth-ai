# Technical Specification — FinHealth AI
**Version:** 1.0 | **Date:** 2026-07-10

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6 |
| Routing | TanStack Router v1 (file-based, SPA mode) |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite` plugin) |
| UI Components | shadcn/ui (Radix primitives) |
| Charts | Recharts (RadarChart, RadialBarChart) |
| Backend (AI proxy) | Vercel Serverless Function (Node.js 20, ESM) |
| AI Model | Gemini 2.5 Flash via Google Vertex AI |
| GCP Auth | Service account JWT — RS256, 1-hour tokens |
| Hosting | Vercel (static SPA + serverless function) |
| CI | None — manual `vercel deploy --prod` |

---

## Architecture

```
Browser (SPA)
  └─ TanStack Router
       ├─ / (Landing)
       ├─ /assessment (4-step form)
       └─ /dashboard (score + AI)
              │
              │ POST /api/generate
              ▼
Vercel Serverless Function (api/generate.js)
  ├─ CORS check (own domain only)
  ├─ Rate limit (20 req/min per IP, in-memory)
  ├─ Input validation (contents[] required)
  ├─ Service account JWT generation (RSA-SHA256)
  └─ Proxy → Vertex AI (us-central1) gemini-2.5-flash
```

---

## Environment Variables (Vercel)

| Variable | Description |
|---|---|
| `GCP_PROJECT_ID` | GCP project ID (`finhealth-vertex-ai`) |
| `GCP_SERVICE_ACCOUNT_KEY` | Base64-encoded service account JSON |

Never exposed to the browser. No `VITE_` prefix.

---

## Scoring Engine (`src/lib/finhealth.ts`)

All scores are integers 0–100, clamped.

```
overall = avg(incomeUtilization, savingsRate, debtHealth, investment, protection) × weights
```

| Dimension | Weight | Formula |
|---|---|---|
| Income Utilization | 20% | `100 - (expenses / income × 100)` |
| Savings Rate | 20% | `(savingsPct / 20) × 100` — 20% savings = 100 |
| Debt Health | 20% | `100 - (EMI / income × 250)` |
| Investment | 20% | `(invested / annualIncome × 100)` + 15 if PPF/NPS |
| Protection | 20% | Term (30) + Health (30) + Emergency fund (5×months, max 30) + Credit score (0–10) |

Score labels: Poor (≤40), Fair (≤60), Good (≤80), Excellent (>80)

---

## Data Flow

1. User fills 4-step form → `Assessment` object built in component state
2. On submit → `saveAssessment()` writes to `sessionStorage`
3. Dashboard loads → `loadAssessment()` reads from `sessionStorage`
4. `computeScores(assessment)` runs client-side
5. `getAIScoreNarrative()` and `getAIRecommendations()` call `POST /api/generate`
6. Serverless function mints JWT → calls Vertex AI → streams response back

---

## Security Controls

| Control | Implementation |
|---|---|
| No client-side secrets | All credentials in Vercel env vars only |
| CORS | `api/generate.js` checks `Origin` header against own domain |
| Rate limiting | 20 req/min per IP (in-memory Map, resets per minute) |
| Input validation | `contents[]` must be a non-empty array |
| Error leakage | All errors return generic message, no internals |
| Session data | `sessionStorage` only — auto-cleared on tab close |
| Git history | `sa-key.json`, `.env` in `.gitignore`, never committed |

---

## File Structure

```
finhealth-ai/
├── api/
│   └── generate.js          # Vercel serverless — Vertex AI proxy
├── src/
│   ├── lib/
│   │   ├── finhealth.ts     # Assessment types, scoring, rules, sessionStorage
│   │   ├── gemini.ts        # AI call wrappers (calls /api/generate)
│   │   └── utils.ts         # cn() helper
│   ├── routes/
│   │   ├── __root.tsx       # Root layout, error boundary, providers
│   │   ├── index.tsx        # Landing page
│   │   ├── assessment.tsx   # 4-step form
│   │   └── dashboard.tsx    # Score + AI chat
│   ├── components/
│   │   ├── site-chrome.tsx  # Header + Footer
│   │   └── ui/              # shadcn components
│   ├── hooks/
│   │   └── use-mobile.tsx
│   ├── router.tsx           # TanStack Router setup
│   ├── routeTree.gen.ts     # Auto-generated route tree
│   └── styles.css           # Tailwind v4 + custom tokens
├── docs/                    # This documentation
├── index.html
├── vite.config.ts
├── package.json
└── vercel.json
```
