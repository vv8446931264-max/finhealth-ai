# Product Requirements Document — FinHealth AI
**Version:** 1.0 | **Date:** 2026-07-10 | **Owner:** IDBI Hackathon Team

---

## 1. Problem Statement

Indian retail banking customers lack a simple, personalised tool to understand their financial health. IDBI Bank advisors are not accessible 24/7, and generic financial calculators offer no personalisation or AI guidance.

## 2. Solution

FinHealth AI is a web application that gives any IDBI Bank customer a **personalised Financial Health Score (0–100)** across 5 dimensions, actionable recommendations, and an AI chat advisor — all in under 2 minutes.

## 3. Goals

| Goal | Metric |
|---|---|
| Completion rate | ≥ 70% of users who start assessment reach dashboard |
| AI response latency | < 3 seconds per message |
| Uptime | 99.9% (Vercel SLA) |
| Security | No credentials exposed client-side |

## 4. Non-Goals

- User accounts / persistent data storage
- Real-time banking data integration
- Financial transactions

## 5. User Stories

| As a... | I want to... | So that... |
|---|---|---|
| Bank customer | Answer 12 questions about my finances | I get a personalised score |
| Customer | See my score broken down by dimension | I know exactly what to improve |
| Customer | Get AI recommendations specific to my numbers | I have a clear action plan |
| Customer | Chat with an AI advisor | I can ask follow-up questions |
| IDBI Bank | Surface relevant IDBI products in recommendations | We serve customers better |

## 6. Features

### MVP (Shipped)
- 4-step financial assessment (12 inputs)
- 5-dimension scoring engine (rule-based, no ML)
- AI narrative and 5 recommendations via Gemini 2.5 Flash (Vertex AI)
- AI chat advisor with financial context
- 30-day action plan
- Radar chart + radial score visualisation
- Fully responsive, mobile-first UI

### Out of Scope (v1)
- PDF export
- Email/SMS delivery
- Multi-language support
- User login

## 7. Constraints

- Must run as a static SPA (no database)
- Assessment data stored only in `sessionStorage` (clears on tab close)
- AI backend proxied server-side (no client-side API keys)
- Must work on all modern browsers (Chrome, Firefox, Safari, Edge)
