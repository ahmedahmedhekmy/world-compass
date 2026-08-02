import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { syncCountryCatalog } from "@/lib/content.functions";
import { continents } from "@/data/countries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/countries")({
  component: AdminCountries,
});

interface CountryRow {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  native_name: string | null;
  iso_code: string | null;
  flag: string | null;
  continent: string;
  region: string | null;
  capital: string | null;
  currency: string | null;
  languages: string[] | null;
  hero_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  guide_price_usd: number | null;
  published: boolean;
  content: Record<string, unknown>;
}

function AdminCountries() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const [continent, setContinent] = useState("all");
  const sync = useServerFn(syncCountryCatalog);

  const { data } = useQuery({
    queryKey: ["admin-countries"],
    queryFn: async () => {
      const { data } = await supabase.from("countries").select("*").order("name_ar");
      return (data ?? []) as unknown as CountryRow[];
    },
  });

  async function save(id: string, patch: Record<string, unknown>) {
    const { error } = await supabase.from("countries").update(patch as never).eq("id", id);
    if (error) return toast.error("تعذّر الحفظ");
    toast.success("تم الحفظ");
    qc.invalidateQueries({ queryKey: ["admin-countries"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("countries").delete().eq("id", id);
    if (error) return toast.error("تعذّر الحذف");
    toast.success("تم حذف الدولة");
    qc.invalidateQueries({ queryKey: ["admin-countries"] });
  }

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const { error } = await supabase.from("countries").insert({
      slug: String(fd.get("slug")).trim(),
      name_ar: String(fd.get("name_ar")),
      name_en: String(fd.get("name_en")),
      continent: String(fd.get("continent")),
      flag: String(fd.get("flag") ?? "") || null,
      published: false,
    } as never);
    if (error) return toast.error("تعذّر إنشاء الدولة (تأكد أن المعرف غير مكرر)");
    toast.success("تمت إضافة الدولة كمسودة");
    form.reset();
    setCreating(false);
    qc.invalidateQueries({ queryKey: ["admin-countries"] });
  }

  const rows = (data ?? [])
    .filter((c) => continent === "all" || c.continent === continent)
    .filter((c) =>
      `${c.name_ar} ${c.name_en} ${c.slug}`.toLowerCase().includes(query.trim().toLowerCase()),
    );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">إدارة الدول</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCreating((v) => !v)}>
            {creating ? "إغلاق" : "إضافة دولة"}
          </Button>
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
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        عدّل كل بيانات الدولة: الأسماء، العاصمة، العملة، اللغات، الصورة، السعر، بيانات محركات البحث،
        والمحتوى التفصيلي.
      </p>

      {creating && (
        <form onSubmit={create} className="mt-5 grid gap-3 rounded-3xl border border-border p-6 sm:grid-cols-2">
          <Text name="slug" label="المعرف بالإنجليزية (slug)" required />
          <Text name="name_ar" label="الاسم بالعربية" required />
          <Text name="name_en" label="الاسم بالإنجليزية" required />
          <Text name="flag" label="رمز العلم" />
          <div className="grid gap-2">
            <Label htmlFor="new-continent">القارة</Label>
            <select
              id="new-continent"
              name="continent"
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
            >
              {continents.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.ar}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="hero" className="self-end">
            إنشاء
          </Button>
        </form>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن دولة…"
          className="max-w-sm"
        />
        <select
          value={continent}
          onChange={(e) => setContinent(e.target.value)}
          className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          aria-label="تصفية حسب القارة"
        >
          <option value="all">كل القارات</option>
          {continents.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.ar}
            </option>
          ))}
        </select>
        <span className="self-center text-xs text-muted-foreground">{rows.length} دولة</span>
      </div>

      <div className="mt-6 grid gap-3">
        {rows.map((c) => (
          <div key={c.id} className="rounded-3xl border border-border p-5 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold">
                  {c.flag} {c.name_ar} · {c.name_en}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.slug} · {c.continent} · {c.published ? "منشورة" : "مخفية"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(editing === c.id ? null : c.id)}>
                  {editing === c.id ? "إغلاق" : "تحرير"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => save(c.id, { published: !c.published })}>
                  {c.published ? "إخفاء" : "نشر"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => remove(c.id)}>
                  حذف
                </Button>
              </div>
            </div>

            {editing === c.id && (
              <form
                className="mt-4 grid gap-3 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  let content: unknown = c.content ?? {};
                  try {
                    content = JSON.parse(String(fd.get("content") ?? "{}"));
                  } catch {
                    toast.error("صيغة المحتوى التفصيلي غير صحيحة (JSON)");
                    return;
                  }
                  save(c.id, {
                    name_ar: String(fd.get("name_ar") ?? c.name_ar),
                    name_en: String(fd.get("name_en") ?? c.name_en),
                    native_name: String(fd.get("native_name") ?? "") || null,
                    flag: String(fd.get("flag") ?? "") || null,
                    iso_code: String(fd.get("iso_code") ?? "") || null,
                    continent: String(fd.get("continent") ?? c.continent),
                    region: String(fd.get("region") ?? "") || null,
                    capital: String(fd.get("capital") ?? "") || null,
                    currency: String(fd.get("currency") ?? "") || null,
                    languages: String(fd.get("languages") ?? "")
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                    hero_image_url: String(fd.get("hero") ?? "") || null,
                    guide_price_usd: Number(fd.get("guide_price")) || null,
                    seo_title: String(fd.get("seo_title") ?? "") || null,
                    seo_description: String(fd.get("seo_description") ?? "") || null,
                    content,
                  });
                }}
              >
                <Text name="name_ar" label="الاسم بالعربية" defaultValue={c.name_ar} />
                <Text name="name_en" label="الاسم بالإنجليزية" defaultValue={c.name_en} />
                <Text name="native_name" label="الاسم المحلي" defaultValue={c.native_name ?? ""} />
                <Text name="flag" label="رمز العلم" defaultValue={c.flag ?? ""} />
                <Text name="iso_code" label="رمز الدولة ISO" defaultValue={c.iso_code ?? ""} />
                <div className="grid gap-2">
                  <Label htmlFor={`cont-${c.id}`}>القارة</Label>
                  <select
                    id={`cont-${c.id}`}
                    name="continent"
                    defaultValue={c.continent}
                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
                  >
                    {continents.map((x) => (
                      <option key={x.slug} value={x.slug}>
                        {x.ar}
                      </option>
                    ))}
                  </select>
                </div>
                <Text name="region" label="المنطقة" defaultValue={c.region ?? ""} />
                <Text name="capital" label="العاصمة" defaultValue={c.capital ?? ""} />
                <Text name="currency" label="العملة" defaultValue={c.currency ?? ""} />
                <Text
                  name="languages"
                  label="اللغات (مفصولة بفواصل)"
                  defaultValue={(c.languages ?? []).join("، ")}
                />
                <Text name="hero" label="رابط صورة الغلاف" defaultValue={c.hero_image_url ?? ""} />
                <Text
                  name="guide_price"
                  label="سعر الدليل لهذه الدولة (USD)"
                  type="number"
                  defaultValue={c.guide_price_usd != null ? String(c.guide_price_usd) : ""}
                />
                <Text name="seo_title" label="عنوان SEO" defaultValue={c.seo_title ?? ""} />
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor={`sd-${c.id}`}>وصف SEO</Label>
                  <Textarea id={`sd-${c.id}`} name="seo_description" rows={3} defaultValue={c.seo_description ?? ""} />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor={`content-${c.id}`}>محتوى تفصيلي إضافي (JSON)</Label>
                  <Textarea
                    id={`content-${c.id}`}
                    name="content"
                    rows={8}
                    className="font-mono text-xs"
                    defaultValue={JSON.stringify(c.content ?? {}, null, 2)}
                  />
                </div>
                <Button type="submit" variant="hero" className="w-fit sm:col-span-2">
                  حفظ التعديلات
                </Button>
              </form>
            )}
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">
            لا توجد نتائج مطابقة — جرّب بحثًا آخر أو اضغط «مزامنة قائمة الدول».
          </p>
        )}
      </div>
    </>
  );
}

function Text({
  name,
  label,
  defaultValue,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
}) {
  const id = `${name}-${label}`;
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} type={type} defaultValue={defaultValue} required={required} />
    </div>
  );
}
