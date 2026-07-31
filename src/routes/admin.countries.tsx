import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { syncCountryCatalog } from "@/lib/content.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/countries")({
  component: AdminCountries,
});

function AdminCountries() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const sync = useServerFn(syncCountryCatalog);

  const { data } = useQuery({
    queryKey: ["admin-countries"],
    queryFn: async () => {
      const { data } = await supabase
        .from("countries")
        .select("id, slug, name_ar, name_en, continent, hero_image_url, seo_title, seo_description, published")
        .order("name_ar");
      return data ?? [];
    },
  });

  async function save(id: string, patch: Record<string, unknown>) {
    const { error } = await supabase.from("countries").update(patch as never).eq("id", id);
    if (error) return toast.error("تعذّر الحفظ");
    toast.success("تم الحفظ");
    qc.invalidateQueries({ queryKey: ["admin-countries"] });
  }

  const rows = (data ?? []).filter((c) =>
    `${c.name_ar} ${c.name_en} ${c.slug}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">إدارة الدول</h1>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              const res = await sync({});
              toast.success(`تمت مزامنة ${res.count} دولة`);
              qc.invalidateQueries({ queryKey: ["admin-countries"] });
            } catch {
              toast.error("تعذّرت المزامنة");
            }
          }}
        >
          مزامنة قائمة الدول
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        عدّل صور الغلاف، وبيانات SEO، وحالة النشر لكل دولة.
      </p>

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ابحث عن دولة…"
        className="mt-6 max-w-sm"
      />

      <div className="mt-6 grid gap-3">
        {rows.map((c) => (
          <div key={c.id} className="rounded-3xl border border-border p-5 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold">
                  {c.name_ar} · {c.name_en}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.slug} · {c.continent} · {c.published ? "منشورة" : "مخفية"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(editing === c.id ? null : c.id)}>
                  {editing === c.id ? "إغلاق" : "تحرير"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => save(c.id, { published: !c.published })}>
                  {c.published ? "إخفاء" : "نشر"}
                </Button>
              </div>
            </div>

            {editing === c.id && (
              <form
                className="mt-4 grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  save(c.id, {
                    hero_image_url: String(fd.get("hero") ?? "") || null,
                    seo_title: String(fd.get("seo_title") ?? "") || null,
                    seo_description: String(fd.get("seo_description") ?? "") || null,
                  });
                }}
              >
                <Label htmlFor={`hero-${c.id}`}>رابط صورة الغلاف</Label>
                <Input id={`hero-${c.id}`} name="hero" defaultValue={c.hero_image_url ?? ""} />
                <Label htmlFor={`st-${c.id}`}>عنوان SEO</Label>
                <Input id={`st-${c.id}`} name="seo_title" defaultValue={c.seo_title ?? ""} />
                <Label htmlFor={`sd-${c.id}`}>وصف SEO</Label>
                <Textarea id={`sd-${c.id}`} name="seo_description" rows={3} defaultValue={c.seo_description ?? ""} />
                <Button type="submit" variant="hero" className="w-fit">
                  حفظ
                </Button>
              </form>
            )}
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">
            لا توجد دول محفوظة بعد — اضغط «مزامنة قائمة الدول».
          </p>
        )}
      </div>
    </>
  );
}
