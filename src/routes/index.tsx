import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Gauge, Sparkles, ListChecks, ShieldCheck, TrendingUp, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-hero-gradient relative overflow-hidden text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/5 px-3 py-1 text-xs font-medium text-gold">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered • IDBI Hackathon 2026
            </div>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] md:text-6xl">
              Know Your <span className="text-gold">Financial Health Score</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-white/80">
              AI-powered analysis of your finances in 2 minutes. Get a personalised score,
              recommendations and a 30-day action plan — free, from IDBI Bank.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/assessment"
                className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-base font-semibold text-navy shadow-elegant transition hover:brightness-95"
              >
                Get Your Score Now <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-md border border-white/20 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
              >
                How it works
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-white/70">
              <div><span className="text-2xl font-bold text-white">2 min</span><div>to complete</div></div>
              <div className="h-8 w-px bg-white/20" />
              <div><span className="text-2xl font-bold text-white">5</span><div>dimensions scored</div></div>
              <div className="h-8 w-px bg-white/20" />
              <div><span className="text-2xl font-bold text-white">100%</span><div>private</div></div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gold/20 blur-3xl" />
            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-widest text-white/60">Your Score</div>
                <div className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs font-medium text-emerald-300">Excellent</div>
              </div>
              <div className="mt-6 flex items-end gap-4">
                <div className="text-7xl font-extrabold text-white">84</div>
                <div className="pb-2 text-sm text-white/70">/ 100</div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: "Savings Rate", v: 88 },
                  { label: "Debt Health", v: 92 },
                  { label: "Investment", v: 74 },
                  { label: "Protection", v: 81 },
                ].map((d) => (
                  <div key={d.label} className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="text-white/60">{d.label}</div>
                    <div className="mt-1 text-lg font-semibold text-white">{d.v}</div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full bg-gold" style={{ width: `${d.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
              body: "Get a 0–100 Financial Health Score across 5 dimensions in under 2 minutes.",
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
              className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-base font-semibold text-navy transition hover:brightness-95"
            >
              Start Free Assessment <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
