import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calculator,
  Compass,
  Map,
  ShieldCheck,
  Sparkles,
  Wallet,
  BookOpen,
} from "lucide-react";
import heroImg from "@/assets/hero-world.jpg";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CountryCard } from "@/components/country-card";
import { continents, popularCountries, countries } from "@/data/countries";
import { site, formatUSD } from "@/config/site";
import { DISCLAIMER_SCOPE } from "@/lib/estimator";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Travel Smart Budget | اكتشف العالم واحسب ميزانية رحلتك كاملة" },
      {
        name: "description",
        content:
          "استكشف دول العالم، اقرأ معلومات السفر المجانية، احسب تكلفة رحلتك كاملة، واحصل على دليل سفر متكامل لأي دولة.",
      },
      { property: "og:title", content: "Travel Smart Budget | سافر بذكاء" },
      {
        property: "og:description",
        content: "اكتشف أين تذهب، وكم تحتاج، وكيف تستعد لرحلتك.",
      },
    ],
  }),
  component: Home,
});

function SectionHead({
  eyebrow,
  title,
  desc,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <span className="text-xs font-bold tracking-widest text-accent-foreground/80">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">{title}</h2>
      {desc && <p className="mt-3 text-balance-ar text-sm text-muted-foreground">{desc}</p>}
    </div>
  );
}

function Home() {
  const popular = popularCountries().slice(0, 8);
  const europe = countries.filter((c) => c.continent === "europe").slice(0, 4);

  return (
    <>
      {/* 1 — Hero */}
      <section className="relative isolate min-h-[92svh] overflow-hidden">
        <img
          src={heroImg}
          alt="طريق ساحلي بين الجبال والمحيط عند الغروب"
          width={1920}
          height={1088}
          fetchPriority="high"
          className="absolute inset-0 -z-10 size-full object-cover slow-zoom"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/45 to-black/80" />
        <div className="container-page flex min-h-[92svh] flex-col justify-end pb-16 pt-24 text-on-dark">
          <div className="max-w-3xl fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3 py-1 text-xs backdrop-blur">
              <Sparkles className="size-3.5" /> منصة سفر عالمية
            </span>
            <h1 className="mt-5 text-3xl font-black leading-[1.35] sm:text-5xl sm:leading-[1.25]">
              العالم أكبر من مجرد وجهة... اكتشف أين تذهب، وكم تحتاج، وكيف تستعد لرحلتك.
            </h1>
            <p className="mt-5 max-w-2xl text-balance-ar text-sm opacity-90 sm:text-base">
              استكشف دول العالم، تعرّف على أهم المعلومات قبل السفر، احسب ميزانية رحلتك كاملة،
              واحصل على الأدوات التي تساعدك على السفر بذكاء.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="sand">
                <Link to="/explore">
                  استكشف العالم <ArrowLeft className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="glass">
                <Link to="/calculator">احسب تكلفة رحلتي</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Explore the world */}
      <section className="container-page py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">استكشف العالم</h2>
            <p className="mt-4 text-balance-ar text-muted-foreground">
              أكثر من {countries.length} وجهة داخل المنصة اليوم، والقاعدة مبنية لتغطية دول العالم
              كاملة. ابدأ من قارة، أو ابحث مباشرة عن الدولة التي تفكر فيها.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="hero">
                <Link to="/explore">
                  <Map className="size-4" /> خريطة العالم
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/countries">
                  <Compass className="size-4" /> دليل الدول
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {continents.slice(0, 4).map((c) => (
              <Link
                key={c.slug}
                to="/continents/$slug"
                params={{ slug: c.slug }}
                className="group relative overflow-hidden rounded-3xl"
              >
                <img
                  src={c.image}
                  alt={c.ar}
                  loading="lazy"
                  width={1280}
                  height={853}
                  className="aspect-[5/4] size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-3 start-4 font-extrabold text-on-dark">
                  {c.ar}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3 — Continents */}
      <section className="surface-deep py-20">
        <div className="container-page">
          <SectionHead
            eyebrow="القارات"
            title="ابدأ رحلتك من القارة"
            desc="أوروبا هي وجهتنا المميزة حاليًا، والمنصة تتوسع تدريجيًا لتغطية باقي العالم."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {continents.map((c) => (
              <Link
                key={c.slug}
                to="/continents/$slug"
                params={{ slug: c.slug }}
                className="group overflow-hidden rounded-3xl border border-white/15 bg-white/5"
              >
                <img
                  src={c.image}
                  alt={c.ar}
                  loading="lazy"
                  width={1280}
                  height={853}
                  className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="p-4">
                  <h3 className="font-bold">{c.ar}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-6 opacity-75">{c.intro}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — Popular destinations */}
      <section className="container-page py-20">
        <SectionHead eyebrow="وجهات مميزة" title="دول يبحث عنها المسافرون كثيرًا" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((c) => (
            <CountryCard key={c.slug} country={c} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link to="/countries">تصفح كل الدول</Link>
          </Button>
        </div>
      </section>

      {/* 5 — Free travel info */}
      <section className="bg-secondary py-20">
        <div className="container-page grid gap-8 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "معلومات قبل السفر",
              body: "التأشيرة، أفضل وقت للزيارة، الطقس، العملة، الأمان، وشرائح الإنترنت — لكل دولة صفحة مجانية.",
            },
            {
              icon: Wallet,
              title: "تكلفة واقعية",
              body: "لا نعرض الطيران والإقامة فقط، بل صورة كاملة عن ميزانية الرحلة من البداية للنهاية.",
            },
            {
              icon: BookOpen,
              title: "دليل كامل عند الحاجة",
              body: "إذا أردت التفاصيل خطوة بخطوة، هناك دليل سفر واحد متكامل لكل دولة.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-3xl bg-card p-6 shadow-soft">
              <span className="grid size-11 place-items-center rounded-2xl surface-deep">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6 — Calculator */}
      <section className="container-page py-20">
        <div className="overflow-hidden rounded-[2rem] surface-deep">
          <div className="grid gap-8 p-8 md:grid-cols-[1.2fr_1fr] md:p-12">
            <div>
              <span className="text-xs font-bold tracking-widest opacity-70">أداة مجانية</span>
              <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                احسب ميزانية رحلتك كاملة
              </h2>
              <p className="mt-4 text-balance-ar text-sm opacity-85">{DISCLAIMER_SCOPE}</p>
              <Button asChild variant="sand" size="lg" className="mt-7">
                <Link to="/calculator">
                  <Calculator className="size-4" /> ابدأ الحساب المجاني
                </Link>
              </Button>
            </div>
            <ul className="grid content-center gap-2 text-sm">
              {["الطيران", "الإقامة", "التأشيرة", "المواصلات", "الطعام", "الأنشطة والجولات"].map(
                (i) => (
                  <li
                    key={i}
                    className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur"
                  >
                    {i}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* 7 — Premium guides */}
      <section className="container-page py-8">
        <SectionHead
          eyebrow="أدلة السفر"
          title="دليل واحد متكامل لكل دولة"
          desc={`دليل عملي من الألف إلى الياء: التأشيرة، الوصول، الإقامة، المواصلات، خطط 7 و10 و14 يومًا، وقوائم تحضير كاملة — بسعر موحد ${formatUSD(site.guidePriceUSD)}.`}
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {europe.map((c) => (
            <Link
              key={c.slug}
              to="/guides/$slug"
              params={{ slug: c.slug }}
              className="group flex flex-col justify-between rounded-3xl border border-border bg-card p-6 transition-shadow hover:shadow-lift"
            >
              <div>
                <span className="text-3xl">{c.flag}</span>
                <h3 className="mt-3 font-extrabold">دليل السفر إلى {c.ar}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {c.tagline}
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="font-extrabold">{formatUSD(site.guidePriceUSD)}</span>
                <span className="text-primary">اعرف التفاصيل</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link to="/guides">كل أدلة السفر</Link>
          </Button>
        </div>
      </section>

      {/* 8 — Planning service */}
      <section className="container-page py-20">
        <div className="grid items-center gap-8 rounded-[2rem] bg-secondary p-8 md:grid-cols-2 md:p-12">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              هل تريد أن نجهز لك خطة سفر مخصصة؟
            </h2>
            <p className="mt-4 text-balance-ar text-sm text-muted-foreground">
              خدمة مدفوعة للمسافرين الجادين: برنامج يومي مخصص، مراجعة ميزانيتك، استراتيجية الإقامة
              والمواصلات، وإرشادات تحضير الرحلة.
            </p>
            <Button asChild variant="hero" size="lg" className="mt-6">
              <Link to="/plan">اطلب خطة سفر مخصصة</Link>
            </Button>
          </div>
          <ul className="grid gap-3 text-sm">
            {[
              "برنامج سفر مخصص حسب أيامك وميزانيتك",
              "مراجعة كاملة لتقدير التكلفة",
              "اقتراح مناطق الإقامة المناسبة",
              "تخطيط التنقلات الداخلية",
              "إرشادات معلومات التأشيرة",
              "قائمة تحضير قبل السفر",
            ].map((i) => (
              <li key={i} className="rounded-2xl bg-card px-4 py-3 shadow-soft">
                {i}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 9 — Why */}
      <section className="container-page py-8">
        <SectionHead title="لماذا Travel Smart Budget؟" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["معلومات مفيدة مجانًا", "نبدأ بالقيمة، لا بالبيع."],
            ["ميزانية كاملة", "كل بنود الرحلة، وليس الطيران فقط."],
            ["شفافية في التقديرات", "نقول لك دائمًا إن الرقم تقديري."],
            ["تجربة مصمّمة للجوال", "سريعة وواضحة على الهاتف أولًا."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-3xl border border-border p-6">
              <h3 className="font-bold">{t}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 10 — How it works */}
      <section className="container-page py-20">
        <SectionHead title="كيف تعمل المنصة؟" />
        <ol className="mt-10 grid gap-4 md:grid-cols-5">
          {[
            "اكتشف وجهتك",
            "اقرأ المعلومات المجانية",
            "احسب ميزانيتك",
            "احصل على الدليل الكامل",
            "اطلب خطة مخصصة",
          ].map((s, i) => (
            <li key={s} className="rounded-3xl bg-secondary p-6">
              <span className="text-xs font-black text-muted-foreground">0{i + 1}</span>
              <p className="mt-2 font-bold">{s}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 11 — FAQ */}
      <section className="container-page pb-24">
        <SectionHead title="أسئلة شائعة" />
        <div className="mx-auto mt-8 max-w-3xl">
          <Accordion type="single" collapsible>
            {[
              [
                "هل الأسعار التي تظهر نهائية؟",
                "لا. جميع الأرقام تقديرية وقد تكون رحلتك الفعلية أرخص أو أغلى حسب تاريخ السفر والتوافر والعروض وطريقة إنفاقك.",
              ],
              [
                "ما الفرق بين المعلومات المجانية والدليل المدفوع؟",
                "المعلومات المجانية مقدمة مفيدة عن الدولة. الدليل المدفوع مرجع عملي كامل للتحضير خطوة بخطوة، بخطط أيام وقوائم تحضير وتفاصيل تنفيذية.",
              ],
              [
                "هل تضمنون الحصول على التأشيرة؟",
                "لا. نقدّم معلومات وإرشادات فقط، والقرار النهائي يعود للجهات الرسمية. تحقق دائمًا من المصادر الحكومية.",
              ],
              [
                "هل التأمين محسوب ضمن التقدير؟",
                "لا. التأمين يُحسب بشكل منفصل حسب شركة التأمين والتغطية المطلوبة.",
              ],
            ].map(([q, a], i) => (
              <AccordionItem key={i} value={`q${i}`}>
                <AccordionTrigger className="text-start">{q}</AccordionTrigger>
                <AccordionContent className="leading-7 text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
