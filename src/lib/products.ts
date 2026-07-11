import type { Assessment, Scores } from "./finhealth";

export interface ProductMatch {
  name: string;
  tagline: string;
  why: string;
  url: string;
  icon: string; // lucide icon name
}

export function matchProducts(a: Assessment, s: Scores): ProductMatch[] {
  const matches: ProductMatch[] = [];
  const income = Math.max(a.income, 1);
  const emiPct = Math.round((a.monthlyEMI / income) * 100);

  if (s.savingsRate < 60)
    matches.push({
      name: "IDBI Recurring Deposit",
      tagline: "Build a monthly saving habit, from ₹500",
      why: `Your savings score is ${s.savingsRate}/100 — an RD automates the habit.`,
      url: "https://www.idbibank.in/recurring-deposit.aspx",
      icon: "PiggyBank",
    });

  if (!a.hasTermInsurance)
    matches.push({
      name: "Ageas Federal Term Life (IDBI partner)",
      tagline: `Protect ${a.dependents} dependents at low premium`,
      why: `You have ${a.dependents} dependents and no term cover.`,
      url: "https://www.idbibank.in/insurance.aspx",
      icon: "ShieldCheck",
    });

  if (!a.hasHealthInsurance)
    matches.push({
      name: "Health Insurance (IDBI bancassurance)",
      tagline: "Hospital bills shouldn't wreck your plan",
      why: "One hospitalisation can erase years of savings.",
      url: "https://www.idbibank.in/insurance.aspx",
      icon: "Heart",
    });

  if (a.emergencyFundMonths < 3)
    matches.push({
      name: "IDBI Sweep-in FD",
      tagline: "Emergency fund that earns FD rates",
      why: `You have ${a.emergencyFundMonths} months of emergency cover; target 6.`,
      url: "https://www.idbibank.in/fixed-deposit.aspx",
      icon: "Landmark",
    });

  if (s.debtHealth < 60)
    matches.push({
      name: "IDBI Loan Balance Transfer",
      tagline: "Move EMIs to lower rates",
      why: `EMI is ${emiPct}% of your income — a transfer can cut it.`,
      url: "https://www.idbibank.in/home-loan-balance-transfer.aspx",
      icon: "RefreshCw",
    });

  if (s.investment < 60)
    matches.push({
      name: "Mutual Fund SIP via IDBI Bank",
      tagline: "Start with ₹500/month",
      why: `Your investment score is ${s.investment}/100 — SIPs compound early.`,
      url: "https://www.idbibank.in/mutual-funds.aspx",
      icon: "TrendingUp",
    });

  if (a.creditScore < 650)
    matches.push({
      name: "Secured Credit Card against FD",
      tagline: "Rebuild your credit score safely",
      why: `Credit score ${a.creditScore} — secured card reports positive history.`,
      url: "https://www.idbibank.in/credit-card.aspx",
      icon: "CreditCard",
    });

  if (matches.length === 0)
    matches.push({
      name: "IDBI Suvidha Tax-Saving FD",
      tagline: "Save tax under 80C at FD safety",
      why: "Strong profile — optimise taxes next.",
      url: "https://www.idbibank.in/tax-saving-fixed-deposit.aspx",
      icon: "Receipt",
    });

  return matches.slice(0, 4);
}
