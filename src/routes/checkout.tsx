import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { site, formatUSD } from "@/config/site";
import { countryBySlug } from "@/data/countries";

const searchSchema = z.object({
  product: z.enum(["guide", "planning"]).catch("guide"),
  country: z.string().optional(),
});

export const Route = createFileRoute("/checkout")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "إتمام الطلب | Travel Smart Budget" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "صفحة إتمام الطلب." },
      { property: "og:title", content: "إتمام الطلب" },
      { property: "og:description", content: "صفحة إتمام الطلب في Travel Smart Budget." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { product, country } = Route.useSearch();
  const c = country ? countryBySlug(country) : undefined;
  const isGuide = product === "guide";
  const price = isGuide ? site.guidePriceUSD : site.planningServicePriceUSD;
  const title = isGuide
    ? `دليل السفر إلى ${c?.ar ?? "الدولة"} ${c?.flag ?? ""}`
    : "خدمة تخطيط رحلة مخصصة";

  return (
    <section className="container-page max-w-2xl py-16">
      <h1 className="text-2xl font-extrabold">إتمام الطلب</h1>
      <div className="mt-6 rounded-3xl border border-border p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-bold">{title}</p>
            <p className="mt-1 text-xs text-muted-foreground">منتج رقمي · دفعة واحدة</p>
          </div>
          <p className="text-2xl font-black">{formatUSD(price)}</p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-secondary p-6 text-sm leading-7">
        <p className="font-bold">بوابة الدفع غير مفعّلة بعد</p>
        <p className="mt-2 text-muted-foreground">
          لم يتم ربط مزوّد الدفع بعد، لذلك لا يمكن إتمام عملية شراء حقيقية الآن ولن يُنشأ أي طلب
          مدفوع. لإتمام الطلب حاليًا، تواصل معنا مباشرة على البريد{" "}
          <a className="text-primary underline" href={`mailto:${site.email}`}>
            {site.email}
          </a>{" "}
          مع ذكر اسم المنتج المطلوب.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild variant="hero">
          <a href={`mailto:${site.email}?subject=${encodeURIComponent(`طلب: ${title}`)}`}>
            أرسل طلبك بالبريد
          </a>
        </Button>
        <Button asChild variant="outline">
          <Link to="/guides">العودة إلى الأدلة</Link>
        </Button>
      </div>
    </section>
  );
}
