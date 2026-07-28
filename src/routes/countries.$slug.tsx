import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  continentImage,
  continentName,
  countries,
  countryBySlug,
  type Country,
} from "@/data/countries";
import { site, formatUSD } from "@/config/site";

export const Route = createFileRoute("/countries/$slug")({
  loader: ({ params }) => {
    const country = countryBySlug(params.slug);
    if (!country) throw notFound();
    return { country };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "الدولة غير متاحة" }, { name: "robots", content: "noindex" }] };
    }
    const c = loaderData.country;
    const title = `السفر إلى ${c.ar} | معلومات وتكاليف قبل السفر`;
    const description = `${c.tagline} تعرّف على التأشيرة، أفضل وقت للزيارة، العملة، المواصلات وتكلفة السفر إلى ${c.ar}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: CountryPage,
  errorComponent: () => (
    <div className="container-page py-24 text-center">تعذّر تحميل بيانات الدولة.</div>
  ),
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl font-bold">لم نجد هذه الدولة</h1>
      <Link to="/countries" className="mt-4 inline-block text-primary underline">
        العودة إلى دليل الدول
      </Link>
    </div>
  ),
});

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary px-4 py-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border pt-8">
      <h2 className="text-xl font-extrabold">{title}</h2>
      <div className="mt-3 text-balance-ar text-sm text-muted-foreground">{children}</div>
    </section>
  );
}

function CountryPage() {
  const { country } = Route.useLoaderData();
  const c: Country = country;
  const related = countries
    .filter((x) => x.continent === c.continent && x.slug !== c.slug)
    .slice(0, 4);

  return (
    <>
      <section className="relative isolate">
        <img
          src={continentImage(c.continent)}
          alt={`مشهد من ${c.ar}`}
          width={1280}
          height={853}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/45 to-black/45" />
        <div className="container-page flex min-h-[58svh] flex-col justify-end pb-12 pt-24 text-on-dark">
          <p className="text-xs opacity-80">
            {continentName(c.continent)} · {c.region}
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">
            {c.ar} <span className="align-middle">{c.flag}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-balance-ar text-sm opacity-90">{c.tagline}</p>
        </div>
      </section>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact label="العاصمة" value={c.capital} />
            <Fact label="العملة" value={c.currency} />
            <Fact label="اللغات" value={c.languages.join("، ")} />
            <Fact label="القارة" value={continentName(c.continent)} />
          </div>

          <section>
            <h2 className="text-xl font-extrabold">نظرة عامة</h2>
            <p className="mt-3 text-balance-ar text-sm text-muted-foreground">{c.overview}</p>
          </section>

          <Block title={`لماذا تزور ${c.ar}؟`}>
            {c.attractions.join("، ")} — إضافة إلى تجربة الحياة اليومية والمطبخ المحلي والتنقل بين
            المدن.
          </Block>

          <Block title="أفضل وقت للزيارة">{c.bestTime}</Block>
          <Block title="الطقس">{c.weather}</Block>
          <Block title="معلومات التأشيرة">
            {c.visa} لا تُعد هذه المعلومات بديلًا عن المصادر الرسمية.
          </Block>

          <Block title="نظرة عامة على التكاليف">
            مستوى الأسعار في {c.ar} يُصنَّف كـ
            {c.tier === "low" ? " اقتصادي" : c.tier === "mid" ? " متوسط" : " مرتفع"}. لحساب رقم
            تقريبي يخص رحلتك أنت (بالتواريخ وعدد المسافرين ومستوى الإقامة)، استخدم حاسبة التكلفة
            المجانية.
          </Block>

          <Block title="الإقامة">
            تتوفر خيارات من النُزل والشقق المفروشة إلى الفنادق. احجز في المناطق المركزية القريبة من
            وسائل النقل لتوفير وقت وتكلفة التنقل.
          </Block>
          <Block title="الطعام">
            المطاعم المحلية والأسواق أرخص بكثير من المطاعم السياحية، وغالبًا أفضل طعمًا.
          </Block>
          <Block title="المواصلات والمطارات">
            المدن الرئيسية: {c.cities.join("، ")}. خطط للوصول من المطار مسبقًا واعرف وسيلة النقل
            العام المتاحة.
          </Block>
          <Block title="الإنترنت وشرائح الاتصال">
            شراء شريحة محلية أو eSIM عند الوصول عادةً أوفر من خدمة التجوال الدولي.
          </Block>
          <Block title="الأمان ونصائح عملية">
            انتبه للأماكن المزدحمة، احتفظ بنسخ من مستنداتك، واحفظ أرقام الطوارئ المحلية.
          </Block>
          <Block title="أخطاء شائعة">
            حجز متأخر في الموسم، تجاهل تكلفة التنقل الداخلي، وعدم التحقق من متطلبات التأشيرة مبكرًا.
          </Block>

          <section className="border-t border-border pt-8">
            <h2 className="text-xl font-extrabold">أسئلة شائعة عن {c.ar}</h2>
            <Accordion type="single" collapsible className="mt-3">
              <AccordionItem value="a">
                <AccordionTrigger className="text-start">
                  كم تحتاج من الأيام لزيارة {c.ar}؟
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  من 7 إلى 10 أيام تكفي لتغطية أبرز المدن دون تسرّع.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="b">
                <AccordionTrigger className="text-start">هل السفر إليها مكلف؟</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  يعتمد على مستوى إقامتك وأسلوب سفرك. استخدم الحاسبة للحصول على تقدير يخص حالتك.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <div className="rounded-[2rem] surface-deep p-8">
            <h2 className="text-xl font-extrabold">
              هل تريد معرفة كل التفاصيل والاستعداد لرحلتك خطوة بخطوة؟
            </h2>
            <p className="mt-3 text-sm opacity-85">
              اكتشف دليل السفر الكامل لهذه الدولة: التأشيرة، الوصول، الإقامة، خطط 7 و10 و14 يومًا،
              وقوائم تحضير عملية.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="sand">
                <Link to="/guides/$slug" params={{ slug: c.slug }}>
                  دليل السفر إلى {c.ar} — {formatUSD(site.guidePriceUSD)}
                </Link>
              </Button>
              <Button asChild variant="glass">
                <Link to="/calculator">احسب تكلفة رحلتي</Link>
              </Button>
            </div>
          </div>
        </div>

        <aside className="grid h-fit gap-4 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-border p-5">
            <h3 className="font-bold">خطوتك التالية</h3>
            <div className="mt-4 grid gap-2">
              <Button asChild variant="hero">
                <Link to="/calculator">احسب ميزانية رحلتك</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/plan">اطلب خطة سفر مخصصة</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-3xl border border-border p-5">
            <h3 className="font-bold">وجهات قريبة</h3>
            <ul className="mt-3 grid gap-2 text-sm">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    to="/countries/$slug"
                    params={{ slug: r.slug }}
                    className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3"
                  >
                    <span>
                      {r.flag} {r.ar}
                    </span>
                    <ArrowLeft className="size-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
