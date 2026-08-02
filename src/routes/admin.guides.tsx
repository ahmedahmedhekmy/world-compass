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
  const [uploading, setUploading] = useState<string | null>(null);

  async function uploadPdf(id: string, slug: string, file: File) {
    setUploading(id);
    const path = `${slug}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("guides").upload(path, file, {
      contentType: "application/pdf",
      upsert: true,
    });
    setUploading(null);
    if (error) return toast.error("تعذّر رفع الملف");
    await supabase.from("guides").update({ pdf_url: path } as never).eq("id", id);
    toast.success("تم رفع ملف الدليل");
    qc.invalidateQueries({ queryKey: ["admin-guides"] });
  }


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
          const extra = g as unknown as {
            preview_text?: string | null;
            version?: string | null;
            seo_title?: string | null;
            seo_description?: string | null;
          };
          return (
            <div key={g.id} className="rounded-3xl border border-border p-5 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {g.cover_image_url && (
                    <img
                      src={g.cover_image_url}
                      alt=""
                      loading="lazy"
                      className="size-14 rounded-2xl object-cover"
                    />
                  )}
                  <div>
                    <p className="font-bold">{g.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {g.country_slug} · {sections.length} فصل · {extra.version ?? "v1.0"} · آخر تحديث{" "}
                      {g.last_updated} · {g.published ? "منشور" : "مسودة"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditing(editing === g.id ? null : g.id)}>
                    {editing === g.id ? "إغلاق" : "تحرير المحتوى"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => save(g.id, { published: !g.published })}>
                    {g.published ? "إلغاء النشر" : "نشر"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => remove(g.id)}>
                    حذف
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
                        title: String(fd.get("title") ?? g.title),
                        country_slug: String(fd.get("country_slug") ?? g.country_slug),
                        sections: parsed,
                        price_usd: Number(fd.get("price")) || null,
                        cover_image_url: String(fd.get("cover") ?? "") || null,
                        version: String(fd.get("version") ?? "") || "v1.0",
                        seo_title: String(fd.get("seo_title") ?? "") || null,
                        seo_description: String(fd.get("seo_description") ?? "") || null,
                        pdf_url: String(fd.get("pdf_url") ?? "") || null,
                        summary: String(fd.get("summary") ?? "") || null,
                        preview_text: String(fd.get("preview_text") ?? "") || null,
                        last_updated: String(fd.get("last_updated") ?? "") || g.last_updated,
                      });
                    } catch {
                      toast.error("صيغة الفصول غير صحيحة (JSON)");
                    }
                  }}
                >
                  <Label htmlFor={`title-${g.id}`}>عنوان الدليل</Label>
                  <Input id={`title-${g.id}`} name="title" defaultValue={g.title} />

                  <Label htmlFor={`country-${g.id}`}>الدولة</Label>
                  <select
                    id={`country-${g.id}`}
                    name="country_slug"
                    defaultValue={g.country_slug}
                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
                  >
                    {countries.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.ar}
                      </option>
                    ))}
                  </select>

                  <Label htmlFor={`cover-${g.id}`}>رابط صورة الغلاف</Label>
                  <Input id={`cover-${g.id}`} name="cover" defaultValue={g.cover_image_url ?? ""} />

                  <Label htmlFor={`summary-${g.id}`}>وصف الدليل</Label>
                  <Input id={`summary-${g.id}`} name="summary" defaultValue={g.summary ?? ""} />

                  <Label htmlFor={`preview-${g.id}`}>نص المعاينة المجانية</Label>
                  <Textarea
                    id={`preview-${g.id}`}
                    name="preview_text"
                    rows={4}
                    defaultValue={extra.preview_text ?? ""}
                  />

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="grid gap-2">
                      <Label htmlFor={`price-${g.id}`}>السعر (USD)</Label>
                      <Input id={`price-${g.id}`} name="price" type="number" defaultValue={g.price_usd ?? ""} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`version-${g.id}`}>الإصدار</Label>
                      <Input id={`version-${g.id}`} name="version" defaultValue={extra.version ?? "v1.0"} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`updated-${g.id}`}>تاريخ آخر تحديث</Label>
                      <Input
                        id={`updated-${g.id}`}
                        name="last_updated"
                        type="date"
                        defaultValue={g.last_updated ?? ""}
                      />
                    </div>
                  </div>

                  <Label htmlFor={`seot-${g.id}`}>عنوان SEO</Label>
                  <Input id={`seot-${g.id}`} name="seo_title" defaultValue={extra.seo_title ?? ""} />
                  <Label htmlFor={`seod-${g.id}`}>وصف SEO</Label>
                  <Textarea
                    id={`seod-${g.id}`}
                    name="seo_description"
                    rows={2}
                    defaultValue={extra.seo_description ?? ""}
                  />

                  <Label htmlFor={`pdf-${g.id}`}>ملف PDF (مسار داخلي أو رابط)</Label>
                  <Input id={`pdf-${g.id}`} name="pdf_url" defaultValue={g.pdf_url ?? ""} />
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="application/pdf"
                      className="text-xs"
                      disabled={uploading === g.id}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadPdf(g.id, g.country_slug, file);
                      }}
                    />
                    {uploading === g.id && <span className="text-xs">جارٍ الرفع…</span>}
                  </div>

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
        {(guides ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">لا توجد أدلة بعد — أنشئ أول دليل من الأعلى.</p>
        )}
      </div>
    </>
  );
}

