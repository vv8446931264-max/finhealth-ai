# FinHealth AI — Agent Instructions

> **Current sprint:** see [ROADMAP.md](ROADMAP.md) — 5 phases of approved UI/UX improvements. Implement in order, one phase per prompt.

## Project
IDBI Hackathon 2026 submission. React 19 + TypeScript + Vite SPA.
Team: IDBI_Vicks | Contact: vv8446931264@gmail.com

## Live URLs
- **India (primary):** https://finhealth-ai-india-1010587631565.asia-south1.run.app
- **US (backup):** https://finhealth-ai-1010587631565.us-central1.run.app

## Architecture
```
Browser (React SPA)
  └── GET / → Cloud Run (asia-south1) serves dist/
  └── POST /api/generate → server.js → Vertex AI Gemini 2.5 Flash (asia-south1)
                                         ↑ auth via finhealth-sa service account
```

## Key Files
| File | Purpose |
|------|---------|
| `src/routes/dashboard.tsx` | Main results page — scores, charts, AI chat |
| `src/routes/assessment.tsx` | 4-step input wizard |
| `src/routes/index.tsx` | Landing page |
| `src/lib/finhealth.ts` | Scoring engine (client-side, no AI) |
| `src/lib/gemini.ts` | AI integration — calls `/api/generate` |
| `server.js` | Node.js server: static files + Vertex AI proxy |
| `Dockerfile` | Multi-stage build (node:20-alpine) |

## GCP Setup
- Project: `finhealth-vertex-ai`
- Account: `vv153011@gmail.com`
- Service account: `finhealth-sa@finhealth-vertex-ai.iam.gserviceaccount.com`
- SA key: `sa-key.json` (NOT committed — in .gitignore)
- Artifact Registry: `asia-south1-docker.pkg.dev/finhealth-vertex-ai/finhealth-repo-india/finhealth-ai`
- Cloud Run service: `finhealth-ai-india` in `asia-south1`

## Deploy Loop
```powershell
# 1. Edit source files
# 2. Build
cd finhealth-ai; npm run build

# 3. Push image
$IMAGE = "asia-south1-docker.pkg.dev/finhealth-vertex-ai/finhealth-repo-india/finhealth-ai:latest"
gcloud builds submit --tag $IMAGE --project=finhealth-vertex-ai

# 4. Deploy
gcloud run deploy finhealth-ai-india --image=$IMAGE --region=asia-south1 --platform=managed --allow-unauthenticated --service-account="finhealth-sa@finhealth-vertex-ai.iam.gserviceaccount.com" --set-env-vars="GCP_PROJECT=finhealth-vertex-ai" --port=8080 --project=finhealth-vertex-ai
```

## Scoring Dimensions (each 0-100, equal 20% weight)
1. **Income Utilization** — (income - expenses - emi) / income
2. **Savings Rate** — monthlySavings / income
3. **Debt Health** — based on creditScore + EMI-to-income ratio
4. **Investment** — investments relative to income
5. **Protection** — term insurance + health insurance + emergency fund months

## AI Integration Notes
- NO API keys in code. Vertex AI uses SA OAuth token from Cloud Run metadata server.
- Model: `gemini-2.5-flash` in `asia-south1`
- Token fetched per-request from `http://metadata.google.internal/...`
- If Vertex AI 404s, check model name — use `v1beta1/publishers/google/models` list endpoint

## Common Tasks
- **Change AI model:** edit `MODEL` const in `server.js`, rebuild
- **Update landing page copy:** `src/routes/index.tsx`
- **Add new scoring dimension:** `src/lib/finhealth.ts` → `computeScores()`
- **Fix chat UI:** `src/routes/dashboard.tsx` → `Dashboard()` component
