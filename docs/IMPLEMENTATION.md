# Implementation Guide — FinHealth AI

---

## Local Development

```bash
git clone https://github.com/vv8446931264-max/finhealth-ai.git
cd finhealth-ai
npm install
npm run dev       # http://localhost:5173
```

> **Note:** The AI chat will fail locally (calls `/api/generate` which needs Vercel env vars).  
> To test AI locally: `vercel dev` (requires Vercel CLI + env vars).

---

## Adding Vercel Dev Support

```bash
npm i -g vercel
vercel link --scope vv8446931264-4185s-projects
vercel env pull .env.local   # pulls GCP vars to local
vercel dev                   # runs Vite + serverless together
```

---

## Deploying

```bash
vercel deploy --prod --scope vv8446931264-4185s-projects
```

Env vars (`GCP_PROJECT_ID`, `GCP_SERVICE_ACCOUNT_KEY`) are already set in the Vercel project — no need to pass them each time after the first deploy.

---

## Changing the AI Model

Edit `api/generate.js` line 4:

```js
const MODEL = "gemini-2.5-flash";  // change to any Vertex AI model
```

Tested available models in `us-central1`:
- ✅ `gemini-2.5-flash`
- ✅ `gemini-2.5-flash-lite`
- ❌ `gemini-1.5-flash` (not found)
- ❌ `gemini-2.0-flash` (not found)

---

## Updating the Scoring Formula

All scoring logic is in `src/lib/finhealth.ts` — `computeScores()` function.  
No backend changes needed. Redeploy not required for logic-only changes (built at deploy time).

---

## Adding a New Assessment Step

1. Add new fields to `Assessment` interface in `src/lib/finhealth.ts`
2. Add default values to `defaultAssessment`
3. Add a new entry to `STEPS` array in `src/routes/assessment.tsx`
4. Add the form inputs under the new step index
5. Update `computeScores()` to use the new fields

---

## Adding New Routes

TanStack Router is file-based. Add a file to `src/routes/` and run:

```bash
npx @tanstack/router-cli generate
```

Or let `vite dev` auto-regenerate `routeTree.gen.ts` (the Vite plugin watches for route changes).

---

## Rotating the Service Account Key

1. GCP Console → IAM → Service Accounts → `finhealth-sa` → Keys → Add Key
2. Download JSON → base64 encode:
   ```bash
   base64 -w 0 new-sa-key.json
   ```
3. Update in Vercel: Dashboard → Project → Settings → Environment Variables → `GCP_SERVICE_ACCOUNT_KEY`
4. Redeploy
5. Delete old key from GCP Console

---

## Key Files Quick Reference

| File | What to edit |
|---|---|
| `src/lib/finhealth.ts` | Scoring formula, recommendations, action plan |
| `src/lib/gemini.ts` | AI prompts |
| `api/generate.js` | Model, CORS origin, rate limit |
| `src/routes/index.tsx` | Landing page content |
| `src/routes/assessment.tsx` | Form steps and questions |
| `src/routes/dashboard.tsx` | Score display, charts, chat UI |
| `src/styles.css` | Design tokens (colours, radius) |
| `src/components/site-chrome.tsx` | Header and footer |
