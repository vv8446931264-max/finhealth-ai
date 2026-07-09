export interface Assessment {
  income: number;
  essentialExpenses: number;
  discretionary: number;
  monthlySavings: number;
  investments: number;
  fixedDeposits: number;
  hasPPFNPS: boolean;
  loanOutstanding: number;
  monthlyEMI: number;
  creditCardOutstanding: number;
  creditScore: number;
  emergencyFundMonths: number;
  hasTermInsurance: boolean;
  hasHealthInsurance: boolean;
  dependents: number;
}

export const defaultAssessment: Assessment = {
  income: 0, essentialExpenses: 0, discretionary: 0,
  monthlySavings: 0, investments: 0, fixedDeposits: 0, hasPPFNPS: false,
  loanOutstanding: 0, monthlyEMI: 0, creditCardOutstanding: 0,
  creditScore: 700, emergencyFundMonths: 3,
  hasTermInsurance: false, hasHealthInsurance: false, dependents: 0,
};

export interface Scores {
  incomeUtilization: number; savingsRate: number; debtHealth: number;
  investment: number; protection: number; overall: number;
}

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

export function computeScores(a: Assessment): Scores {
  const income = Math.max(a.income, 1);
  const totalExpenses = a.essentialExpenses + a.discretionary;
  const incomeUtilization = clamp(100 - (totalExpenses / income) * 100);
  const savingsPct = (a.monthlySavings / income) * 100;
  const savingsRate = clamp((savingsPct / 20) * 100);
  const debtHealth = clamp(100 - (a.monthlyEMI / income) * 100 * 2.5);
  const annualIncome = income * 12;
  const invested = a.investments + a.fixedDeposits;
  const invPct = (invested / Math.max(annualIncome, 1)) * 100;
  let investment = clamp((invPct / 100) * 100);
  if (a.hasPPFNPS) investment = clamp(investment + 15);
  const creditNorm = clamp(((a.creditScore - 300) / 600) * 10, 0, 10);
  const protection = clamp(
    (a.hasTermInsurance ? 30 : 0) + (a.hasHealthInsurance ? 30 : 0) +
    Math.min(a.emergencyFundMonths, 6) * 5 + creditNorm,
  );
  const overall = Math.round(
    incomeUtilization * 0.2 + savingsRate * 0.2 + debtHealth * 0.2 +
    investment * 0.2 + protection * 0.2,
  );
  return {
    incomeUtilization: Math.round(incomeUtilization),
    savingsRate: Math.round(savingsRate),
    debtHealth: Math.round(debtHealth),
    investment: Math.round(investment),
    protection: Math.round(protection),
    overall,
  };
}

export function scoreLabel(score: number): { label: string; color: string } {
  if (score <= 40) return { label: "Poor", color: "#ef4444" };
  if (score <= 60) return { label: "Fair", color: "#f97316" };
  if (score <= 80) return { label: "Good", color: "#eab308" };
  return { label: "Excellent", color: "#22c55e" };
}

export function generateRecommendations(a: Assessment, s: Scores): string[] {
  const recs = [
    { score: s.savingsRate, text: s.savingsRate < 60
      ? `Increase monthly savings to ₹${Math.round(a.income * 0.2).toLocaleString("en-IN")} (20% of income). Automate a standing instruction on salary day.`
      : `Savings discipline is strong — step up SIPs by 10% this year.` },
    { score: s.debtHealth, text: s.debtHealth < 60
      ? `EMI-to-income ratio is high. Prioritise clearing credit card (₹${a.creditCardOutstanding.toLocaleString("en-IN")}) before new borrowing.`
      : `Debt is well managed. Avoid new unsecured borrowing.` },
    { score: s.protection, text: !a.hasTermInsurance && a.dependents > 0
      ? `You have ${a.dependents} dependent(s) but no term insurance. Buy a pure term plan — costs less than a coffee a day.`
      : !a.hasHealthInsurance
        ? `Add a family floater health cover of ₹5 lakh minimum.`
        : a.emergencyFundMonths < 6
          ? `Build emergency fund to 6 months of expenses in an IDBI liquid FD.`
          : `Safety net is solid. Review nominees annually.` },
    { score: s.investment, text: s.investment < 60
      ? `Start a monthly SIP of ₹${Math.max(2500, Math.round(a.income * 0.1)).toLocaleString("en-IN")} via IDBI Bank to build long-term wealth.`
      : `Investments on track. Rebalance equity/debt/gold annually.` },
    { score: s.incomeUtilization, text: s.incomeUtilization < 60
      ? `Discretionary spend (₹${a.discretionary.toLocaleString("en-IN")}/month) is high. Try a 50/30/20 budget for 3 months.`
      : `Spending well controlled — great foundation for wealth creation.` },
  ];
  return recs.sort((x, y) => x.score - y.score).map(r => r.text);
}

export function generateActionPlan(a: Assessment, s: Scores): string[] {
  return [
    !a.hasHealthInsurance
      ? "Week 1: Get a family health insurance quote from IDBI Federal Life."
      : !a.hasTermInsurance && a.dependents > 0
        ? "Week 1: Apply for a term life insurance plan online."
        : "Week 1: Review and update nominees on all bank & investment accounts.",
    "Week 2: Set up auto-debit SIP of at least 10% of salary on the 1st of every month.",
    a.creditCardOutstanding > 0
      ? `Week 3: Pay ₹${Math.min(a.creditCardOutstanding, Math.round(a.income * 0.3)).toLocaleString("en-IN")} towards credit card to reduce interest burden.`
      : "Week 3: Check your credit report free at cibil.com and dispute any errors.",
  ];
}

const KEY = "finhealth_assessment_v1";
export function saveAssessment(a: Assessment) {
  if (typeof window !== "undefined") sessionStorage.setItem(KEY, JSON.stringify(a));
}
export function loadAssessment(): Assessment | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as Assessment) : null;
}
