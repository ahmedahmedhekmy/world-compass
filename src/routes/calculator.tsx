import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Calculator as CalcIcon, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitTripRequest } from "@/lib/leads.functions";
import { countries } from "@/data/countries";
import { site, formatUSD } from "@/config/site";
import {
  DISCLAIMER_MAIN,
  DISCLAIMER_RANGE,
  DISCLAIMER_SCOPE,
  INSURANCE_NOTE,
  breakdownLabels,
  estimate,
  type EstimateBreakdown,
} from "@/lib/estimator";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "حاسبة تكلفة الرحلة المجانية | Travel Smart Budget" },
      {
        name: "description",
        content:
          "احسب ميزانية رحلتك كاملة مجانًا: الطيران، الإقامة، التأشيرة، المواصلات، الطعام، الأنشطة والمصاريف اليومية.",
      },
      { property: "og:title", content: "حاسبة تكلفة الرحلة | Travel Smart Budget" },
      { property: "og:description", content: "تقدير كامل لميزانية رحلتك خلال دقيقتين." },
    ],
  }),
  component: CalculatorPage,
});

const field = "h-11 rounded-2xl";

function CalculatorPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    nationality: "",
    fromCountry: "",
    fromCity: "",
    destination: "poland",
    destCity: "",
    start: "",
    end: "",
    adults: 2,
    children: 0,
    childAges: "",
    accommodation: "comfort" as "budget" | "comfort" | "premium",
    style: "balanced" as "economy" | "balanced" | "rich",
    visa: "yes",
    contact: "email",
    notes: "",
  });
  const [result, setResult] = useState<{
    breakdown: EstimateBreakdown;
    tripTotal: number;
    perPerson: number;
    nights: number;
  } | null>(null);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));
  const saveLead = useServerFn(submitTripRequest);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim()) {
      setError("الرجاء إدخال الاسم والبريد الإلكتروني.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("البريد الإلكتروني غير صحيح.");
      return;
    }
    const start = form.start ? new Date(form.start) : null;
    const end = form.end ? new Date(form.end) : null;
    let nights = 7;
    if (start && end) {
      const diff = Math.round((end.getTime() - start.getTime()) / 86400000);
      if (diff <= 0) {
        setError("تاريخ العودة يجب أن يكون بعد تاريخ الذهاب.");
        return;
      }
      nights = Math.min(diff, 90);
    }
    const country = countries.find((c) => c.slug === form.destination)!;
    const longHaul = !["europe", "asia", "africa"].includes(country.continent);
    const r = estimate({
      tier: country.tier,
      nights,
      adults: Number(form.adults),
      children: Number(form.children),
      accommodation: form.accommodation,
      style: form.style,
      longHaul,
      visaNeeded: form.visa === "yes",
    });
    setResult({ ...r, nights });
    setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth" }), 60);

    void saveLead({
      data: {
        kind: "estimate",
        full_name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        nationality: form.nationality.trim() || undefined,
        departure_country: form.fromCountry.trim() || undefined,
        departure_city: form.fromCity.trim() || undefined,
        destination_country: country.ar,
        destination_city: form.destCity.trim() || undefined,
        start_date: form.start || undefined,
        end_date: form.end || undefined,
        nights,
        adults: Number(form.adults),
        children: Number(form.children),
        children_ages: form.childAges.trim() || undefined,
        accommodation_level: form.accommodation,
        travel_style: form.style,
        visa_help: form.visa === "yes",
        preferred_contact: form.contact,
        notes: form.notes.trim() || undefined,
        estimate: { ...r.breakdown, tripTotal: r.tripTotal, perPerson: r.perPerson, nights },
      },
    }).catch(() => {
      /* estimate is still shown; lead capture is best-effort */
    });
  };

  return (
    <>
      <section className="surface-deep py-14">
        <div className="container-page">
          <h1 className="text-3xl font-black sm:text-4xl">احسب تكلفة رحلتك كاملة</h1>
          <p className="mt-4 max-w-2xl text-balance-ar text-sm opacity-85">{DISCLAIMER_SCOPE}</p>
        </div>
      </section>

      <section className="container-page grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form onSubmit={submit} className="grid gap-6">
          <fieldset className="grid gap-4 rounded-3xl border border-border p-6">
            <legend className="px-2 text-sm font-bold">بياناتك</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">الاسم الكامل *</Label>
                <Input id="name" className={field} maxLength={100} value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني *</Label>
                <Input id="email" type="email" className={field} maxLength={255} value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input id="phone" className={field} maxLength={30} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="nat">الجنسية</Label>
                <Input id="nat" className={field} maxLength={60} value={form.nationality} onChange={(e) => set("nationality", e.target.value)} />
              </div>
            </div>
          </fieldset>

          <fieldset className="grid gap-4 rounded-3xl border border-border p-6">
            <legend className="px-2 text-sm font-bold">تفاصيل الرحلة</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="fc">دولة المغادرة</Label>
                <Input id="fc" className={field} value={form.fromCountry} onChange={(e) => set("fromCountry", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="fcity">مدينة المغادرة</Label>
                <Input id="fcity" className={field} value={form.fromCity} onChange={(e) => set("fromCity", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="dest">دولة الوجهة *</Label>
                <select
                  id="dest"
                  value={form.destination}
                  onChange={(e) => set("destination", e.target.value)}
                  className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm"
                >
                  {countries.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.flag} {c.ar}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="dcity">مدينة الوجهة</Label>
                <Input id="dcity" className={field} value={form.destCity} onChange={(e) => set("destCity", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="start">تاريخ الذهاب</Label>
                <Input id="start" type="date" className={field} value={form.start} onChange={(e) => set("start", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="end">تاريخ العودة</Label>
                <Input id="end" type="date" className={field} value={form.end} onChange={(e) => set("end", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="adults">عدد البالغين</Label>
                <Input id="adults" type="number" min={1} max={12} className={field} value={form.adults} onChange={(e) => set("adults", Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="children">عدد الأطفال</Label>
                <Input id="children" type="number" min={0} max={10} className={field} value={form.children} onChange={(e) => set("children", Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="ages">أعمار الأطفال</Label>
                <Input id="ages" placeholder="مثال: 4، 9" className={field} value={form.childAges} onChange={(e) => set("childAges", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="acc">مستوى الإقامة</Label>
                <select id="acc" value={form.accommodation} onChange={(e) => set("accommodation", e.target.value)} className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm">
                  <option value="budget">اقتصادي</option>
                  <option value="comfort">مريح</option>
                  <option value="premium">فاخر</option>
                </select>
              </div>
              <div>
                <Label htmlFor="style">أسلوب السفر</Label>
                <select id="style" value={form.style} onChange={(e) => set("style", e.target.value)} className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm">
                  <option value="economy">توفيري</option>
                  <option value="balanced">متوازن</option>
                  <option value="rich">مرفّه</option>
                </select>
              </div>
              <div>
                <Label htmlFor="visa">تحتاج مساعدة بالتأشيرة؟</Label>
                <select id="visa" value={form.visa} onChange={(e) => set("visa", e.target.value)} className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm">
                  <option value="yes">نعم</option>
                  <option value="no">لا</option>
                </select>
              </div>
              <div>
                <Label htmlFor="contact">طريقة التواصل المفضلة</Label>
                <select id="contact" value={form.contact} onChange={(e) => set("contact", e.target.value)} className="h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm">
                  <option value="email">البريد الإلكتروني</option>
                  <option value="whatsapp">واتساب</option>
                  <option value="telegram">تيليجرام</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">ملاحظات إضافية</Label>
              <Textarea id="notes" maxLength={1000} className="rounded-2xl" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </div>
          </fieldset>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" variant="hero" size="lg" className="w-full sm:w-auto">
            <CalcIcon className="size-4" /> اعرض التقدير المجاني
          </Button>
        </form>

        <aside className="h-fit rounded-3xl bg-secondary p-6 text-sm leading-7 lg:sticky lg:top-24">
          <p className="flex items-center gap-2 font-bold">
            <Info className="size-4" /> قبل أن تبدأ
          </p>
          <p className="mt-3 text-muted-foreground">{DISCLAIMER_MAIN}</p>
          <p className="mt-3 text-muted-foreground">{DISCLAIMER_RANGE}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            بياناتك تُستخدم لإظهار التقدير فقط، ولا يتم إرسالها لأي جهة خارجية.
          </p>
        </aside>
      </section>

      {result && (
        <section id="result" className="container-page pb-24">
          <div className="rounded-[2rem] border border-border p-6 sm:p-10">
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-black text-accent-foreground">
              تقديري
            </span>
            <h2 className="mt-4 text-2xl font-extrabold">
              تقدير ميزانية رحلتك ({result.nights} ليلة)
            </h2>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-secondary p-6">
                <h3 className="font-bold">أ. ميزانية الرحلة التقديرية</h3>
                <ul className="mt-4 grid gap-2 text-sm">
                  {(Object.keys(result.breakdown) as (keyof EstimateBreakdown)[]).map((k) => (
                    <li key={k} className="flex items-center justify-between rounded-2xl bg-card px-4 py-2.5">
                      <span>{breakdownLabels[k]}</span>
                      <span className="font-bold">{formatUSD(result.breakdown[k])}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-bold">الإجمالي التقديري</span>
                  <span className="text-2xl font-black">{formatUSD(result.tripTotal)}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  للفرد الواحد تقريبًا: {formatUSD(result.perPerson)}
                </p>
              </div>

              <div className="grid gap-4">
                <div className="rounded-3xl border border-border p-6">
                  <h3 className="font-bold">ب. خدمات Travel Smart Budget</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    مبالغ تُدفع لنا مقابل خدمات اختيارية، ومنفصلة تمامًا عن مصاريف رحلتك.
                  </p>
                  <ul className="mt-3 grid gap-2 text-sm">
                    <li className="flex justify-between rounded-2xl bg-secondary px-4 py-2.5">
                      <span>دليل السفر الكامل</span>
                      <span className="font-bold">{formatUSD(site.guidePriceUSD)}</span>
                    </li>
                    <li className="flex justify-between rounded-2xl bg-secondary px-4 py-2.5">
                      <span>خطة سفر مخصصة</span>
                      <span className="font-bold">{formatUSD(site.planningServicePriceUSD)}</span>
                    </li>
                  </ul>
                </div>
                <div className="rounded-3xl border border-border p-6">
                  <h3 className="font-bold">ج. مصاريفك الشخصية</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    التسوق والهدايا والكماليات تعتمد على أسلوبك، ولا تدخل ضمن الأرقام أعلاه.
                  </p>
                </div>
                <div className="rounded-3xl border border-border p-6">
                  <h3 className="font-bold">د. التأمين</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{INSURANCE_NOTE}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-secondary p-6 text-xs leading-7 text-muted-foreground">
              <p>{DISCLAIMER_MAIN}</p>
              <p className="mt-2">{DISCLAIMER_RANGE}</p>
            </div>

            <div className="mt-8 rounded-[1.5rem] surface-deep p-8">
              <h3 className="text-xl font-extrabold">هل تريد أن نجهز لك خطة سفر مخصصة؟</h3>
              <p className="mt-2 text-sm opacity-85">
                خدمة مدفوعة للمسافرين الجادين: برنامج يومي، مراجعة ميزانية، وتخطيط كامل للرحلة.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild variant="sand">
                  <Link to="/plan">اطلب خطة سفر مخصصة</Link>
                </Button>
                <Button asChild variant="glass">
                  <Link to="/guides/$slug" params={{ slug: form.destination }}>
                    شاهد دليل الوجهة
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
