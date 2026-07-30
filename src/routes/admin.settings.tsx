import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("settings").select("key, value");
      return Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<
        string,
        Record<string, unknown>
      >;
    },
  });

  async function save(key: string, value: Record<string, unknown>) {
    const { error } = await supabase
      .from("settings")
      .update({ value: value as never })
      .eq("key", key);
    if (error) return toast.error("تعذّر الحفظ");
    toast.success("تم حفظ الإعدادات");
    qc.invalidateQueries({ queryKey: ["admin-settings"] });
    qc.invalidateQueries({ queryKey: ["settings"] });
  }

  const pricing = (data?.pricing ?? {}) as Record<string, number | string>;
  const contact = (data?.contact ?? {}) as Record<string, string>;
  const payments = (data?.payments ?? {}) as Record<string, unknown>;

  return (
    <>
      <h1 className="text-2xl font-extrabold">الأسعار والإعدادات</h1>

      <form
        className="mt-6 grid gap-4 rounded-3xl border border-border p-6 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          save("pricing", {
            guidePriceUSD: Number(fd.get("guidePriceUSD")),
            planningStartFeeUSD: Number(fd.get("planningStartFeeUSD")),
            currency: "USD",
          });
        }}
      >
        <h2 className="text-lg font-bold sm:col-span-2">الأسعار</h2>
        <div className="grid gap-2">
          <Label htmlFor="guidePriceUSD">سعر الدليل (USD)</Label>
          <Input
            id="guidePriceUSD"
            name="guidePriceUSD"
            type="number"
            defaultValue={String(pricing.guidePriceUSD ?? 19)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="planningStartFeeUSD">رسوم بدء خدمة التخطيط (USD)</Label>
          <Input
            id="planningStartFeeUSD"
            name="planningStartFeeUSD"
            type="number"
            defaultValue={String(pricing.planningStartFeeUSD ?? 49)}
          />
        </div>
        <Button type="submit" variant="hero" className="w-fit sm:col-span-2">
          حفظ الأسعار
        </Button>
      </form>

      <form
        className="mt-6 grid gap-4 rounded-3xl border border-border p-6 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          save("contact", {
            email: String(fd.get("email")),
            whatsapp: String(fd.get("whatsapp") ?? ""),
            telegram: String(fd.get("telegram") ?? ""),
          });
        }}
      >
        <h2 className="text-lg font-bold sm:col-span-2">بيانات التواصل</h2>
        <div className="grid gap-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input id="email" name="email" defaultValue={contact.email ?? ""} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="whatsapp">رقم واتساب</Label>
          <Input id="whatsapp" name="whatsapp" defaultValue={contact.whatsapp ?? ""} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="telegram">تيليجرام</Label>
          <Input id="telegram" name="telegram" defaultValue={contact.telegram ?? ""} />
        </div>
        <Button type="submit" variant="hero" className="w-fit sm:col-span-2">
          حفظ بيانات التواصل
        </Button>
      </form>

      <div className="mt-6 rounded-3xl bg-secondary p-6 text-sm leading-7">
        <h2 className="font-bold">بوابة الدفع</h2>
        <p className="mt-2 text-muted-foreground">
          الحالة الحالية: {payments.enabled ? "مفعّلة" : "غير مفعّلة"}. بنية الدفع جاهزة للربط،
          ويتم تفعيلها بعد إضافة بيانات مزوّد الدفع بشكل آمن من جهة الخادم.
        </p>
      </div>
    </>
  );
}
