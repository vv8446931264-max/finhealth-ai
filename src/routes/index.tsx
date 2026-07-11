import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Gauge, Sparkles, ListChecks, ShieldCheck, TrendingUp, ArrowRight } from "lucide-react";
import { useCountUp } from "@/lib/use-count-up";

export const Route = createFileRoute("/")({
  component: Landing,
});

const DIMS = [
  { label: "Savings Rate", v: 82, color: "#f9a825" },
  { label: "Debt Health", v: 91, color: "#4ade80" },
  { label: "Investment", v: 67, color: "#60a5fa" },
];

function FloatingScoreCard() {
  return (
    <div className="card-float hidden lg:flex lg:items-center lg:justify-center">
      <div className="w-72 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex flex-col items-center">
          <div className="relative h-32 w-32">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke="#f9a825" strokeWidth="10"
                strokeDasharray={`${(78 / 100) * 314} 314`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white">78</span>
              <span className="text-xs font-semibold text-emerald-400">Good</span>
            </div>
          </div>
          <div className="mt-1 text-xs text-white/60">Financial Health Score</div>
        </div>
        <div className="mt-4 space-y-3">
          {DIMS.map((d) => (
            <div key={d.label}>
              <div className="mb-1 flex justify-between text-xs text-white/70">
                <span>{d.label}</span>
                <span className="font-semibold text-white">{d.v}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full" style={{ width: `${d.v}%`, backgroundColor: d.color }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-white/40">
          <span>Powered by Gemini AI</span>
          <Sparkles className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}

function Landing() {
  const dimCount = useCountUp(5);
  const minCount = useCountUp(3);
  const privCount = useCountUp(100);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-hero-gradient relative overflow-hidden text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:py-28 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/5 px-3 py-1 text-xs font-medium text-gold">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered • IDBI Hackathon 2026
            </div>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] md:text-5xl">
              Know your{" "}
              <span className="text-gold">Financial Health Score</span>{" "}
              in 3 minutes
            </h1>
            <p className="mt-5 max-w-lg text-lg text-white/80">
              Gemini AI analyses your money across 5 dimensions and matches you with the right IDBI products — free, private, no login.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/assessment"
                className="btn-shimmer inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-base font-semibold text-navy shadow-elegant transition hover:brightness-95"
              >
                Get My Free Score <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-md border border-white/20 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
              >
                How it works
              </a>
            </div>

            {/* Animated stats strip */}
            <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-white/70">
              <div>
                <span className="text-2xl font-bold text-white">{dimCount}</span>
                <div>dimensions analysed</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <span className="text-2xl font-bold text-white">{minCount} min</span>
                <div>to your score</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <span className="text-2xl font-bold text-white">{privCount}%</span>
                <div>private</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <span className="text-2xl font-bold text-white">24×7</span>
                <div>AI advisor</div>
              </div>
            </div>

            {/* Trust bar */}
            <p className="mt-5 text-xs text-white/40">
              Secured on Google Cloud · Vertex AI Gemini · Data stays in your session · No account needed
            </p>
          </div>

          <FloatingScoreCard />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Why FinHealth AI</div>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Built to make you financially confident</h2>
          <p className="mt-3 text-muted-foreground">
            A complete picture of your money — powered by IDBI Bank's financial intelligence.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Gauge,
              title: "Instant Score",
              body: "Get a 0–100 Financial Health Score across 5 dimensions in under 3 minutes.",
            },
            {
              icon: Sparkles,
              title: "Personalised Tips",
              body: "AI-generated recommendations tailored to your income, debts and life stage.",
            },
            {
              icon: ListChecks,
              title: "30-Day Action Plan",
              body: "Three concrete steps to take this month to improve your score fast.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-6 shadow-elegant transition hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-gold">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-6 rounded-3xl bg-navy p-10 text-white md:grid-cols-3">
          {[
            { icon: ShieldCheck, k: "Bank-grade", v: "Privacy & security" },
            { icon: TrendingUp, k: "5 dimensions", v: "Income, savings, debt, investment, protection" },
            { icon: Sparkles, k: "AI insights", v: "Recommendations that adapt to you" },
          ].map((x) => (
            <div key={x.k} className="flex items-start gap-4">
              <x.icon className="mt-1 h-6 w-6 text-gold" />
              <div>
                <div className="font-semibold">{x.k}</div>
                <div className="text-sm text-white/70">{x.v}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-navy to-[oklch(0.28_0.12_275)] p-10 text-white md:p-14">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl font-bold md:text-3xl">Ready to know your number?</h3>
              <p className="mt-2 max-w-lg text-white/80">
                Answer 12 quick questions and unlock your Financial Health Score with a personalised plan.
              </p>
            </div>
            <Link
              to="/assessment"
              className="btn-shimmer inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-base font-semibold text-navy transition hover:brightness-95"
            >
              Get My Free Score <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
