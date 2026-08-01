import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatUSD } from "@/config/site";
import { useSiteSettings } from "@/lib/site-settings";

export const GUIDE_INCLUDES = [
  "إرشادات التأشيرة كاملة",
  "تخطيط خطوة بخطوة",
  "فنادق ومناطق إقامة مقترحة",
  "استراتيجية التنقل والمواصلات",
  "نصائح لتوفير المال",
  "خطط رحلات 7 و10 و14 يومًا",
  "قائمة تجهيز الحقيبة",
  "نصائح سفر عملية",
  "التطبيقات المحلية المفيدة",
  "معلومات الطوارئ",
  "تحديثات دورية للدليل",
] as const;

/** Premium section shown at the end of each free country page. */
export function GuideUpsell({ slug, countryName }: { slug: string; countryName: string }) {
  const { pricing } = useSiteSettings();

  return (
    <section className="rounded-[2rem] surface-deep p-8">
      <h2 className="text-xl font-extrabold sm:text-2xl">
        ماذا ستجد داخل الدليل الكامل للسفر إلى {countryName}؟
      </h2>
      <p className="mt-3 max-w-2xl text-sm opacity-85">
        المعلومات أعلاه مجانية دائمًا. الدليل الكامل يأخذك من مرحلة الفكرة إلى يوم السفر بترتيب
        عملي واضح.
      </p>

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {GUIDE_INCLUDES.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm opacity-90">
            <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button asChild variant="sand" size="lg">
          <Link to="/guides/$slug" params={{ slug }}>
            احصل على الدليل الكامل — {formatUSD(pricing.guidePriceUSD)}
          </Link>
        </Button>
        <Button asChild variant="glass">
          <Link to="/calculator">احسب تكلفة رحلتي مجانًا</Link>
        </Button>
      </div>
      <p className="mt-4 text-xs opacity-70">
        تسليم رقمي فوري بعد تأكيد الدفع · تحديثات مستقبلية مجانية · سياسة استرجاع واضحة.
      </p>
    </section>
  );
}
