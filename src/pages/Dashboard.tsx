import { useEffect, useMemo, useRef, useState } from "react";
import {
  PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer,
  RadialBar, RadialBarChart, PolarRadiusAxis,
} from "recharts";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  computeScores, generateActionPlan, generateRecommendations,
  loadAssessment, scoreLabel, type Assessment, type Scores,
} from "@/lib/finhealth";
import {
  getAIRecommendations, getAIScoreNarrative, sendChatMessage,
  isGeminiConfigured, type ChatMessage,
} from "@/lib/gemini";
import {
  Download, Share2, Sparkles, TrendingUp, Wallet, ShieldCheck,
  Landmark, PiggyBank, CalendarCheck, RefreshCw, Bot, Send,
  ChevronDown, ChevronUp, Loader2,
} from "lucide-react";

export default function Dashboard({ navigate }: { navigate: (p: string) => void }) {
  const [data, setData] = useState<Assessment | null>(null);

  useEffect(() => {
    const a = loadAssessment();
    if (!a) navigate("/assessment");
    else setData(a);
  }, []);

  const scores: Scores | null = useMemo(() => (data ? computeScores(data) : null), [data]);
  const recs = useMemo(() => (data && scores ? generateRecommendations(data, scores) : []), [data, scores]);
  const actions = useMemo(() => (data && scores ? generateActionPlan(data, scores) : []), [data, scores]);

  const [aiRecs, setAiRecs] = useState<string[]>([]);
  const [aiNarrative, setAiNarrative] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || !scores || !isGeminiConfigured()) return;
    setAiLoading(true);
    Promise.all([getAIRecommendations(data, scores), getAIScoreNarrative(data, scores)])
      .then(([newRecs, narrative]) => {
        if (newRecs.length > 0) setAiRecs(newRecs);
        if (narrative) setAiNarrative(narrative);
      })
      .finally(() => setAiLoading(false));
  }, [data, scores]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatLoading]);

  async function handleSendChat() {
    if (!chatInput.trim() || chatLoading || !data || !scores) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    const newHistory: ChatMessage[] = [...chatHistory, { role: "user", text: userMsg }];
    setChatHistory(newHistory);
    setChatLoading(true);
    const reply = await sendChatMessage(chatHistory, userMsg, data, scores);
    setChatHistory([...newHistory, { role: "model", text: reply }]);
    setChatLoading(false);
  }

  if (!data || !scores) return null;
  const label = scoreLabel(scores.overall);
  const displayRecs = aiRecs.length > 0 ? aiRecs : recs;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-gold">Your Results</div>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl">Financial Health Dashboard</h1>
            <p className="mt-1 text-muted-foreground">A snapshot of your money, powered by IDBI Bank.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/assessment")} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Retake
            </Button>
            <Button variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" /> Share
            </Button>
            <Button className="gap-2 bg-navy text-white hover:bg-navy/90">
              <Download className="h-4 w-4" /> Download Report
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-muted-foreground">Overall Score</div>
              <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: label.color }}>
                {label.label}
              </span>
            </div>
            <div className="relative mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="75%" outerRadius="100%"
                  data={[{ name: "score", value: scores.overall, fill: label.color }]}
                  startAngle={90} endAngle={90 - (scores.overall / 100) * 360}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background={{ fill: "#e8eaf6" }} dataKey="value" cornerRadius={20} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl font-extrabold text-navy tabular-nums">{scores.overall}</div>
                <div className="text-sm text-muted-foreground">out of 100</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-1 text-center text-[10px] font-medium">
              <div className="rounded bg-rose-500 py-1 text-white">0–40</div>
              <div className="rounded bg-orange-500 py-1 text-white">41–60</div>
              <div className="rounded bg-yellow-500 py-1 text-white">61–80</div>
              <div className="rounded bg-emerald-500 py-1 text-white">81–100</div>
            </div>
            {aiNarrative && (
              <div className="mt-4 rounded-lg border border-navy/20 bg-navy/5 p-3">
                <p className="text-xs text-foreground/80 italic leading-relaxed">{aiNarrative}</p>
                <div className="mt-1.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-gold" />
                  <span className="text-[10px] font-semibold text-gold">Powered by Gemini AI</span>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 rounded-2xl border border-border bg-card p-6 shadow-elegant">
            <div className="text-sm font-semibold text-muted-foreground">Dimension Breakdown</div>
            <div className="mt-2 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={[
                  { dim: "Income", v: scores.incomeUtilization },
                  { dim: "Savings", v: scores.savingsRate },
                  { dim: "Debt", v: scores.debtHealth },
                  { dim: "Investment", v: scores.investment },
                  { dim: "Protection", v: scores.protection },
                ]}>
                  <PolarGrid stroke="#c5cae9" />
                  <PolarAngleAxis dataKey="dim" tick={{ fill: "#3949ab", fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="v" stroke="#1a237e" fill="#1a237e" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <DimCard icon={Wallet} title="Income Utilization" score={scores.incomeUtilization} />
          <DimCard icon={PiggyBank} title="Savings Rate" score={scores.savingsRate} />
          <DimCard icon={Landmark} title="Debt Health" score={scores.debtHealth} />
          <DimCard icon={TrendingUp} title="Investment" score={scores.investment} />
          <DimCard icon={ShieldCheck} title="Protection" score={scores.protection} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 rounded-2xl border border-border bg-card p-6 shadow-elegant">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-gold">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">AI Recommendations</h3>
                <p className="text-xs text-muted-foreground">
                  {aiRecs.length > 0
                    ? "Generated by Gemini 1.5 Flash • Personalised for you"
                    : aiLoading
                    ? "Gemini AI is analyzing your profile..."
                    : "Ranked by highest impact on your score"}
                </p>
              </div>
              {aiLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            <ul className="mt-5 space-y-3">
              {displayRecs.map((r, i) => (
                <li key={i} className="flex gap-3 rounded-lg border border-border bg-secondary/40 p-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy">{i + 1}</div>
                  <p className="text-sm leading-relaxed">{r}</p>
                </li>
              ))}
            </ul>
            {aiRecs.length > 0 && (
              <p className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Bot className="h-3 w-3" />
                Generated by Google Gemini 1.5 Flash based on your financial profile
              </p>
            )}
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-border bg-navy p-6 text-white shadow-elegant">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-navy">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">30-Day Action Plan</h3>
                <p className="text-xs text-white/70">Three moves to make this month</p>
              </div>
            </div>
            <ol className="mt-5 space-y-3">
              {actions.map((a, i) => (
                <li key={i} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="text-xs font-semibold uppercase tracking-widest text-gold">Action {i + 1}</div>
                  <div className="mt-1 text-sm">{a}</div>
                </li>
              ))}
            </ol>
            <a href="#/assessment" className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-navy transition hover:brightness-95">
              Explore IDBI Products
            </a>
          </div>
        </div>

        {/* AI Chat Advisor */}
        <div className="mt-8 rounded-2xl border border-navy/30 bg-card shadow-elegant overflow-hidden">
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="flex w-full items-center gap-3 p-5 text-left hover:bg-secondary/30 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-gold">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Ask Your AI Financial Advisor</h3>
              <p className="text-xs text-muted-foreground">
                {isGeminiConfigured()
                  ? "Chat with Gemini AI • Personalised to your financial profile"
                  : "Add VITE_GEMINI_API_KEY to .env to enable AI chat"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Gemini AI</span>
              {chatOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </button>

          {chatOpen && (
            <div className="border-t border-border">
              <div className="h-72 overflow-y-auto p-4 space-y-3 bg-secondary/10">
                {chatHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                    <div className="h-12 w-12 rounded-full bg-navy/10 flex items-center justify-center">
                      <Bot className="h-6 w-6 text-navy" />
                    </div>
                    <p className="text-sm font-medium">FinHealth AI Advisor</p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Ask me anything about improving your financial health. I know your profile!
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {["How can I improve my score?", "Best IDBI products for me?", "How to build emergency fund?"].map((q) => (
                        <button key={q} onClick={() => setChatInput(q)}
                          className="rounded-full border border-navy/20 px-3 py-1 text-xs text-navy hover:bg-navy/5 transition-colors">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${msg.role === "user" ? "bg-gold text-navy" : "bg-navy text-gold"}`}>
                      {msg.role === "user" ? "You" : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${msg.role === "user" ? "bg-navy text-white rounded-tr-sm" : "bg-card border border-border rounded-tl-sm"}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-2 items-center">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-gold">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-xl bg-card border border-border px-3 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>
              <div className="border-t border-border p-3 flex gap-2 bg-card">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                  placeholder={isGeminiConfigured() ? "Ask about your finances..." : "Add VITE_GEMINI_API_KEY to enable AI chat..."}
                  disabled={!isGeminiConfigured() || chatLoading}
                  className="min-h-[40px] max-h-[100px] resize-none text-sm flex-1"
                  rows={1}
                />
                <Button onClick={handleSendChat} disabled={!chatInput.trim() || !isGeminiConfigured() || chatLoading}
                  className="bg-navy text-white hover:bg-navy/90 self-end" size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function DimCard({ icon: Icon, title, score }: { icon: React.ComponentType<{ className?: string }>; title: string; score: number }) {
  const l = scoreLabel(score);
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-elegant">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-navy">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: l.color }}>{l.label}</span>
      </div>
      <div className="mt-4 text-3xl font-extrabold tabular-nums text-navy">{score}</div>
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: l.color }} />
      </div>
    </div>
  );
}
