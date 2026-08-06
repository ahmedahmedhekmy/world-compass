import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { submitBookingRequest } from "@/lib/leads.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Countdown } from "@/components/countdown";
import { formatUSD } from "@/config/site";


export const Route = createFileRoute("/offers")({
  head: () => ({
    links: [{ rel: "canonical", href: "/offers" }],
    meta: [
      { title: "عروض السفر الأسبوعية | Travel Smart Budget" },
      {
        name: "description",
        content:
          "عروض سفر مختارة تتجدد أسبوعيًا مع وجهة ومدة وسعر تقريبي للبدء، وإمكانية إرسال طلب حجز مباشرة.",
      },
      { property: "og:title", content: "عروض السفر الأسبوعية" },
      { property: "og:description", content: "وجهات مختارة بأسعار تبدأ من مبالغ تقديرية." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OffersPage,
});

interface Offer {
  id: string;
  title: string;
  destination: string | null;
  duration: string | null;
  includes: string[] | null;
  starting_price_usd: number | null;
  image_url: string | null;
  cta_label: string | null;
  ends_at: string | null;
  featured: boolean | null;
}

function OffersPage() {
  const { data: offers, isLoading } = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("offers")
        .select(
          "id, title, destination, duration, includes, starting_price_usd, image_url, cta_label, ends_at, featured",
        )
        .order("featured", { ascending: false })
        .order("sort_order", { ascending: true });
      return (data ?? []) as Offer[];
    },
  });

  const [selected, setSelected] = useState<Offer | null>(null);
  const items = offers ?? [];

  return (
    <>
      <section className="surface-deep py-16">
        <div className="container-page">
          <h1 className="text-3xl font-black sm:text-4xl">عروض السفر الأسبوعية</h1>
          <p className="mt-4 max-w-2xl text-balance-ar text-sm opacity-85">
            وجهات مختارة نحدّثها أسبوعيًا. الأسعار الظاهرة تقديرية وتبدأ من، وتتغير حسب موعد السفر
            والتوافر وقت الحجز.
          </p>
        </div>
      </section>

      <section className="container-page py-12">
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-3xl bg-secondary" />
            ))}
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="mx-auto max-w-xl rounded-3xl border border-border p-10 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary text-2xl">
              ✈️
            </span>
            <h2 className="mt-5 text-lg font-extrabold">عروض هذا الأسبوع قيد الإعداد</h2>
            <p className="mt-2 text-balance-ar text-sm text-muted-foreground">
              نُحدّث العروض أسبوعيًا. اشترك في النشرة ليصلك عرض الأسبوع القادم أولًا، أو ابدأ الآن
              بحساب ميزانية رحلتك مجانًا.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild variant="hero">
                <Link to="/calculator">احسب ميزانية رحلتك</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/countries">تصفّح الوجهات</Link>
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((o) => (
            <article key={o.id} className="overflow-hidden rounded-3xl border border-border">
              {o.image_url && (
                <img
                  src={o.image_url}
                  alt={o.title}
                  loading="lazy"
                  decoding="async"
                  className="h-44 w-full object-cover"
                />
              )}
              <div className="p-5">
                {o.featured && (
                  <span className="mb-2 inline-block rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground">
                    عرض مميز
                  </span>
                )}
                <h2 className="font-extrabold">{o.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[o.destination, o.duration].filter(Boolean).join(" · ")}
                </p>
                {o.includes && o.includes.length > 0 && (
                  <ul className="mt-3 grid gap-1 text-xs text-muted-foreground">
                    {o.includes.map((i) => (
                      <li key={i}>• {i}</li>
                    ))}
                  </ul>
                )}
                {o.ends_at && (
                  <div className="mt-4">
                    <p className="mb-1.5 text-[11px] font-semibold text-muted-foreground">
                      ينتهي العرض خلال
                    </p>
                    <Countdown endsAt={o.ends_at} />
                  </div>
                )}
                {o.starting_price_usd != null && (
                  <p className="mt-4 text-2xl font-black">
                    من {formatUSD(Number(o.starting_price_usd))}
                  </p>
                )}
                <Button className="mt-4 w-full" variant="hero" onClick={() => setSelected(o)}>
                  {o.cta_label ?? "أرسل طلب حجز"}
                </Button>
              </div>
            </article>
          ))}
        </div>


        {selected && <BookingForm offer={selected} onDone={() => setSelected(null)} />}
      </section>
    </>
  );
}

function BookingForm({ offer, onDone }: { offer: Offer; onDone: () => void }) {
  const send = useServerFn(submitBookingRequest);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await send({
        data: {
          offer_id: offer.id,
          offer_title: offer.title,
          full_name: String(fd.get("full_name") ?? ""),
          email: String(fd.get("email") ?? ""),
          phone: String(fd.get("phone") ?? "") || undefined,
          travellers: Number(fd.get("travellers") ?? 1),
          start_date: String(fd.get("start_date") ?? "") || undefined,
          end_date: String(fd.get("end_date") ?? "") || undefined,
          special_requests: String(fd.get("special_requests") ?? "") || undefined,
        },
      });
      toast.success("استلمنا طلب الحجز وسنتواصل معك قريبًا.");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذّر الإرسال");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 grid gap-4 rounded-3xl border border-border p-6 sm:grid-cols-2">
      <h3 className="text-lg font-extrabold sm:col-span-2">طلب حجز: {offer.title}</h3>
      <div className="grid gap-2">
        <Label htmlFor="full_name">الاسم الكامل</Label>
        <Input id="full_name" name="full_name" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">رقم الجوال / واتساب</Label>
        <Input id="phone" name="phone" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="travellers">عدد المسافرين</Label>
        <Input id="travellers" name="travellers" type="number" min={1} defaultValue={1} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="start_date">تاريخ الذهاب</Label>
        <Input id="start_date" name="start_date" type="date" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="end_date">تاريخ العودة</Label>
        <Input id="end_date" name="end_date" type="date" />
      </div>
      <div className="grid gap-2 sm:col-span-2">
        <Label htmlFor="special_requests">ملاحظات إضافية</Label>
        <Textarea id="special_requests" name="special_requests" rows={3} />
      </div>
      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit" variant="hero" disabled={busy}>
          {busy ? "جارٍ الإرسال…" : "إرسال الطلب"}
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>
          إلغاء
        </Button>
      </div>
      <p className="text-xs text-muted-foreground sm:col-span-2">
        إرسال الطلب لا يعني تأكيد الحجز؛ نتواصل معك أولًا للتأكد من التوافر والأسعار الفعلية.
      </p>
    </form>
  );
}
