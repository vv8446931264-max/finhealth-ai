# Design Guide — FinHealth AI

---

## Design Philosophy

**Trustworthy · Clear · Indian**

A financial product must feel bank-grade. The design uses a deep navy + gold palette (IDBI brand-adjacent), generous whitespace, and clear typographic hierarchy to build trust quickly.

---

## Colour Tokens (CSS Custom Properties)

Defined in `src/styles.css` via Tailwind v4 `@theme`:

### Brand
| Token | Value | Usage |
|---|---|---|
| `--navy` | `#1a1a2e` | Primary dark, hero background |
| `--gold` | `#e8b84b` | Accent, CTA buttons, score highlights |
| `--hero-gradient` | `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)` | Hero section |

### Semantic (Light Mode)
| Token | Usage |
|---|---|
| `--background` | Page background (`#fafafa`) |
| `--foreground` | Primary text (`#1a1a2e`) |
| `--card` | Card backgrounds (`#ffffff`) |
| `--muted-foreground` | Secondary text |
| `--primary` | Primary action colour (navy) |
| `--border` | Dividers and input borders |

### Score Colours
| Score | Colour | Token |
|---|---|---|
| 0–40 Poor | `#ef4444` | `text-rose-500` |
| 41–60 Fair | `#f97316` | `text-orange-500` |
| 61–80 Good | `#eab308` | `text-yellow-500` |
| 81–100 Excellent | `#22c55e` | `text-emerald-500` |

---

## Typography

| Font | Use | Weight |
|---|---|---|
| **Plus Jakarta Sans** | Headings, hero, score display | 600, 700, 800 |
| **Inter** | Body text, labels, inputs | 400, 500, 600 |

Loaded via Google Fonts CDN in `index.html`.

---

## Spacing & Layout

- Max content width: `max-w-6xl` (1152px) on landing, `max-w-3xl` (768px) on assessment
- Section padding: `py-20 md:py-28` on hero, `py-10 md:py-16` on inner pages
- Card padding: `p-6 md:p-10`
- Border radius: `rounded-2xl` for cards, `rounded-md` for buttons/inputs

---

## Component Patterns

### Cards
```
rounded-2xl border border-border bg-card shadow-elegant p-6
```

### Primary Button (CTA)
```
bg-gold text-navy font-semibold rounded-md px-6 py-3 hover:brightness-95
```

### Score Badge
```
text-4xl font-extrabold [score colour]
```

### Step Indicator (Assessment)
- Completed: `bg-emerald-50 border-emerald-500/40 text-emerald-700` + checkmark icon
- Active: `bg-navy text-white border-navy`
- Upcoming: `bg-card text-muted-foreground border-border`

---

## Page-by-Page Design Notes

### Landing (`/`)
- Full-width navy hero with gradient, white text, gold accents
- Split layout: copy left, score preview card right (2-col on desktop)
- Feature tiles: 3 columns, icon + heading + description
- How it works: numbered steps with connecting line
- Footer: bank name, product links, disclaimer

### Assessment (`/assessment`)
- Single card, full-width on mobile, max-w-3xl centred on desktop
- Progress bar + step chips at top
- One section of inputs per step — no scrolling required per step
- Back/Next buttons fixed at bottom of card
- Input labels always above inputs, helper text in muted colour

### Dashboard (`/dashboard`)
- Score hero: large radial gauge + overall score + AI narrative
- 5 dimension tiles in a 2–3 column grid
- Radar chart full-width on mobile, half-width on desktop
- AI recommendations: numbered list with loading skeleton
- Action plan: 3 items with week labels
- AI chat: collapsible panel, sticky send bar at bottom

---

## Shadows & Effects

| Name | Value | Usage |
|---|---|---|
| `shadow-elegant` | `0 4px 24px rgba(0,0,0,0.08)` | Cards |
| `border border-gold/40` | Semi-transparent gold border | Badges, highlights |

---

## Responsive Breakpoints (Tailwind defaults)

| Breakpoint | Width | Key changes |
|---|---|---|
| (default) | 0px+ | Single column, stacked layout |
| `md` | 768px+ | 2-column hero, wider cards |
| `lg` | 1024px+ | 3-column feature grid |

---

## Icons

All icons from **lucide-react**. Consistent sizing:
- Navigation/UI: `h-4 w-4`
- Feature tiles: `h-6 w-6` or `h-8 w-8`
- Score dimension icons: `h-5 w-5`

Icons used per dimension:
| Dimension | Icon |
|---|---|
| Income Utilization | `Wallet` |
| Savings Rate | `PiggyBank` |
| Debt Health | `Landmark` |
| Investment | `TrendingUp` |
| Protection | `ShieldCheck` |
