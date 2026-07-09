# Data Schema — FinHealth AI

No database. All data lives in browser `sessionStorage` for the session duration.

---

## Assessment (Input)

```typescript
interface Assessment {
  // Step 1 — Income & Expenses
  income: number;              // Monthly gross income (₹)
  essentialExpenses: number;   // Rent, groceries, utilities (₹/month)
  discretionary: number;       // Dining, entertainment, shopping (₹/month)

  // Step 2 — Savings & Investments
  monthlySavings: number;      // Amount saved per month (₹)
  investments: number;         // Total equity/MF corpus (₹)
  fixedDeposits: number;       // Total FD balance (₹)
  hasPPFNPS: boolean;          // Has PPF or NPS account

  // Step 3 — Debt & Liabilities
  loanOutstanding: number;     // Total loan principal outstanding (₹)
  monthlyEMI: number;          // Total monthly EMI (₹)
  creditCardOutstanding: number; // Credit card unpaid balance (₹)
  creditScore: number;         // CIBIL score (300–900)

  // Step 4 — Protection & Emergency
  emergencyFundMonths: number; // Months of expenses in liquid savings
  hasTermInsurance: boolean;
  hasHealthInsurance: boolean;
  dependents: number;          // Number of financial dependents
}
```

**Storage key:** `finhealth_assessment_v1` (sessionStorage)

---

## Scores (Computed)

```typescript
interface Scores {
  incomeUtilization: number;  // 0–100
  savingsRate: number;        // 0–100
  debtHealth: number;         // 0–100
  investment: number;         // 0–100
  protection: number;         // 0–100
  overall: number;            // 0–100 (equal-weighted average)
}
```

Computed client-side by `computeScores(assessment: Assessment): Scores`. Never stored.

---

## AI Request (POST /api/generate)

```json
{
  "contents": [
    { "role": "user", "parts": [{ "text": "..." }] },
    { "role": "model", "parts": [{ "text": "..." }] }
  ]
}
```

Proxied directly to Vertex AI `generateContent` format. `contents` must be a non-empty array.

---

## AI Response (from Vertex AI)

```json
{
  "candidates": [{
    "content": {
      "role": "model",
      "parts": [{ "text": "response text here" }]
    },
    "finishReason": "STOP"
  }],
  "modelVersion": "gemini-2.5-flash",
  "usageMetadata": {
    "promptTokenCount": 120,
    "candidatesTokenCount": 80,
    "totalTokenCount": 200
  }
}
```

---

## Score Labels

| Range | Label | Color |
|---|---|---|
| 0–40 | Poor | `#ef4444` (red) |
| 41–60 | Fair | `#f97316` (orange) |
| 61–80 | Good | `#eab308` (yellow) |
| 81–100 | Excellent | `#22c55e` (green) |

---

## Assessment Steps → Fields Map

| Step | Label | Fields |
|---|---|---|
| 1 | Income & Expenses | `income`, `essentialExpenses`, `discretionary` |
| 2 | Savings & Investments | `monthlySavings`, `investments`, `fixedDeposits`, `hasPPFNPS` |
| 3 | Debt & Liabilities | `loanOutstanding`, `monthlyEMI`, `creditCardOutstanding`, `creditScore` |
| 4 | Protection & Emergency | `emergencyFundMonths`, `hasTermInsurance`, `hasHealthInsurance`, `dependents` |
