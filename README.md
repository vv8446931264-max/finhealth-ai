# FinHealth AI

**IDBI Innovate 2026 — Problem Statement 3: Financial Health Score**  
Team: **IDBI_Vicks** | Leader: **Vivek Vishwakarma**

Live: https://finhealth-ai-india-1010587631565.asia-south1.run.app

---

## What it does

Most people have a rough sense they should save more or pay off debt faster, but no number to track. FinHealth AI gives you a 0-100 financial health score in under 3 minutes.

You answer 12 questions across 4 areas. The app scores each dimension, flags what's dragging your total down, then matches you to specific IDBI Bank products that address that weakness. An AI advisor (Gemini 2.5 Flash) explains why each recommendation applies to your numbers — not generic advice.

No login. No data sent to any server until the AI explanation step. Score computation is entirely client-side.

---

## Score model

| Dimension | Weight | Formula |
|---|---|---|
| Income Utilization | 20% | `100 - (expenses / income x 100)` |
| Savings Rate | 20% | `(savings / income x 100) / 20 x 100` — benchmarked to 20% target |
| Debt Health | 20% | `100 - (EMI / income x 100 x 2.5)` |
| Investment | 20% | `(invested / annualIncome x 100)` + 15 if PPF/NPS active |
| Protection | 20% | Term (30) + Health (30) + Emergency months x 5 + Credit score norm (0-10) |

Overall = equal-weighted average. Ratings: 0-40 Poor · 41-60 Fair · 61-80 Good · 81-100 Excellent

---

## Features

- 4-step wizard capturing 12 inputs: income, savings, debt, protection
- Client-side scoring engine — runs in under 50ms, no network call needed
- Radial gauge sweep + radar chart across all 5 dimensions
- AI recommendations from Gemini 2.5 Flash — sorted by weakest dimension first
- 30-day action plan with 3 concrete next steps
- IDBI Bank product matching — top 4 products ranked by relevance to your weakest area
- AI chat advisor — English and Hindi, session memory across messages
- Share score via Web Share API, download report via browser print
- Animated landing page, analyzing interstitial, typewriter dashboard reveal
- Works on mobile, tablet, desktop

---

## Tech stack

| | |
|---|---|
| Frontend | React 19, TypeScript, Vite 6, TanStack Router |
| UI | shadcn/ui, Tailwind CSS v4, Recharts, Lucide |
| Backend | Node.js 20 — single file (server.js), no framework |
| AI | Vertex AI Gemini 2.5 Flash, OAuth2 via GCP metadata server |
| Infra | Google Cloud Run (asia-south1), Cloud Build, Artifact Registry, Docker Alpine |
| Animations | Pure CSS keyframes — no JS animation library |

---

## Architecture

```
Browser (React SPA)
  client-side scoring (src/lib/finhealth.ts) -- no network
  POST /api/generate
    server.js (Cloud Run, Node.js)
      fetches OAuth token from GCP metadata server
      calls Vertex AI Gemini 2.5 Flash (asia-south1)
```

No API keys in code or environment. Auth is via the `finhealth-sa` service account attached to the Cloud Run instance.

```
src/
  lib/
    finhealth.ts       # scoring algorithm, recommendations, action plan
    products.ts        # IDBI product rule engine
    use-count-up.ts    # rAF-based count-up hook
  routes/
    index.tsx          # landing page
    assessment.tsx     # 4-step wizard + analyzing interstitial
    dashboard.tsx      # score dashboard + AI chat
server.js              # Vertex AI proxy + static file server
Dockerfile             # multi-stage Alpine build
```

---

## Run locally

```bash
npm install
npm run dev
# http://localhost:5173
```

For AI features locally, you need a GCP service account key with `GOOGLE_APPLICATION_CREDENTIALS` set. Scoring and product matching work without it.

---

## Deploy to Cloud Run

```bash
gcloud builds submit --tag asia-south1-docker.pkg.dev/finhealth-vertex-ai/finhealth-repo-india/finhealth-ai:latest

gcloud run deploy finhealth-ai-india \
  --image asia-south1-docker.pkg.dev/finhealth-vertex-ai/finhealth-repo-india/finhealth-ai:latest \
  --region asia-south1 \
  --service-account finhealth-sa@finhealth-vertex-ai.iam.gserviceaccount.com \
  --allow-unauthenticated
```

---

## Team

| | |
|---|---|
| Hackathon | IDBI Innovate 2026 |
| Problem Statement | PS3 — Financial Health Score |
| Team Name | IDBI_Vicks |
| Team Leader | Vivek Vishwakarma |

---

## Roadmap

1. PDF export with charts embedded
2. Full Hindi and regional language UI
3. IDBI Bank API integration — apply for products directly in-app
4. Score history and trend tracking with user accounts
5. WhatsApp bot for quick score checks
6. Goal-based planning with a path to 80+
