import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle2, IndianRupee } from "lucide-react";
import { defaultAssessment, saveAssessment, type Assessment } from "@/lib/finhealth";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Financial Health Assessment | FinHealth AI" },
      { name: "description", content: "Answer 12 quick questions to get your Financial Health Score." },
    ],
  }),
  component: AssessmentPage,
});

const STEPS = ["Income & Expenses", "Savings & Investments", "Debt & Liabilities", "Protection & Emergency"];

function AssessmentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Assessment>(defaultAssessment);

  const update = <K extends keyof Assessment>(key: K, value: Assessment[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else {
      saveAssessment(data);
      navigate({ to: "/dashboard" });
    }
  };
  const back = () => step > 0 && setStep(step - 1);

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 md:py-16">
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm">
            <div className="font-semibold text-navy">Step {step + 1} of {STEPS.length}</div>
            <div className="text-muted-foreground">{Math.round(progress)}% complete</div>
          </div>
          <Progress value={progress} className="mt-2 h-2" />
          <div className="mt-4 flex flex-wrap gap-2">
            {STEPS.map((label, i) => (
              <div
                key={label}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                  i < step
                    ? "border-emerald-500/40 bg-emerald-50 text-emerald-700"
                    : i === step
                      ? "border-navy bg-navy text-white"
                      : "border-border bg-card text-muted-foreground"
                }`}
              >
                {i < step && <CheckCircle2 className="h-3.5 w-3.5" />}
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant md:p-10">
          <h2 className="text-2xl font-bold">{STEPS[step]}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {step === 0 && "Tell us about your monthly cash flow."}
            {step === 1 && "How much are you saving and investing?"}
            {step === 2 && "What are you paying back?"}
            {step === 3 && "How protected are you against surprises?"}
          </p>

          <div className="mt-8 space-y-6">
            {step === 0 && (
              <>
                <MoneyField label="Monthly take-home income" value={data.income} onChange={(v) => update("income", v)} placeholder="e.g. 75000" />
                <MoneyField label="Monthly essential expenses (rent, groceries, utilities)" value={data.essentialExpenses} onChange={(v) => update("essentialExpenses", v)} placeholder="e.g. 28000" />
                <MoneyField label="Monthly discretionary spending (dining, entertainment, shopping)" value={data.discretionary} onChange={(v) => update("discretionary", v)} placeholder="e.g. 12000" />
              </>
            )}
            {step === 1 && (
              <>
                <MoneyField label="Monthly savings amount" value={data.monthlySavings} onChange={(v) => update("monthlySavings", v)} placeholder="e.g. 15000" />
                <MoneyField label="Total invested in mutual funds / stocks" value={data.investments} onChange={(v) => update("investments", v)} placeholder="e.g. 350000" />
                <MoneyField label="Total in Fixed Deposits / RD" value={data.fixedDeposits} onChange={(v) => update("fixedDeposits", v)} placeholder="e.g. 200000" />
                <ToggleField label="Do you have a PPF or NPS account?" value={data.hasPPFNPS} onChange={(v) => update("hasPPFNPS", v)} />
              </>
            )}
            {step === 2 && (
              <>
                <MoneyField label="Total outstanding loan amount (home, car, personal)" value={data.loanOutstanding} onChange={(v) => update("loanOutstanding", v)} placeholder="e.g. 1200000" />
                <MoneyField label="Monthly EMI payments" value={data.monthlyEMI} onChange={(v) => update("monthlyEMI", v)} placeholder="e.g. 22000" />
                <MoneyField label="Credit card outstanding" value={data.creditCardOutstanding} onChange={(v) => update("creditCardOutstanding", v)} placeholder="e.g. 15000" />
                <SliderField
                  label="Existing credit score"
                  min={300}
                  max={900}
                  step={10}
                  value={data.creditScore}
                  onChange={(v) => update("creditScore", v)}
                  suffix=""
                />
              </>
            )}
            {step === 3 && (
              <>
                <SliderField
                  label="Emergency fund (in months of expenses)"
                  min={0}
                  max={12}
                  step={1}
                  value={data.emergencyFundMonths}
                  onChange={(v) => update("emergencyFundMonths", v)}
                  suffix=" months"
                />
                <ToggleField label="Do you have term life insurance?" value={data.hasTermInsurance} onChange={(v) => update("hasTermInsurance", v)} />
                <ToggleField label="Do you have health insurance?" value={data.hasHealthInsurance} onChange={(v) => update("hasHealthInsurance", v)} />
                <div>
                  <Label className="text-sm font-medium">Number of dependents</Label>
                  <Input
                    type="number"
                    min={0}
                    value={data.dependents}
                    onChange={(e) => update("dependents", Math.max(0, parseInt(e.target.value || "0")))}
                    className="mt-2 h-11"
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-10 flex items-center justify-between">
            <Button variant="ghost" onClick={back} disabled={step === 0} className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={next}
              className="gap-2 bg-navy text-white hover:bg-navy/90"
              disabled={step === 0 && data.income <= 0}
            >
              {step === STEPS.length - 1 ? "See My Score" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function MoneyField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="relative mt-2">
        <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="number"
          min={0}
          value={value || ""}
          placeholder={placeholder}
          onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value || "0")))}
          className="h-11 pl-9"
        />
      </div>
    </div>
  );
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 p-4">
      <Label className="text-sm font-medium">{label}</Label>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

function SliderField({
  label,
  min,
  max,
  step,
  value,
  onChange,
  suffix,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-sm font-semibold text-navy">{value}{suffix}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="mt-4"
      />
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  );
}
