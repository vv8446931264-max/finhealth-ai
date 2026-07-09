# App Flow — FinHealth AI

---

## User Journey

```
[Landing Page /]
  │
  ├─ Hero CTA → "Get Your Score Now"
  │
  ▼
[Assessment /assessment]
  │
  ├─ Step 1: Income & Expenses
  │     income, essentialExpenses, discretionary
  │
  ├─ Step 2: Savings & Investments
  │     monthlySavings, investments, fixedDeposits, hasPPFNPS
  │
  ├─ Step 3: Debt & Liabilities
  │     loanOutstanding, monthlyEMI, creditCardOutstanding, creditScore
  │
  ├─ Step 4: Protection & Emergency
  │     emergencyFundMonths, hasTermInsurance, hasHealthInsurance, dependents
  │
  └─ Submit → saveAssessment() → sessionStorage → navigate("/dashboard")
  │
  ▼
[Dashboard /dashboard]
  │
  ├─ loadAssessment() ← sessionStorage
  │     (if null → redirect to /assessment)
  │
  ├─ computeScores() → Scores (client-side, instant)
  │
  ├─ Render score card + radar chart (immediate)
  │
  ├─ getAIScoreNarrative() ─────────────────────┐
  │     POST /api/generate                       │
  │     ← "You scored 72/100..."                │  Vertex AI
  │                                              │  gemini-2.5-flash
  ├─ getAIRecommendations() ───────────────────►┘
  │     POST /api/generate
  │     ← ["rec1", "rec2", ... "rec5"] (JSON)
  │
  ├─ generateRecommendations() ← rule-based fallback (client-side)
  ├─ generateActionPlan() ← rule-based (client-side)
  │
  └─ AI Chat panel
        User message
          │
          ▼
        sendChatMessage(history, message, assessment, scores)
          │
          POST /api/generate (with full chat history)
          │
          ▼
        AI response → append to chat history
```

---

## Serverless Function Flow (`/api/generate`)

```
Request arrives
  │
  ├─ Check Origin header → not own domain? → 403
  ├─ Method !== POST? → 405
  ├─ Rate check (>20 req/min for this IP)? → 429
  ├─ contents[] missing or empty? → 400
  │
  ├─ getAccessToken()
  │     Read GCP_SERVICE_ACCOUNT_KEY (base64 env var)
  │     Parse JSON → extract private_key + client_email
  │     Build JWT (RS256): iss, scope, aud, iat, exp (+1h)
  │     POST https://oauth2.googleapis.com/token → access_token
  │
  ├─ POST to Vertex AI
  │     https://us-central1-aiplatform.googleapis.com/v1/
  │       projects/finhealth-vertex-ai/locations/us-central1/
  │       publishers/google/models/gemini-2.5-flash:generateContent
  │     Authorization: Bearer <access_token>
  │     Body: { contents: req.body.contents }
  │
  ├─ Vertex AI error? → 500 { error: "Upstream error" }
  └─ Success → 200 { candidates: [...] }
```

---

## Navigation Rules

| From | To | Condition |
|---|---|---|
| `/` | `/assessment` | Click CTA |
| `/assessment` | `/dashboard` | All 4 steps submitted |
| `/assessment` | prev step | Click Back |
| `/dashboard` | `/assessment` | Click "Retake Assessment" |
| `/dashboard` | `/` | Click logo |
| Any 404 | `/` | NotFoundComponent link |

---

## State Management

| State | Location | Lifetime |
|---|---|---|
| Assessment form data | React `useState` | Until submission |
| Saved assessment | `sessionStorage` | Until tab close |
| Computed scores | `useMemo` in Dashboard | Component lifetime |
| AI recommendations | `useState` in Dashboard | Component lifetime |
| Chat history | `useState` in Dashboard | Component lifetime |
