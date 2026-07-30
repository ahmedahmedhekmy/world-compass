import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/offers")({
  component: AdminOffers,
});

function AdminOffers() {
  const qc = useQueryClient();
  const { data: offers } = useQuery({
    queryKey: ["admin-offers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("offers")
        .select("*")
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
  });

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const includes = String(fd.get("includes") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const { error } = await supabase.from("offers").insert({
      title: String(fd.get("title")),
      destination: String(fd.get("destination") ?? "") || null,
      duration: String(fd.get("duration") ?? "") || null,
      includes,
      starting_price_usd: Number(fd.get("price") ?? 0) || null,
      image_url: String(fd.get("image_url") ?? "") || null,
      ends_at: String(fd.get("ends_at") ?? "") || null,
      sort_order: Number(fd.get("sort_order") ?? 0),
    });
    if (error) return toast.error("تعذّر إنشاء العرض");
    toast.success("تم إنشاء العرض");
    e.currentTarget.reset();
    qc.invalidateQueries({ queryKey: ["admin-offers"] });
  }

  async function toggle(id: string, active: boolean) {
    await supabase.from("offers").update({ active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-offers"] });
  }

  async function remove(id: string) {
    await supabase.from("offers").delete().eq("id", id);
    toast.success("تم حذف العرض");
    qc.invalidateQueries({ queryKey: ["admin-offers"] });
  }

  return (
    <>
      <h1 className="text-2xl font-extrabold">العروض الأسبوعية</h1>

      <form onSubmit={create} className="mt-6 grid gap-4 rounded-3xl border border-border p-6 sm:grid-cols-2">
        <Field name="title" label="عنوان العرض" required />
        <Field name="destination" label="الوجهة" />
        <Field name="duration" label="المدة" placeholder="7 أيام" />
        <Field name="price" label="يبدأ من (USD)" type="number" />
        <Field name="includes" label="يشمل (مفصولة بفواصل)" />
        <Field name="image_url" label="رابط الصورة" />
        <Field name="ends_at" label="ينتهي في" type="date" />
        <Field name="sort_order" label="الترتيب" type="number" />
        <Button type="submit" variant="hero" className="sm:col-span-2">
          إضافة عرض
        </Button>
      </form>

      <div className="mt-8 grid gap-3">
        {(offers ?? []).map((o) => (
          <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border p-5 text-sm">
            <div>
              <p className="font-bold">{o.title}</p>
              <p className="text-xs text-muted-foreground">
                {[o.destination, o.duration].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toggle(o.id, !o.active)}>
                {o.active ? "إخفاء" : "نشر"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => remove(o.id)}>
                حذف
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} placeholder={placeholder} />
    </div>
  );
}
