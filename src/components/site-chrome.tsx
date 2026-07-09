import { Landmark } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a href="#/" className="flex items-center gap-2 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gold">
            <Landmark className="h-5 w-5 text-navy" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-wide">FinHealth AI</div>
            <div className="text-[10px] uppercase tracking-widest text-gold">IDBI Bank</div>
          </div>
        </a>
        <nav className="hidden gap-6 text-sm text-white/80 md:flex">
          <a href="#/" className="hover:text-gold transition-colors">Home</a>
          <a href="#/assessment" className="hover:text-gold transition-colors">Assessment</a>
        </nav>
        <a href="#/assessment" className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-navy transition hover:brightness-95">
          Get Score
        </a>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-navy text-white/70">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gold">
              <Landmark className="h-4 w-4 text-navy" />
            </div>
            <span className="font-bold">FinHealth AI</span>
          </div>
          <p className="mt-3 text-sm">An IDBI Bank initiative to help customers build stronger financial futures.</p>
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Products</div>
          <ul className="mt-3 space-y-1 text-sm">
            <li>Savings Accounts</li><li>Home Loans</li><li>Mutual Funds</li><li>Fixed Deposits</li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Contact</div>
          <ul className="mt-3 space-y-1 text-sm">
            <li>1800-209-4324 (Toll Free)</li>
            <li>customercare@idbi.co.in</li>
            <li>IDBI Tower, WTC Complex, Mumbai</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} IDBI Bank Ltd. Built for the IDBI Hackathon. Scores are indicative.
      </div>
    </footer>
  );
}
