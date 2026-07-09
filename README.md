# FinHealth AI — IDBI Bank Financial Health Score

> **IDBI Innovate Hackathon 2026 | Problem Statement 3: Financial Health Score**

A production-grade web application that gives IDBI Bank customers an **AI-powered Financial Health Score** across 5 dimensions — with personalized recommendations and a 30-day action plan — in under 2 minutes.

🔗 **Live Demo**: https://id-preview--7fa258b2-7341-4df5-8886-52e7b877c0f1.lovable.app

---

## Problem Statement

IDBI Bank customers lack visibility into their overall financial health. They may be earning well but still under-saving, over-leveraging, or unprotected — without knowing it. **FinHealth AI** bridges that gap with a holistic, AI-driven financial health assessment.

## Solution Overview

| Dimension | Weight | What We Measure |
|-----------|--------|-----------------|
| Income Utilization | 20% | How efficiently income is spent vs. saved |
| Savings Rate | 20% | Monthly savings as % of income |
| Debt Health | 20% | EMI-to-income ratio |
| Investment | 20% | Invested corpus relative to annual income |
| Protection | 20% | Insurance, emergency fund, credit score |

**Overall Financial Health Score: 0–100**
- 🔴 0–40: Poor | 🟠 41–60: Fair | 🟡 61–80: Good | 🟢 81–100: Excellent

## Features

- **4-step assessment form** — captures 15 financial data points
- **Real-time scoring** — computed entirely client-side (no data leaves the browser)
- **Radar chart** — visual breakdown across all 5 dimensions
- **AI-ranked recommendations** — sorted by impact on your weakest dimensions
- **30-day action plan** — 3 concrete steps tailored to your profile
- **IDBI Bank product cross-sell** — contextual product suggestions
- **Fully responsive** — mobile + desktop

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Routing | TanStack Router (file-based) |
| UI Components | shadcn/ui + Radix UI |
| Styling | Tailwind CSS v4 |
| Charts | Recharts (RadialBar + Radar) |
| Forms | React Hook Form |
| Scoring Engine | Custom algorithm (`src/lib/finhealth.ts`) |
| Deployment | Lovable (Nitro SSR) |

## Architecture

```
src/
├── lib/
│   └── finhealth.ts       # Scoring algorithm + recommendation engine
├── routes/
│   ├── index.tsx           # Landing page
│   ├── assessment.tsx      # 4-step assessment form
│   └── dashboard.tsx       # Score results dashboard
└── components/
    └── site-chrome.tsx     # Header + Footer
```

## Scoring Algorithm

```typescript
incomeUtilization = 100 - ((expenses / income) * 100)
savingsRate       = (monthlySavings / income * 100) / 20 * 100   // 20% = 100
debtHealth        = 100 - (monthlyEMI / income * 100 * 2.5)
investment        = (invested / annualIncome * 100) + PPF/NPS bonus
protection        = termInsurance*30 + healthInsurance*30 + emergencyMonths*5 + creditScoreNorm*10
overall           = weighted average (equal 20% each)
```

## Local Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Deployment

Live on Lovable: https://id-preview--7fa258b2-7341-4df5-8886-52e7b877c0f1.lovable.app

## Team

- **Hackathon**: IDBI Innovate 2026
- **Problem Statement**: PS3 — Financial Health Score
- **Team Leader**: Mahesh

## Future Roadmap

- Integration with IDBI Bank account data (open banking)
- Historical score tracking over time
- Peer benchmarking (anonymized)
- Product recommendation engine (home loans, FDs, SIPs)
- Vertex AI Gemini for natural language financial advice
- WhatsApp / SMS score delivery

## License

Built for IDBI Innovate Hackathon 2026. All rights reserved.
