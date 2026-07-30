import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { countries } from "@/data/countries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/guides")({
  component: AdminGuides,
});

interface Section {
  title: string;
  body: string;
}

function AdminGuides() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);

  const { data: guides } = useQuery({
    queryKey: ["admin-guides"],
    queryFn: async () => {
      const { data } = await supabase.from("guides").select("*").order("country_slug");
      return data ?? [];
    },
  });

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const slug = String(fd.get("country_slug"));
    const country = countries.find((c) => c.slug === slug);
    const { error } = await supabase.from("guides").insert({
      country_slug: slug,
      title: `دليل السفر إلى ${country?.ar ?? slug}`,
      price_usd: Number(fd.get("price")) || null,
    });
    if (error) return toast.error("ربما يوجد دليل لهذه الدولة بالفعل");
    toast.success("تم إنشاء الدليل");
    qc.invalidateQueries({ queryKey: ["admin-guides"] });
  }

  async function save(id: string, patch: Record<string, unknown>) {
    const { error } = await supabase
      .from("guides")
      .update(patch as never)
      .eq("id", id);
    if (error) return toast.error("تعذّر الحفظ");
    toast.success("تم الحفظ");
    qc.invalidateQueries({ queryKey: ["admin-guides"] });
  }

  return (
    <>
      <h1 className="text-2xl font-extrabold">الأدلة المدفوعة</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        محتوى الأدلة محمي بالكامل ولا يظهر إلا لمن أتم الشراء.
      </p>

      <form onSubmit={create} className="mt-6 grid gap-4 rounded-3xl border border-border p-6 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="country_slug">الدولة</Label>
          <select
            id="country_slug"
            name="country_slug"
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          >
            {countries.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.ar}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="price">السعر (USD، اختياري)</Label>
          <Input id="price" name="price" type="number" />
        </div>
        <Button type="submit" variant="hero" className="self-end">
          إنشاء دليل
        </Button>
      </form>

      <div className="mt-8 grid gap-4">
        {(guides ?? []).map((g) => {
          const sections = (g.sections as unknown as Section[]) ?? [];
          return (
            <div key={g.id} className="rounded-3xl border border-border p-5 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold">{g.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {g.country_slug} · {sections.length} فصل ·{" "}
                    {g.published ? "منشور" : "مسودة"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditing(editing === g.id ? null : g.id)}>
                    {editing === g.id ? "إغلاق" : "تحرير المحتوى"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => save(g.id, { published: !g.published })}>
                    {g.published ? "إلغاء النشر" : "نشر"}
                  </Button>
                </div>
              </div>

              {editing === g.id && (
                <form
                  className="mt-4 grid gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const raw = String(fd.get("sections") ?? "[]");
                    try {
                      const parsed = JSON.parse(raw) as Section[];
                      save(g.id, {
                        sections: parsed,
                        price_usd: Number(fd.get("price")) || null,
                        pdf_url: String(fd.get("pdf_url") ?? "") || null,
                        summary: String(fd.get("summary") ?? "") || null,
                      });
                    } catch {
                      toast.error("صيغة الفصول غير صحيحة (JSON)");
                    }
                  }}
                >
                  <Label htmlFor={`summary-${g.id}`}>ملخص الدليل</Label>
                  <Input id={`summary-${g.id}`} name="summary" defaultValue={g.summary ?? ""} />
                  <Label htmlFor={`price-${g.id}`}>السعر (USD)</Label>
                  <Input id={`price-${g.id}`} name="price" type="number" defaultValue={g.price_usd ?? ""} />
                  <Label htmlFor={`pdf-${g.id}`}>رابط ملف PDF</Label>
                  <Input id={`pdf-${g.id}`} name="pdf_url" defaultValue={g.pdf_url ?? ""} />
                  <Label htmlFor={`sections-${g.id}`}>
                    الفصول (JSON: [{"{"}"title":"...","body":"..."{"}"}])
                  </Label>
                  <Textarea
                    id={`sections-${g.id}`}
                    name="sections"
                    rows={12}
                    className="font-mono text-xs"
                    defaultValue={JSON.stringify(sections, null, 2)}
                  />
                  <Button type="submit" variant="hero" className="w-fit">
                    حفظ
                  </Button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
