# FinHealth AI — Improvement Roadmap (Approach A: Deep Polish)

Approved plan for IDBI Innovate 2026 submission. Timeline: 2–3 days.
Execute phases **in order** — each phase ends with `npm run build` passing, then deploy per AGENTS.md.

**Rules for the implementing agent:**
- Do NOT add any npm dependencies. Everything below is CSS + React + existing libs (recharts, sonner, lucide-react are already installed).
- Do NOT touch `server.js`, `src/lib/finhealth.ts` scoring math, `Dockerfile`, or `vite.config.ts`.
- Do NOT rename routes. All work is inside `src/routes/*.tsx`, `src/lib/products.ts` (new), `src/index.css`, `src/components/site-chrome.tsx`.
- After each phase: `npm run build`, fix any TS errors, then move on. Deploy once at the end (commands in AGENTS.md → Deploy Loop).

---

## Phase 1 — Landing page (`src/routes/index.tsx`)

**1.1 Hero copy (replace existing):**
- H1: `Know your Financial Health Score in 3 minutes`
- Sub-line: `Gemini AI analyses your money across 5 dimensions and matches you with the right IDBI products — free, private, no login.`
- CTA button text: `Get My Free Score →` linking to `/assessment`.

**1.2 Animated stat counters:**
Add a `useCountUp(target: number, durationMs = 1200)` hook in the same file:
`requestAnimationFrame` loop, ease-out (`1 - (1-t)^3`), returns current value. Run on mount.
Stats strip (4 items, count up where numeric):
- `5` dimensions analysed
- `3 min` to your score
- `100%` private — score computed in your browser
- `24×7` AI advisor, powered by Gemini

**1.3 Floating score-preview card:**
Right side of hero (hidden on mobile, `hidden lg:block`): a mock dashboard card — small radial gauge showing `78`, label "Good", 3 mini dimension bars. Pure divs + CSS, no recharts needed here. Add CSS animation `float` (translateY -8px ↔ 0, 4s ease-in-out infinite) and a subtle glow (`box-shadow` pulse).

**1.4 CTA shimmer:**
Add to `src/index.css`:
```css
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
.btn-shimmer { background-image: linear-gradient(110deg, transparent 40%, rgba(255,255,255,.25) 50%, transparent 60%); background-size: 200% 100%; animation: shimmer 2.5s infinite; }
```
Apply `btn-shimmer` class on the hero CTA (layered over the existing gold/navy bg).

**1.5 Trust bar** under hero: small muted row — `Secured on Google Cloud · Vertex AI Gemini · Data stays in your session · No account needed`.

**Acceptance:** hero renders, counters animate once, card floats, build passes.

---

## Phase 2 — Assessment wizard (`src/routes/assessment.tsx`)

**2.1 Step transition animation:**
Wrap the step content in a div with `key={step}` and a CSS animation `step-in` (opacity 0→1, translateX 24px→0, 300ms ease-out). Add keyframes to `index.css`.

**2.2 Progress header upgrade:**
Show `Step {n} of 4 · {label}` plus completed steps get a filled check circle (lucide `Check`). Progress bar animates width via `transition-all duration-500`.

**2.3 Rupee formatting on money inputs:**
Display values with Indian comma grouping while typing: store the raw number in state, render `Number(v).toLocaleString("en-IN")`, strip non-digits on change. Applies to income, expenses, savings, EMI, investments fields.

**2.4 "Analyzing" interstitial (high demo value):**
On final submit, before `navigate({ to: "/dashboard" })`, show a full-screen overlay for ~2.4s with three staged lines appearing one after another (800ms apart), each with a spinner→check transition:
1. `Computing your 5-dimension score…`
2. `Consulting Gemini AI…`
3. `Matching IDBI products…`
Then navigate. Implement with a `submitting` state + `setTimeout` chain. `saveAssessment` fires immediately at the start of the overlay so data is ready.

**Acceptance:** steps slide, money fields show commas, interstitial plays once on finish, lands on dashboard.

---

## Phase 3 — Dashboard: product match + fixes (`src/routes/dashboard.tsx` + new `src/lib/products.ts`)

**3.1 NEW `src/lib/products.ts` — IDBI product rule engine (killer business feature):**
```ts
export interface ProductMatch {
  name: string; tagline: string; why: string; url: string; icon: string; // lucide icon name
}
export function matchProducts(a: Assessment, s: Scores): ProductMatch[]
```
Rules (order = priority; return top 4). `why` must reference the user's real number:
| Trigger | Product | Tagline | why (template) |
|---|---|---|---|
| `s.savingsRate < 60` | IDBI Recurring Deposit | Build a monthly saving habit, from ₹500 | `Your savings score is {s.savingsRate}/100 — an RD automates the habit.` |
| `!a.hasTermInsurance` | Ageas Federal Term Life (IDBI partner) | Protect {dependents} dependents at low premium | `You have {a.dependents} dependents and no term cover.` |
| `!a.hasHealthInsurance` | Health Insurance (IDBI bancassurance) | Hospital bills shouldn't wreck your plan | `One hospitalisation can erase years of savings.` |
| `a.emergencyFundMonths < 3` | IDBI Sweep-in FD (auto-sweep savings) | Emergency fund that earns FD rates | `You have {a.emergencyFundMonths} months of emergency cover; target 6.` |
| `s.debtHealth < 60` | IDBI Loan Balance Transfer | Move EMIs to lower rates | `EMI is {pct}% of your income — a transfer can cut it.` |
| `s.investment < 60` | Mutual Fund SIP via IDBI Bank | Start with ₹500/month | `Your investment score is {s.investment}/100 — SIPs compound early.` |
| `a.creditScore < 650` | Secured Credit Card against FD | Rebuild your credit score safely | `Credit score {a.creditScore} — secured card reports positive history.` |
| fallback (all good) | IDBI Suvidha Tax-Saving FD | Save tax under 80C at FD safety | `Strong profile — optimise taxes next.` |
All `url`s → `https://www.idbibank.in` (product pages if known, else root).

**3.2 Product cards section on dashboard:**
New section between "Recommendations/Action plan" and the chat: heading `Your IDBI Product Matches` + sub `Chosen for your weakest dimensions`. Grid `sm:grid-cols-2 lg:grid-cols-4`. Card: icon in navy circle, product name (bold), tagline, italic `why` line in gold/navy tint box, `Explore →` outline button (opens url, `target="_blank"`).

**3.3 Fix dead buttons (judges WILL click these):**
- **Share**: `navigator.share({ title, text: "My Financial Health Score: {overall}/100 on FinHealth AI", url: location.origin })` with fallback `navigator.clipboard.writeText(...)` + `toast.success("Link copied!")` (sonner is installed; ensure `<Toaster />` is mounted in `__root.tsx` — add if missing).
- **Download Report**: `window.print()`. Add print CSS in `index.css`: `@media print { header, footer, .no-print { display:none } }` and put `no-print` class on the chat section + buttons row.

**3.4 Gauge count-up:** animate displayed overall score 0→value over 1.2s (same `useCountUp` pattern; extract the hook to `src/lib/use-count-up.ts` and import in both routes). Drive the RadialBar value off the animated number so the arc sweeps.

**3.5 Percentile line** under the gauge label: deterministic `You're ahead of {Math.min(97, Math.round(overall * 1.1))}% of assessed users` — small muted text with a `TrendingUp` icon.

**Acceptance:** 4 product cards render matched to weak dimensions with personalised `why`, Share/Download actually do something, gauge sweeps up, build passes.

---

## Phase 4 — AI chat upgrades (`src/routes/dashboard.tsx`)

**4.1 Auto-send chips:** clicking a suggestion chip sends immediately (call `handleSendChat` with the chip text, don't just fill the input). Refactor `handleSendChat(text?: string)` to accept an optional override.

**4.2 Hindi chip (India wow-factor):** add chip `मेरा स्कोर कैसे सुधारें?` — Gemini answers in Hindi natively. No other i18n work.

**4.3 Typewriter reveal:** when a model reply arrives, reveal it word-by-word (~30ms/word, cap 4s total) into the last message. Keep it simple: a `displayedText` state on the last model message; skip animation for history items.

**4.4 Chat persistence:** mirror `chatHistory` to `sessionStorage` (`finhealth_chat_v1`) and hydrate on mount, so a refresh during the demo doesn't wipe the conversation.

**Acceptance:** chips send instantly, Hindi chip returns Hindi answer, replies type out smoothly, refresh keeps history.

---

## Phase 5 — Final polish + deploy

- `<title>` and meta description already set per route — verify; add OG tags in `index.html` (`og:title`, `og:description`).
- Mobile pass at 375px: hero stacks, product grid 1-col, chat usable. Fix any overflow with `flex-wrap`/`min-w-0`.
- Run through full flow twice (fresh session + refresh mid-flow).
- Deploy: AGENTS.md → Deploy Loop (build → `gcloud builds submit` → `gcloud run deploy finhealth-ai-india`).
- Verify live: landing animations, wizard interstitial, product cards, Share/Download, chat (English + Hindi), on the asia-south1 URL.
- PPT: if you mention features in slides, add one bullet `AI-matched IDBI product recommendations` to the features slide (see scratchpad fix_pptx scripts for the zipfile edit pattern).

---

## Deferred (do NOT build now)
- Dark mode, PDF-generation lib, react-markdown, confetti lib, i18n framework, login/accounts, real product API — all skipped intentionally; add only if judges ask.

## Suggested prompts for the implementing session
1. `Read AGENTS.md and ROADMAP.md. Implement Phase 1 exactly as specified, then run npm run build and fix errors.`
2. `Implement Phase 2 from ROADMAP.md, build.`
3. `Implement Phase 3 from ROADMAP.md, build.`
4. `Implement Phase 4 from ROADMAP.md, build.`
5. `Do Phase 5: verify, deploy per AGENTS.md Deploy Loop, and report the live URL checks.`
