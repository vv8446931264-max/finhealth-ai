import type { Assessment, Scores } from "./finhealth";

async function generate(contents: object[]): Promise<string> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export const isGeminiConfigured = () => true;

export async function getAIRecommendations(a: Assessment, s: Scores): Promise<string[]> {
  const prompt = `You are an expert Indian personal finance advisor for IDBI Bank. Customer health: Overall ${s.overall}/100, Income Utilization ${s.incomeUtilization}, Savings ${s.savingsRate}, Debt Health ${s.debtHealth}, Investment ${s.investment}, Protection ${s.protection}. Income ₹${a.income.toLocaleString("en-IN")}/month, Savings ₹${a.monthlySavings.toLocaleString("en-IN")}/month, EMI ₹${a.monthlyEMI.toLocaleString("en-IN")}/month, Credit Score ${a.creditScore}, Emergency Fund ${a.emergencyFundMonths}mo, Term Insurance: ${a.hasTermInsurance}, Health Insurance: ${a.hasHealthInsurance}, Dependents: ${a.dependents}, CC Outstanding ₹${a.creditCardOutstanding.toLocaleString("en-IN")}, Investments+FDs ₹${(a.investments+a.fixedDeposits).toLocaleString("en-IN")}. Give exactly 5 personalized actionable recommendations specific to their numbers. Suggest IDBI Bank products (IDBI FD, SIP, IDBI Federal Life Insurance etc). Respond ONLY as JSON array of 5 strings: ["rec1","rec2","rec3","rec4","rec5"]`;
  try {
    const text = (await generate([{ role: "user", parts: [{ text: prompt }] }])).trim();
    const m = text.match(/\[[\s\S]*\]/);
    if (!m) return [];
    const p = JSON.parse(m[0]);
    return Array.isArray(p) ? p : [];
  } catch { return []; }
}

export async function getAIScoreNarrative(a: Assessment, s: Scores): Promise<string> {
  const prompt = `Indian personal finance advisor, IDBI Bank. Customer scored ${s.overall}/100. Scores: Income ${s.incomeUtilization}, Savings ${s.savingsRate}, Debt ${s.debtHealth}, Investment ${s.investment}, Protection ${s.protection}. Income ₹${a.income.toLocaleString("en-IN")}/month, ${a.dependents} dependents. Write warm 2-sentence personalized summary. Mention strongest and weakest area. Address as "you". Under 60 words. Plain text only.`;
  try { return (await generate([{ role: "user", parts: [{ text: prompt }] }])).trim(); } catch { return ""; }
}

export interface ChatMessage { role: "user" | "model"; text: string; }

export async function sendChatMessage(history: ChatMessage[], userMessage: string, a: Assessment, s: Scores): Promise<string> {
  const sys = `You are FinHealth AI Advisor for IDBI Bank. Customer: Score ${s.overall}/100, Income ₹${a.income.toLocaleString("en-IN")}/month, Savings ₹${a.monthlySavings.toLocaleString("en-IN")}/month, EMI ₹${a.monthlyEMI.toLocaleString("en-IN")}/month, Credit Score ${a.creditScore}, Emergency Fund ${a.emergencyFundMonths} months, Term Insurance: ${a.hasTermInsurance}, Health Insurance: ${a.hasHealthInsurance}, Dependents: ${a.dependents}. Be conversational, specific to their numbers, recommend IDBI products. Under 150 words. Plain text.`;
  const contents = [
    { role: "user", parts: [{ text: sys }] },
    { role: "model", parts: [{ text: "Ready to help with personalized financial advice!" }] },
    ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: "user", parts: [{ text: userMessage }] },
  ];
  try { return (await generate(contents)).trim(); } catch { return "Sorry, try again."; }
}
