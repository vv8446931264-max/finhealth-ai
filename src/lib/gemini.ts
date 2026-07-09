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

export async function getAIRecommendations(assessment: Assessment, scores: Scores): Promise<string[]> {
  const prompt = `You are an expert Indian personal finance advisor for IDBI Bank.
Customer financial health scores: Overall ${scores.overall}/100, Income Utilization ${scores.incomeUtilization}/100, Savings Rate ${scores.savingsRate}/100, Debt Health ${scores.debtHealth}/100, Investment ${scores.investment}/100, Protection ${scores.protection}/100.
Financial details: Monthly Income ₹${assessment.income.toLocaleString("en-IN")}, Monthly Savings ₹${assessment.monthlySavings.toLocaleString("en-IN")}, Monthly EMI ₹${assessment.monthlyEMI.toLocaleString("en-IN")}, Credit Score ${assessment.creditScore}, Emergency Fund ${assessment.emergencyFundMonths} months, Term Insurance: ${assessment.hasTermInsurance}, Health Insurance: ${assessment.hasHealthInsurance}, Dependents: ${assessment.dependents}.
Give exactly 5 personalized actionable recommendations. Suggest IDBI Bank products where relevant. Respond ONLY with a JSON array of 5 strings, no markdown:
["rec1","rec2","rec3","rec4","rec5"]`;
  try {
    const text = (await generate([{ role: "user", parts: [{ text: prompt }] }])).trim();
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export async function getAIScoreNarrative(assessment: Assessment, scores: Scores): Promise<string> {
  const prompt = `You are an expert Indian personal finance advisor for IDBI Bank. A customer scored ${scores.overall}/100 on their Financial Health Score. Breakdown: Income Utilization ${scores.incomeUtilization}, Savings ${scores.savingsRate}, Debt Health ${scores.debtHealth}, Investments ${scores.investment}, Protection ${scores.protection}. Monthly income ₹${assessment.income.toLocaleString("en-IN")}, Dependents: ${assessment.dependents}. Write a warm, personalized 2-sentence plain English summary. Mention their strongest and weakest area. Address them as "you". Under 60 words.`;
  try { return (await generate([{ role: "user", parts: [{ text: prompt }] }])).trim(); } catch { return ""; }
}

export interface ChatMessage { role: "user" | "model"; text: string; }

export async function sendChatMessage(history: ChatMessage[], userMessage: string, assessment: Assessment, scores: Scores): Promise<string> {
  const sys = `You are FinHealth AI Advisor, a friendly Indian personal finance advisor for IDBI Bank. Customer: Score ${scores.overall}/100, Income ₹${assessment.income.toLocaleString("en-IN")}/month, Savings ₹${assessment.monthlySavings.toLocaleString("en-IN")}/month, EMI ₹${assessment.monthlyEMI.toLocaleString("en-IN")}/month, Credit Score ${assessment.creditScore}, Emergency Fund ${assessment.emergencyFundMonths} months, Term Insurance: ${assessment.hasTermInsurance}, Health Insurance: ${assessment.hasHealthInsurance}, Dependents: ${assessment.dependents}. Be conversational, specific to their numbers, recommend IDBI products. Under 150 words.`;
  const contents = [
    { role: "user", parts: [{ text: sys }] },
    { role: "model", parts: [{ text: "Understood! Ready to help with personalized financial advice." }] },
    ...history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: "user", parts: [{ text: userMessage }] },
  ];
  try { return (await generate(contents)).trim(); } catch { return "Sorry, I encountered an error. Please try again."; }
}
