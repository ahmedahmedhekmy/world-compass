import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
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
import { Breadcrumbs, breadcrumbJsonLd } from "@/components/breadcrumbs";
import { FavoriteButton } from "@/components/favorite-button";
import { GuideUpsell } from "@/components/guide-upsell";
import { TrustBadges } from "@/components/trust-badges";
import { pushRecentCountry } from "@/lib/favorites";

export const Route = createFileRoute("/countries/$slug")({
  loader: ({ params }) => {
    const country = countryBySlug(params.slug);
    if (!country) throw notFound();
    return { country };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "الدولة غير متاحة" }, { name: "robots", content: "noindex" }] };
    }
    const c = loaderData.country;
    const title = `السفر إلى ${c.ar} | معلومات وتكاليف قبل السفر`;
    const description = `${c.tagline} تعرّف على التأشيرة، أفضل وقت للزيارة، العملة، المواصلات وتكلفة السفر إلى ${c.ar}.`;
    const path = `/countries/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: path },
      ],
      links: [{ rel: "canonical", href: path }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TravelDestination",
            name: c.ar,
            description,
            address: { "@type": "PostalAddress", addressCountry: c.iso2 },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbJsonLd([
              { name: "الدول", item: "/countries" },
              { name: c.ar, item: path },
            ]),
          ),

        },
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
      <div className="mt-3 text-balance-ar text-sm leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}

const TIER_LABEL: Record<string, string> = { low: "اقتصادي", mid: "متوسط", high: "مرتفع" };
const TIER_DAILY: Record<string, string> = {
  low: "من 40 إلى 70 دولارًا للشخص يوميًا",
  mid: "من 80 إلى 140 دولارًا للشخص يوميًا",
  high: "من 150 إلى 260 دولارًا للشخص يوميًا",
};

function CountryPage() {
  const { country } = Route.useLoaderData();
  const c: Country = country;
  const related = countries
    .filter((x) => x.continent === c.continent && x.slug !== c.slug)
    .slice(0, 4);

  useEffect(() => {
    pushRecentCountry(c.slug);
  }, [c.slug]);

  return (
    <>
      <section className="relative isolate">
        <img
          src={continentImage(c.continent)}
          alt={`مشهد من ${c.ar}`}
          width={1280}
          height={853}
          fetchPriority="high"
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
          <div className="mt-5">
            <FavoriteButton slug={c.slug} label={c.ar} />
          </div>
        </div>
      </section>

      <div className="container-page pt-6">
        <Breadcrumbs
          items={[
            { name: "الرئيسية", href: "/" },
            { name: "الدول", href: "/countries" },
            { name: c.ar, href: `/countries/${c.slug}` },
          ]}
        />
      </div>

      <div className="container-page grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact label="العاصمة" value={c.capital} />
            <Fact label="العملة" value={c.currency} />
            <Fact label="اللغات الرسمية" value={c.languages.join("، ")} />
            <Fact label="القارة" value={continentName(c.continent)} />
          </div>

          <section>
            <h2 className="text-xl font-extrabold">نظرة عامة على {c.ar}</h2>
            <p className="mt-3 text-balance-ar text-sm leading-7 text-muted-foreground">
              {c.overview}
            </p>
          </section>

          <Block title={`لماذا تزور ${c.ar}؟`}>
            {c.attractions.join("، ")} — إضافة إلى تجربة الحياة اليومية، المطبخ المحلي، والتنقل بين
            المدن الذي يمنحك صورة أصدق عن البلد من الجولات السريعة.
          </Block>

          <Block title="ملخص التأشيرة">
            {c.visa} تختلف متطلبات التأشيرة حسب جنسيتك ومدة الإقامة وغرض الزيارة، وقد تتغير في أي
            وقت. تحقّق دائمًا من المصدر الرسمي (السفارة أو الجهة الحكومية المختصة) قبل الحجز.
          </Block>

          <Block title="أفضل وقت للزيارة">{c.bestTime}</Block>
          <Block title="الطقس المتوقع">{c.weather}</Block>

          <Block title="الميزانية التقديرية للسفر">
            مستوى الأسعار في {c.ar} يُصنَّف كـ{TIER_LABEL[c.tier] ?? "متوسط"}؛ كتقدير عام يمكن
            توقّع {TIER_DAILY[c.tier] ?? TIER_DAILY.mid} شاملًا الإقامة والطعام والتنقل الداخلي
            وبعض الأنشطة، دون تذاكر الطيران الدولية. للحصول على رقم يخص رحلتك أنت — بالتواريخ وعدد
            المسافرين ومستوى الإقامة — استخدم حاسبة التكلفة المجانية.
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link to="/calculator">احسب تكلفة رحلتي</Link>
              </Button>
            </div>
          </Block>

          <Block title="الإقامة">
            الخيارات تمتد من النُزل والغرف المشتركة، إلى الشقق المفروشة المناسبة للعائلات، وصولًا
            إلى الفنادق المتوسطة والفاخرة. الإقامة في منطقة مركزية قريبة من محطات النقل غالبًا
            توفّر عليك أكثر مما تدفعه زيادة في سعر الليلة.
          </Block>

          <Block title="الطعام">
            المطاعم المحلية والأسواق الشعبية أوفر بكثير من المطاعم السياحية وغالبًا أفضل طعمًا.
            وجبة بسيطة في مطعم محلي تكلّف عادة جزءًا صغيرًا من سعر وجبة مماثلة في المناطق
            السياحية، وإفطار السكن المُدرج ضمن الحجز يقلّل مصروف اليوم.
          </Block>

          <Block title="المواصلات">
            القطارات والحافلات بين المدن هي الخيار الأوفر عادة، والطيران الداخلي مفيد للمسافات
            الطويلة. داخل المدن اعتمد على النقل العام وبطاقات الأيام المتعددة إن توفرت، واحسب وقت
            التنقل ضمن خطة يومك.
          </Block>

          <Block title="المطارات الرئيسية">
            المطارات الدولية الرئيسية تخدم مدن {c.cities.slice(0, 3).join("، ")}. تحقّق قبل الحجز
            من المطار الأقرب لوجهتك الفعلية، ومن وسيلة الوصول من المطار إلى مكان إقامتك (قطار
            المطار، حافلة، أو سيارة أجرة رسمية).
          </Block>

          <Block title="أهم المدن">
            {c.cities.join("، ")}. توزيع الليالي بين مدينتين أو ثلاث يمنحك تنوعًا دون إرهاق
            التنقل اليومي.
          </Block>

          <Block title="أبرز المعالم">{c.attractions.join("، ")}.</Block>

          <Block title="الأمان">
            تُعد المناطق السياحية الرئيسية آمنة عمومًا مع الانتباه المعتاد: احترس من الازدحام
            والنشل في محطات النقل، احتفظ بنسخ رقمية من جواز السفر والتأمين، واحفظ أرقام الطوارئ
            المحلية وعنوان أقرب سفارة لبلدك. راجع تنبيهات السفر الرسمية قبل المغادرة.
          </Block>

          <Block title="تطبيقات التنقل المحلية">
            خرائط Google أو Maps.me للتنقل دون إنترنت، تطبيقات النقل العام الرسمية للمدينة،
            وتطبيقات سيارات الأجرة المرخّصة المعروفة محليًا. حمّل الخرائط دون اتصال قبل الوصول.
          </Block>

          <Block title="الإنترنت وشرائح الاتصال">
            شراء شريحة محلية أو تفعيل eSIM عند الوصول عادةً أوفر بكثير من التجوال الدولي. تحقّق من
            توافق هاتفك مع eSIM قبل السفر، واحفظ نسخة من تذاكرك وحجوزاتك دون اتصال.
          </Block>

          <Block title="أخطاء شائعة عند السفر إلى {c.ar}">
            <ul className="mt-2 grid list-disc gap-2 ps-5">
              <li>الحجز المتأخر في موسم الذروة ودفع أسعار مضاعفة.</li>
              <li>تجاهل تكلفة التنقل الداخلي عند وضع الميزانية.</li>
              <li>عدم التحقق من متطلبات التأشيرة ومدة صلاحية الجواز مبكرًا.</li>
              <li>حشو الجدول بمدن كثيرة في أيام قليلة.</li>
              <li>الاعتماد على التجوال الدولي بدل شريحة محلية.</li>
            </ul>
          </Block>

          <Block title="نصائح عملية">
            <ul className="mt-2 grid list-disc gap-2 ps-5">
              <li>احجز الإقامة قرب محطة نقل رئيسية.</li>
              <li>خصّص يومًا مرنًا لكل أسبوع سفر.</li>
              <li>احمل بطاقتين بنكيتين من شبكتين مختلفتين.</li>
              <li>صوّر مستنداتك واحفظها في التخزين السحابي.</li>
              <li>اشترِ تأمين سفر يغطي العلاج والإلغاء.</li>
            </ul>
          </Block>

          <section className="border-t border-border pt-8">
            <h2 className="text-xl font-extrabold">أسئلة شائعة عن السفر إلى {c.ar}</h2>
            <Accordion type="single" collapsible className="mt-3">
              <AccordionItem value="a">
                <AccordionTrigger className="text-start">
                  كم يومًا تحتاج لزيارة {c.ar}؟
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  من 7 إلى 10 أيام تكفي لتغطية أبرز المدن دون تسرّع، و14 يومًا تتيح إضافة مناطق
                  أبعد.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="b">
                <AccordionTrigger className="text-start">هل السفر إليها مكلف؟</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  مستوى الأسعار {TIER_LABEL[c.tier] ?? "متوسط"}، ويعتمد الرقم النهائي على موسم
                  السفر ومستوى الإقامة وأسلوبك. استخدم الحاسبة المجانية لتقدير يخص حالتك.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="c">
                <AccordionTrigger className="text-start">ما أفضل وقت للزيارة؟</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{c.bestTime}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="d">
                <AccordionTrigger className="text-start">هل أحتاج تأشيرة؟</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {c.visa} تختلف المتطلبات حسب الجنسية وقد تتغير، لذا تحقّق من المصدر الرسمي قبل
                  الحجز.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <GuideUpsell slug={c.slug} countryName={c.ar} />

          <section className="border-t border-border pt-8">
            <h2 className="text-lg font-extrabold">لماذا يثق بنا المسافرون</h2>
            <div className="mt-4">
              <TrustBadges />
            </div>
          </section>
        </div>

        <aside className="grid h-fit gap-4 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-border p-5">
            <h3 className="font-bold">خطوتك التالية</h3>
            <div className="mt-4 grid gap-2">
              <Button asChild variant="hero">
                <Link to="/calculator">احسب ميزانية رحلتك</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/start">ابدأ رحلتك خطوة بخطوة</Link>
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
            <Link to="/continents/$slug" params={{ slug: c.continent }} className="mt-3 inline-block text-xs text-primary underline">
              كل دول {continentName(c.continent)}
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
