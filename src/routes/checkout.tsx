import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatUSD } from "@/config/site";
import { countryBySlug } from "@/data/countries";
import { createOrder } from "@/lib/leads.functions";
import { useSiteSettings } from "@/lib/site-settings";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { product, country } = Route.useSearch();
  const { pricing, contact } = useSiteSettings();
  const place = useServerFn(createOrder);
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const c = country ? countryBySlug(country) : undefined;
  const isGuide = product === "guide";
  const price = isGuide ? pricing.guidePriceUSD : pricing.planningStartFeeUSD;
  const title = isGuide
    ? `دليل السفر إلى ${c?.ar ?? "الدولة"} ${c?.flag ?? ""}`
    : "خدمة تخطيط رحلة مخصصة";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const res = await place({
        data: {
          product_type: product,
          country_slug: country,
          full_name: String(fd.get("full_name") ?? ""),
          email: String(fd.get("email") ?? ""),
          notes: String(fd.get("notes") ?? "") || undefined,
        },
      });
      setReference(res.reference);
      toast.success("تم إنشاء طلبك بنجاح");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذّر إنشاء الطلب");
    } finally {
      setBusy(false);
    }
  }

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

      {reference ? (
        <div className="mt-6 rounded-3xl bg-secondary p-6 text-sm leading-7">
          <p className="font-bold">تم تسجيل طلبك برقم {reference}</p>
          <p className="mt-2 text-muted-foreground">
            أرسلنا تأكيدًا إلى بريدك، وسنزوّدك بتعليمات إتمام الدفع. بعد تأكيد الدفع سيظهر المنتج
            مباشرة داخل حسابك.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild variant="hero">
              <Link to="/account">اذهب إلى حسابي</Link>
            </Button>
            <Button asChild variant="outline">
              <a href={`mailto:${contact.email}?subject=${encodeURIComponent(`الطلب ${reference}`)}`}>
                تواصل بخصوص الطلب
              </a>
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-3xl border border-border p-6">
          <div className="grid gap-2">
            <Label htmlFor="full_name">الاسم الكامل</Label>
            <Input id="full_name" name="full_name" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
            <Input id="notes" name="notes" />
          </div>
          <Button type="submit" variant="hero" disabled={busy}>
            {busy ? "جارٍ إنشاء الطلب…" : "تأكيد الطلب"}
          </Button>
          <p className="text-xs leading-6 text-muted-foreground">
            الدفع الإلكتروني قيد التفعيل حاليًا. عند تأكيد الطلب يتم تسجيله برقم خاص بك، ونرسل لك
            تعليمات إتمام الدفع بالبريد.
          </p>
        </form>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/guides">العودة إلى الأدلة</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/refund">سياسة الاسترجاع</Link>
        </Button>
      </div>
    </section>
  );
}
