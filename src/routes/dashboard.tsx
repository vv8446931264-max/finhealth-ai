import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useCountUp } from "@/lib/use-count-up";
import { matchProducts, type ProductMatch } from "@/lib/products";
import {
  getAIRecommendations,
  getAIScoreNarrative,
  sendChatMessage,
  isGeminiConfigured,
  type ChatMessage,
} from "@/lib/gemini";
import { Textarea } from "@/components/ui/textarea";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  RadialBar,
  RadialBarChart,
  PolarRadiusAxis,
} from "recharts";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import {
  computeScores,
  generateActionPlan,
  generateRecommendations,
  loadAssessment,
  scoreLabel,
  type Assessment,
  type Scores,
} from "@/lib/finhealth";
import {
  Download,
  Share2,
  Sparkles,
  TrendingUp,
  Wallet,
  ShieldCheck,
  Landmark,
  PiggyBank,
  CalendarCheck,
  RefreshCw,
  MessageCircle,
  Send,
  Bot,
  ChevronDown,
  ChevronUp,
  Loader2,
  Heart,
  CreditCard,
  Receipt,
  ExternalLink,
} from "lucide-react";

const PRODUCT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  PiggyBank, ShieldCheck, Heart, Landmark, RefreshCw, TrendingUp, CreditCard, Receipt,
};

// Renders **bold**, *italic*, and newlines from AI markdown
function md(text: string) {
  const segments = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return segments.flatMap((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**"))
      return [<strong key={i}>{seg.slice(2, -2)}</strong>];
    if (seg.startsWith("*") && seg.endsWith("*"))
      return [<em key={i}>{seg.slice(1, -1)}</em>];
    return seg.split("\n").flatMap((line, j, arr) =>
      j < arr.length - 1 ? [<span key={`${i}-${j}`}>{line}</span>, <br key={`${i}-${j}-br`} />] : [<span key={`${i}-${j}`}>{line}</span>]
    );
  });
}

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Financial Health Score | FinHealth AI" },
      { name: "description", content: "Your personalised Financial Health Score and 30-day plan." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<Assessment | null>(null);

  useEffect(() => {
    const a = loadAssessment();
    if (!a) navigate({ to: "/assessment" });
    else setData(a);
  }, [navigate]);

  const scores: Scores | null = useMemo(() => (data ? computeScores(data) : null), [data]);
  const recs = useMemo(() => (data && scores ? generateRecommendations(data, scores) : []), [data, scores]);
  const actions = useMemo(() => (data && scores ? generateActionPlan(data, scores) : []), [data, scores]);
  const products = useMemo(() => (data && scores ? matchProducts(data, scores) : []), [data, scores]);
  const displayScore = useCountUp(scores?.overall ?? 0);

  const [aiRecs, setAiRecs] = useState<string[]>([]);
  const [aiNarrative, setAiNarrative] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Hydrate chat from session storage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("finhealth_chat_v1");
      if (saved) setChatHistory(JSON.parse(saved));
    } catch {}
  }, []);

  // Persist chat to session storage
  useEffect(() => {
    try { sessionStorage.setItem("finhealth_chat_v1", JSON.stringify(chatHistory)); } catch {}
  }, [chatHistory]);

  useEffect(() => {
    if (!data || !scores || !isGeminiConfigured()) return;
    setAiLoading(true);
    Promise.all([getAIRecommendations(data, scores), getAIScoreNarrative(data, scores)])
      .then(([recs, narrative]) => {
        if (recs.length > 0) setAiRecs(recs);
        if (narrative) setAiNarrative(narrative);
      })
      .finally(() => setAiLoading(false));
  }, [data, scores]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatLoading]);

  // Typewriter reveal on last model reply
  useEffect(() => {
    if (!isTyping || !chatHistory.length) return;
    const lastMsg = chatHistory[chatHistory.length - 1];
    if (lastMsg.role !== "model") return;
    const words = lastMsg.text.split(" ");
    const msPerWord = Math.min(30, 4000 / Math.max(words.length, 1));
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTypewriterText(words.slice(0, i).join(" "));
      if (i >= words.length) { clearInterval(id); setIsTyping(false); }
    }, msPerWord);
    return () => clearInterval(id);
  }, [isTyping, chatHistory]);

  async function handleSendChat(textOverride?: string) {
    const userMsg = (textOverride ?? chatInput).trim();
    if (!userMsg || chatLoading || !data || !scores) return;
    if (!textOverride) setChatInput("");
    const newHistory: ChatMessage[] = [...chatHistory, { role: "user", text: userMsg }];
    setChatHistory(newHistory);
    setChatLoading(true);
    const reply = await sendChatMessage(chatHistory, userMsg, data, scores);
    setChatHistory([...newHistory, { role: "model", text: reply }]);
    setTypewriterText("");
    setIsTyping(true);
    setChatLoading(false);
  }

  if (!data || !scores) return null;

  const label = scoreLabel(scores.overall);
  const displayLabel = scoreLabel(displayScore);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-gold">Your Results</div>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl">Financial Health Dashboard</h1>
            <p className="mt-1 text-muted-foreground">A snapshot of your money, powered by IDBI Bank.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/assessment" })} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Retake
            </Button>
            <Button variant="outline" className="gap-2" onClick={async () => {
              const text = `My Financial Health Score: ${scores.overall}/100 on FinHealth AI`;
              if (navigator.share) {
                await navigator.share({ title: "FinHealth AI Score", text, url: location.origin });
              } else {
                await navigator.clipboard.writeText(location.origin);
                toast.success("Link copied!");
              }
            }}>
              <Share2 className="h-4 w-4" /> Share
            </Button>
            <Button className="gap-2 bg-navy text-white hover:bg-navy/90" onClick={() => window.print()}>
              <Download className="h-4 w-4" /> Download Report
            </Button>
          </div>
        </div>

        {/* Top row: Gauge + Radar */}
        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-muted-foreground">Overall Score</div>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: label.color }}
              >
                {label.label}
              </span>
            </div>
            <div className="relative mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="75%"
                  outerRadius="100%"
                  data={[{ name: "score", value: displayScore, fill: displayLabel.color }]}
                  startAngle={90}
                  endAngle={90 - (displayScore / 100) * 360}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background={{ fill: "oklch(0.94 0.02 260)" }} dataKey="value" cornerRadius={20} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-6xl font-extrabold text-navy tabular-nums">{displayScore}</div>
                <div className="text-sm text-muted-foreground">out of 100</div>
                <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Ahead of {Math.min(97, Math.round(scores.overall * 1.1))}%
                </div>
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
                <RadarChart
                  data={[
                    { dim: "Income", v: scores.incomeUtilization },
                    { dim: "Savings", v: scores.savingsRate },
                    { dim: "Debt", v: scores.debtHealth },
                    { dim: "Investment", v: scores.investment },
                    { dim: "Protection", v: scores.protection },
                  ]}
                >
                  <PolarGrid stroke="oklch(0.85 0.02 260)" />
                  <PolarAngleAxis dataKey="dim" tick={{ fill: "oklch(0.3 0.05 265)", fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="v" stroke="#1a237e" fill="#1a237e" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Dimension cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <DimCard icon={Wallet} title="Income Utilization" score={scores.incomeUtilization} />
          <DimCard icon={PiggyBank} title="Savings Rate" score={scores.savingsRate} />
          <DimCard icon={Landmark} title="Debt Health" score={scores.debtHealth} />
          <DimCard icon={TrendingUp} title="Investment" score={scores.investment} />
          <DimCard icon={ShieldCheck} title="Protection" score={scores.protection} />
        </div>

        {/* Recommendations + Action plan */}
        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 rounded-2xl border border-border bg-card p-6 shadow-elegant">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-gold">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">AI Recommendations</h3>
                <p className="text-xs text-muted-foreground">
                  {aiRecs.length > 0
                    ? "Generated by Gemini 2.5 Flash • Personalised for you"
                    : aiLoading
                      ? "Gemini AI is analyzing your profile..."
                      : "Ranked by highest impact on your score"}
                </p>
              </div>
              {aiLoading && <Loader2 className="ml-auto h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            <ul className="mt-5 space-y-3">
              {(aiRecs.length > 0 ? aiRecs : recs).map((r, i) => (
                <li key={i} className="flex gap-3 rounded-lg border border-border bg-secondary/40 p-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy">
                    {i + 1}
                  </div>
                  <p className="text-sm leading-relaxed">{r}</p>
                </li>
              ))}
            </ul>
            {aiRecs.length > 0 && (
              <p className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Bot className="h-3 w-3" />
                Generated by Google Gemini 2.5 Flash based on your financial profile
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
                  <div className="text-xs font-semibold uppercase tracking-widest text-gold">
                    Action {i + 1}
                  </div>
                  <div className="mt-1 text-sm">{a}</div>
                </li>
              ))}
            </ol>
            <Link
              to="/assessment"
              className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-navy transition hover:brightness-95"
            >
              Explore IDBI Products
            </Link>
          </div>
        </div>

        {/* IDBI Product Matches */}
        <div className="mt-8">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Your IDBI Product Matches</h3>
            <p className="text-sm text-muted-foreground">Chosen for your weakest dimensions</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p: ProductMatch) => {
              const Icon = PRODUCT_ICONS[p.icon] ?? Landmark;
              return (
                <div key={p.name} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-elegant">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{p.tagline}</div>
                  </div>
                  <div className="rounded-md border border-gold/20 bg-gold/8 px-3 py-2 text-xs italic text-foreground/80">
                    {p.why}
                  </div>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-1 rounded-md border border-navy/30 px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-navy/5"
                  >
                    Explore <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Financial Advisor Chat */}
        <div className="no-print mt-8 rounded-2xl border border-navy/30 bg-card shadow-elegant overflow-hidden">
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
                  : "Configure VITE_GEMINI_API_KEY to enable AI chat"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Gemini AI
              </span>
              {chatOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>

          {chatOpen && (
            <div className="border-t border-border">
              <div className="h-72 overflow-y-auto p-4 space-y-3 bg-secondary/10">
                {chatHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                    <div className="h-12 w-12 rounded-full bg-navy/10 flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-navy" />
                    </div>
                    <p className="text-sm font-medium">FinHealth AI Advisor</p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Ask me anything about improving your financial health. I know your profile!
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {["How can I improve my score?", "Best IDBI products for me?", "How to build emergency fund?", "मेरा स्कोर कैसे सुधारें?"].map(
                        (q) => (
                          <button
                            key={q}
                            onClick={() => handleSendChat(q)}
                            className="rounded-full border border-navy/20 px-3 py-1 text-xs text-navy hover:bg-navy/5 transition-colors"
                          >
                            {q}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}
                {chatHistory.map((msg, i) => {
                  const isLastModel = msg.role === "model" && i === chatHistory.length - 1;
                  const displayText = isLastModel && isTyping ? typewriterText : msg.text;
                  return (
                    <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          msg.role === "user" ? "bg-gold text-navy" : "bg-navy text-gold"
                        }`}
                      >
                        {msg.role === "user" ? "You" : <Bot className="h-4 w-4" />}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-navy text-white rounded-tr-sm"
                            : "bg-card border border-border rounded-tl-sm"
                        }`}
                      >
                        {msg.role === "model" ? md(displayText) : displayText}
                      </div>
                    </div>
                  );
                })}
                {chatLoading && (
                  <div className="flex gap-2 items-center">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-gold">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-xl bg-card border border-border px-4 py-3 flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-navy/40 animate-bounce [animation-delay:0ms]" />
                      <span className="h-2 w-2 rounded-full bg-navy/40 animate-bounce [animation-delay:150ms]" />
                      <span className="h-2 w-2 rounded-full bg-navy/40 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>
              <div className="border-t border-border bg-card">
                <div className="flex flex-wrap gap-1.5 px-3 pt-2.5">
                  {["How to improve my score?", "Best IDBI products?", "How to build emergency fund?", "Explain my debt health", "मेरा स्कोर कैसे सुधारें?"].map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSendChat(q)}
                      className="rounded-full border border-navy/20 px-2.5 py-0.5 text-[11px] text-navy hover:bg-navy/5 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 p-3">
                  <Textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleSendChat();
                      }
                    }}
                    placeholder="Ask about your finances..."
                    disabled={chatLoading}
                    className="min-h-[40px] max-h-[100px] resize-none text-sm flex-1"
                    rows={1}
                  />
                  <Button
                    onClick={handleSendChat}
                    disabled={!chatInput.trim() || chatLoading}
                    className="bg-navy text-white hover:bg-navy/90 self-end"
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function DimCard({
  icon: Icon,
  title,
  score,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  score: number;
}) {
  const l = scoreLabel(score);
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-elegant">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-navy">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: l.color }}>
          {l.label}
        </span>
      </div>
      <div className="mt-4 text-3xl font-extrabold tabular-nums text-navy">{score}</div>
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: l.color }} />
      </div>
    </div>
  );
}
