import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا | Travel Smart Budget" },
      {
        name: "description",
        content: `تواصل مع فريق Travel Smart Budget عبر البريد الإلكتروني ${site.email} للاستفسار عن الأدلة أو خدمة التخطيط.`,
      },
      { property: "og:title", content: "تواصل معنا | Travel Smart Budget" },
      { property: "og:description", content: "نحن هنا للإجابة عن أسئلتك حول رحلتك." },
    ],
  }),
  component: () => (
    <section className="container-page max-w-3xl py-16">
      <h1 className="text-3xl font-black">تواصل معنا</h1>
      <p className="mt-4 text-sm leading-8 text-muted-foreground">
        أسرع طريقة للوصول إلينا هي البريد الإلكتروني. نرد عادةً خلال 24–48 ساعة عمل. بعد إتمام أي
        طلب مدفوع نتابع معك مباشرة لإكمال التفاصيل.
      </p>
      <div className="mt-8 rounded-3xl border border-border p-6">
        <p className="text-sm text-muted-foreground">البريد الرسمي</p>
        <p className="mt-1 text-lg font-extrabold">{site.email}</p>
        <Button asChild variant="hero" className="mt-5">
          <a href={`mailto:${site.email}`}>
            <Mail className="size-4" /> أرسل رسالة
          </a>
        </Button>
      </div>
      <p className="mt-6 text-xs leading-7 text-muted-foreground">
        عند مراسلتنا، اذكر وجهتك وتواريخ سفرك التقريبية وعدد المسافرين حتى نتمكن من مساعدتك بشكل
        أدق.
      </p>
    </section>
  ),
});
