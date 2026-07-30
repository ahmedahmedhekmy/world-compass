import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { continentImage, countryBySlug } from "@/data/countries";
import { site, formatUSD } from "@/config/site";
import { useSiteSettings } from "@/lib/site-settings";

/** Chapter titles only — the paid body content is never shipped to the client. */
const CHAPTERS = [
  "نظرة عامة على الدولة",
  "متطلبات التأشيرة وإرشادات عملية",
  "المصادر الرسمية للتأشيرة",
  "شروط الدخول",
  "كيف تصل: الطيران وتخطيط الوصول",
  "معلومات المطارات وما بعد الوصول",
  "استراتيجية الإقامة وأنواعها وتكاليفها",
  "الطعام والمطاعم والمصاريف اليومية",
  "المواصلات العامة والتاكسي والتطبيقات المحلية",
  "الإنترنت وشرائح الاتصال",
  "أهم المدن والوجهات والمعالم",
  "الأنشطة والتجارب",
  "الأمان وعمليات الاحتيال الشائعة",
  "أخطاء يجب تجنبها وآداب التعامل",
  "أفضل الشهور للزيارة والطقس",
  "قائمة الحقيبة وقوائم التحضير والوصول",
  "برنامج 7 أيام",
  "برنامج 10 أيام",
  "برنامج 14 يومًا",
  "تخطيط الميزانية ونصائح التوفير",
  "مواقع رسمية وروابط مفيدة",
  "معلومات الطوارئ والأسئلة الشائعة",
];

export const Route = createFileRoute("/guides/$slug")({
  loader: ({ params }) => {
    const country = countryBySlug(params.slug);
    if (!country || !country.guideAvailable) throw notFound();
    return { country };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "الدليل غير متاح" }, { name: "robots", content: "noindex" }] };
    }
    const c = loaderData.country;
    const title = `دليل السفر إلى ${c.ar} ${c.flag} | Travel Smart Budget`;
    const description = `دليل كامل للسفر إلى ${c.ar}: التأشيرة، الوصول، الإقامة، المواصلات، الميزانية وبرامج 7 و10 و14 يومًا.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
      ],
    };
  },
  component: GuidePage,
  errorComponent: () => <div className="container-page py-24 text-center">تعذّر التحميل.</div>,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl font-bold">هذا الدليل غير متاح حاليًا</h1>
      <Link to="/guides" className="mt-4 inline-block text-primary underline">
        كل الأدلة
      </Link>
    </div>
  ),
});

function GuidePage() {
  const { country: c } = Route.useLoaderData();
  const { pricing } = useSiteSettings();

  return (
    <>
      <section className="relative isolate">
        <img
          src={continentImage(c.continent)}
          alt={`دليل السفر إلى ${c.ar}`}
          width={1280}
          height={853}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 to-black/50" />
        <div className="container-page flex min-h-[50svh] flex-col justify-end pb-12 pt-24 text-on-dark">
          <p className="text-xs opacity-80">دليل سفر كامل</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            دليل السفر إلى {c.ar} {c.flag}
          </h1>
          <p className="mt-3 max-w-2xl text-sm opacity-90">{c.tagline}</p>
        </div>
      </section>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <h2 className="text-xl font-extrabold">ماذا يغطي الدليل؟</h2>
          <p className="mt-3 text-balance-ar text-sm text-muted-foreground">
            مرجع عملي للتحضير الكامل للرحلة. المعلومات المجانية على صفحة الدولة تعطيك مقدمة، أما
            الدليل فيأخذك خطوة بخطوة من قرار السفر حتى العودة.
          </p>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {CHAPTERS.map((t) => (
              <li key={t} className="flex items-start gap-2 rounded-2xl bg-secondary px-4 py-3 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-3xl border border-dashed border-border p-6">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Lock className="size-4" /> محتوى الدليل محمي
            </div>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              يُفتح محتوى الدليل بعد إتمام عملية الشراء، ولا يُعرض في الصفحات العامة. سيتم إنشاء رقم
              طلب خاص بك على شكل TSB-GUIDE-2026-XXXX ويصلك تأكيد بالبريد الإلكتروني.
            </p>
          </div>

          <div className="mt-8 rounded-3xl bg-secondary p-6">
            <h3 className="font-bold">لست مستعدًا للشراء بعد؟</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              اقرأ المعلومات المجانية عن {c.ar} أولًا، أو احسب ميزانية رحلتك.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link to="/countries/$slug" params={{ slug: c.slug }}>
                  معلومات {c.ar} المجانية
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/calculator">احسب ميزانيتك</Link>
              </Button>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-border p-6 lg:sticky lg:top-24">
          <p className="text-sm text-muted-foreground">سعر الدليل</p>
          <p className="mt-1 text-4xl font-black">{formatUSD(pricing.guidePriceUSD)}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            دفعة واحدة · وصول دائم للنسخة المحدّثة من الدليل.
          </p>
          <Button asChild variant="hero" size="lg" className="mt-5 w-full">
            <Link to="/checkout" search={{ product: "guide", country: c.slug }}>
              احصل على الدليل الكامل
            </Link>
          </Button>
          <p className="mt-4 text-xs leading-6 text-muted-foreground">
            الدفع الإلكتروني قيد التفعيل. عند الضغط ستصل إلى صفحة الطلب وتظهر لك حالة الإعداد
            وطريقة التواصل معنا لإتمام الشراء.
          </p>
        </aside>
      </div>
    </>
  );
}
