# Rules & Conventions — FinHealth AI

---

## Scoring Rules

### Income Utilization
- Score = `clamp(100 - (essentialExpenses + discretionary) / income × 100)`
- **100** = spending nothing (impossible in practice)
- **0** = spending ≥ 100% of income

### Savings Rate
- Benchmark: 20% savings rate = score of 100
- Formula: `clamp((savingsPct / 20) × 100)`
- E.g. saving 10% → score = 50

### Debt Health
- Formula: `clamp(100 - (monthlyEMI / income × 250))`
- EMI > 40% of income → score = 0
- Zero EMI → score = 100

### Investment
- Formula: `clamp((invested / annualIncome) × 100)`
- Invested = investments + fixedDeposits
- +15 bonus if `hasPPFNPS = true` (capped at 100)
- Full score requires invested corpus ≥ 1× annual income

### Protection
| Component | Max Points |
|---|---|
| Term Insurance | 30 |
| Health Insurance | 30 |
| Emergency Fund (5 × months, max 6) | 30 |
| Credit Score normalized (300–900 → 0–10) | 10 |
| **Total** | **100** |

### Overall
- Simple equal-weighted average of all 5 dimensions
- `Math.round(sum / 5)`

---

## AI Prompt Rules

1. All prompts include the customer's actual numbers — no generic advice
2. System context is always prepended to chat history as the first user turn
3. Recommendations must mention IDBI Bank products where applicable
4. Response length: narratives ≤ 60 words, chat ≤ 150 words
5. Recommendations returned as a JSON array of 5 strings — no markdown

---

## API Security Rules

1. **CORS:** Only `https://finhealth-ai-rho.vercel.app` is allowed as origin
2. **Rate limit:** 20 requests per minute per IP — returns 429 if exceeded
3. **Input:** `contents` must be a non-empty array — returns 400 if not
4. **Errors:** Never expose internal error messages, GCP project names, or stack traces to the client
5. **Secrets:** Service account key must never be in source code or git history

---

## Code Conventions

- All monetary values in Indian Rupees (₹), formatted with `en-IN` locale
- Scores are always integers (use `Math.round`)
- Scores are always clamped 0–100 via the `clamp()` helper
- No external state management library — React `useState`/`useMemo` only
- No server-side rendering — SPA only (`sessionStorage` for data persistence)
- Component files: PascalCase. Utility files: camelCase. All `.tsx` for React.

---

## Git Rules

- Never commit: `.env`, `sa-key.json`, `node_modules/`, `dist/`
- Branch `main` is production — direct pushes deploy to Vercel
- Commit messages: imperative mood, present tense (e.g. "Add rate limiting")

---

## UX Rules

- Assessment must always show progress (step X of 4 + %)
- Dashboard must handle the case where sessionStorage is empty (redirect to `/assessment`)
- AI loading states must be shown — never leave the user with a blank panel
- All currency inputs in Indian Rupees, no currency conversion
- Mobile-first: all layouts must work at 375px viewport width
