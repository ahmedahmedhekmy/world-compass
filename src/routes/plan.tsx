import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { site, formatUSD } from "@/config/site";
import { useSiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "خدمة تخطيط رحلة مخصصة | Travel Smart Budget" },
      {
        name: "description",
        content:
          "خدمة مدفوعة للمسافرين الجادين: برنامج سفر مخصص، مراجعة ميزانية، تخطيط الإقامة والمواصلات وإرشادات التحضير.",
      },
      { property: "og:title", content: "خطط رحلتك مع Travel Smart Budget" },
      { property: "og:description", content: "خطة سفر مخصصة تُعد خصيصًا لرحلتك." },
    ],
  }),
  component: PlanPage,
});

function PlanPage() {
  const { pricing } = useSiteSettings();
  return (
    <>
      <section className="surface-deep py-16">
        <div className="container-page">
          <h1 className="text-3xl font-black sm:text-4xl">خطة سفر مخصصة</h1>
          <p className="mt-4 max-w-2xl text-balance-ar text-sm opacity-85">
            بعد أن تحصل على التقدير المجاني، يمكننا تحويله إلى خطة تنفيذية كاملة تناسب أيامك
            وميزانيتك وأسلوب سفرك.
          </p>
        </div>
      </section>

      <section className="container-page grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <h2 className="text-xl font-extrabold">ما الذي تشمله الخدمة؟</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "برنامج سفر يومي مخصص",
              "اختيار الوجهات داخل الدولة",
              "مراجعة ميزانيتك وتعديلها",
              "استراتيجية الإقامة ومناطقها",
              "تخطيط المواصلات الداخلية",
              "إرشادات معلومات التأشيرة",
              "تحضير ما قبل السفر",
              "نصائح عملية أثناء الرحلة",
            ].map((i) => (
              <li key={i} className="rounded-2xl bg-secondary px-4 py-3 text-sm">
                {i}
              </li>
            ))}
          </ul>

          <h2 className="mt-10 text-xl font-extrabold">كيف تبدأ؟</h2>
          <ol className="mt-4 grid gap-3">
            {[
              "استخدم الحاسبة المجانية للحصول على تقدير أولي.",
              "اطلب الخدمة وأرسل تفاصيل رحلتك.",
              "نتواصل معك لتأكيد النطاق والمتطلبات.",
              "تستلم خطتك المخصصة، ونتابع معك عبر واتساب بعد الطلب.",
            ].map((s, i) => (
              <li key={s} className="rounded-2xl border border-border px-4 py-3 text-sm">
                <span className="me-2 font-black text-muted-foreground">0{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>

          <p className="mt-8 rounded-2xl bg-secondary p-5 text-xs leading-7 text-muted-foreground">
            الخدمة استشارية وتخطيطية فقط. لا نضمن الحصول على تأشيرة، ولا توافر أسعار الطيران أو
            الفنادق، وجميع الأرقام المقدّمة تقديرية.
          </p>
        </div>

        <aside className="h-fit rounded-3xl border border-border p-6 lg:sticky lg:top-24">
          <p className="text-sm text-muted-foreground">رسوم الخدمة</p>
          <p className="mt-1 text-4xl font-black">{formatUSD(pricing.planningStartFeeUSD)}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            رسوم بدء تُدفع مرة واحدة، وتشمل إعداد خطتك المخصصة ومراجعتها معك.
          </p>
          <Button asChild variant="hero" size="lg" className="mt-5 w-full">
            <Link to="/checkout" search={{ product: "planning" }}>
              اطلب الخدمة
            </Link>
          </Button>
          <Button asChild variant="outline" className="mt-3 w-full">
            <Link to="/calculator">ابدأ بالتقدير المجاني</Link>
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            للاستفسار:{" "}
            <a className="text-primary underline" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </p>
        </aside>
      </section>
    </>
  );
}
