import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { countries, countryBySlug } from "@/data/countries";
import { formatUSD } from "@/config/site";
import { useSiteSettings } from "@/lib/site-settings";
import { track } from "@/components/analytics-tracker";

export const Route = createFileRoute("/start")({
  head: () => ({
    meta: [
      { title: "ابدأ رحلتك | Travel Smart Budget" },
      {
        name: "description",
        content:
          "أجب عن ست خطوات قصيرة واحصل على توصية مخصصة: صفحة الدولة المجانية، حاسبة التكلفة، الدليل الكامل أو خدمة التخطيط.",
      },
      { property: "og:title", content: "ابدأ رحلتك | Travel Smart Budget" },
      {
        property: "og:description",
        content: "خطوات قصيرة تقودك إلى الأداة المناسبة لتحضير رحلتك.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/start" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/start" }],
  }),
  component: StartJourney,
});

interface Answers {
  from: string;
  destination: string;
  budget: string;
  start: string;
  end: string;
  style: string;
  travellers: string;
}

const STYLES = [
  { key: "budget", label: "اقتصادي" },
  { key: "balanced", label: "متوازن" },
  { key: "comfort", label: "مريح" },
  { key: "luxury", label: "فاخر" },
];

const STEPS = ["نقطة الانطلاق", "الوجهة", "الميزانية", "التواريخ", "أسلوب السفر", "عدد المسافرين"];

function StartJourney() {
  const { pricing } = useSiteSettings();
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({
    from: "",
    destination: "",
    budget: "",
    start: "",
    end: "",
    style: "balanced",
    travellers: "2",
  });
  const [done, setDone] = useState(false);

  const country = a.destination ? countryBySlug(a.destination) : undefined;

  const nights = useMemo(() => {
    if (!a.start || !a.end) return 0;
    const diff = (new Date(a.end).getTime() - new Date(a.start).getTime()) / 86_400_000;
    return diff > 0 ? Math.round(diff) : 0;
  }, [a.start, a.end]);

  const budget = Number(a.budget) || 0;
  const travellers = Math.max(1, Number(a.travellers) || 1);
  const perPersonPerNight = nights > 0 ? budget / travellers / nights : 0;

  const recommendation = useMemo(() => {
    const complex = nights >= 12 || travellers >= 4 || a.style === "luxury";
    const tight = perPersonPerNight > 0 && perPersonPerNight < 60;
    if (complex) return "planning";
    if (country) return tight ? "calculator" : "guide";
    return "explore";
  }, [nights, travellers, a.style, perPersonPerNight, country]);

  const set = (k: keyof Answers) => (v: string) => setA((p) => ({ ...p, [k]: v }));

  function finish() {
    setDone(true);
    track("start_journey_completed", { recommendation, style: a.style }, a.destination || undefined);
  }

  return (
    <>
      <section className="surface-deep py-14">
        <div className="container-page">
          <h1 className="text-3xl font-black sm:text-4xl">ابدأ رحلتك</h1>
          <p className="mt-3 max-w-2xl text-balance-ar text-sm opacity-85">
            ست خطوات قصيرة، ثم نوجّهك إلى الأداة الأنسب لك: معلومات مجانية، تقدير تكلفة، دليل
            كامل، أو تخطيط مخصص.
          </p>
        </div>
      </section>

      <section className="container-page py-12">
        {!done ? (
          <div className="mx-auto max-w-2xl rounded-3xl border border-border p-6 sm:p-8">
            <ol className="flex flex-wrap gap-2 text-[11px]">
              {STEPS.map((s, i) => (
                <li
                  key={s}
                  className={
                    "rounded-full px-3 py-1 " +
                    (i === step
                      ? "bg-primary text-primary-foreground font-bold"
                      : i < step
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-secondary/50 text-muted-foreground")
                  }
                >
                  {s}
                </li>
              ))}
            </ol>

            <div className="mt-8 grid gap-4">
              {step === 0 && (
                <div className="grid gap-2">
                  <Label htmlFor="from">من أي دولة ستسافر؟</Label>
                  <Input
                    id="from"
                    value={a.from}
                    onChange={(e) => set("from")(e.target.value)}
                    placeholder="مثال: السعودية"
                  />
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-2">
                  <Label htmlFor="destination">إلى أين تريد السفر؟</Label>
                  <select
                    id="destination"
                    className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
                    value={a.destination}
                    onChange={(e) => set("destination")(e.target.value)}
                  >
                    <option value="">لم أقرر بعد</option>
                    {countries
                      .slice()
                      .sort((x, y) => x.ar.localeCompare(y.ar, "ar"))
                      .map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.flag} {c.ar}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-2">
                  <Label htmlFor="budget">ميزانيتك التقريبية للرحلة كاملة (USD)</Label>
                  <Input
                    id="budget"
                    type="number"
                    min={0}
                    value={a.budget}
                    onChange={(e) => set("budget")(e.target.value)}
                    placeholder="مثال: 3000"
                  />
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="start">تاريخ المغادرة</Label>
                    <Input
                      id="start"
                      type="date"
                      value={a.start}
                      onChange={(e) => set("start")(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end">تاريخ العودة</Label>
                    <Input
                      id="end"
                      type="date"
                      value={a.end}
                      onChange={(e) => set("end")(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="grid gap-2">
                  <span className="text-sm font-medium">أسلوب السفر</span>
                  <div className="flex flex-wrap gap-2">
                    {STYLES.map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => set("style")(s.key)}
                        className={
                          "rounded-full px-4 py-2 text-xs font-semibold " +
                          (a.style === s.key
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground")
                        }
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="grid gap-2">
                  <Label htmlFor="travellers">عدد المسافرين</Label>
                  <Input
                    id="travellers"
                    type="number"
                    min={1}
                    value={a.travellers}
                    onChange={(e) => set("travellers")(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                السابق
              </Button>
              {step < STEPS.length - 1 ? (
                <Button variant="hero" onClick={() => setStep((s) => s + 1)}>
                  التالي
                </Button>
              ) : (
                <Button variant="hero" onClick={finish}>
                  اعرض التوصية
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            <div className="rounded-3xl border border-border p-6 sm:p-8">
              <h2 className="text-xl font-extrabold">توصيتنا لك</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {country ? `الوجهة: ${country.ar} ${country.flag}. ` : "لم تحدد وجهة بعد. "}
                {nights > 0 ? `${nights} ليلة لـ ${travellers} مسافر.` : ""}
              </p>

              <div className="mt-6 grid gap-3">
                {recommendation === "explore" && (
                  <Rec
                    title="ابدأ باستكشاف الوجهات المجانية"
                    body="تصفّح صفحات الدول المجانية واختر وجهة تناسب ميزانيتك وموسمك."
                    href="/countries"
                    cta="تصفّح الدول"
                  />
                )}
                {recommendation === "calculator" && (
                  <Rec
                    title="ابدأ بحاسبة التكلفة المجانية"
                    body="ميزانيتك ضيّقة نسبيًا لعدد الليالي؛ التقدير التفصيلي سيوضح أين يمكنك التوفير قبل الحجز."
                    href="/calculator"
                    cta="احسب تكلفة رحلتي"
                  />
                )}
                {recommendation === "guide" && country && (
                  <Rec
                    title={`الدليل الكامل للسفر إلى ${country.ar}`}
                    body={`تحضير منظّم خطوة بخطوة: التأشيرة، الإقامة، التنقل وخطط 7 و10 و14 يومًا — ${formatUSD(pricing.guidePriceUSD)}.`}
                    href={`/guides/${country.slug}`}
                    cta="اطّلع على الدليل"
                  />
                )}
                {recommendation === "planning" && (
                  <Rec
                    title="خدمة التخطيط المخصصة"
                    body={`رحلتك أطول أو أكبر من المعتاد؛ التخطيط المخصص يوفّر عليك تنسيق التفاصيل — يبدأ من ${formatUSD(pricing.planningStartFeeUSD)}.`}
                    href="/plan"
                    cta="اطلب خطة مخصصة"
                  />
                )}

                {country && recommendation !== "guide" && (
                  <Rec
                    title={`معلومات ${country.ar} المجانية`}
                    body="تأشيرة، أفضل وقت للزيارة، تكاليف تقديرية ونصائح عملية — مجانًا."
                    href={`/countries/${country.slug}`}
                    cta="افتح صفحة الدولة"
                  />
                )}
                {recommendation !== "calculator" && (
                  <Rec
                    title="حاسبة تكلفة الرحلة"
                    body="احصل على تقدير تفصيلي لرحلتك قبل الحجز."
                    href="/calculator"
                    cta="افتح الحاسبة"
                  />
                )}
              </div>

              <Button variant="outline" className="mt-6" onClick={() => setDone(false)}>
                تعديل إجاباتي
              </Button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function Rec({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <article className="rounded-2xl bg-secondary p-5">
      <h3 className="flex items-center gap-2 font-bold">
        <Check className="size-4 text-primary" aria-hidden />
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <Link
        to={href}
        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary"
      >
        {cta}
        <ArrowLeft className="size-4" aria-hidden />
      </Link>
    </article>
  );
}
