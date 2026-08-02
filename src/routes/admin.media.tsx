import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { countries } from "@/data/countries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/media")({
  component: AdminMedia,
});

const COLLECTIONS = [
  { value: "gallery", label: "معرض الإلهام" },
  { value: "hero", label: "بانرات الواجهة" },
  { value: "homepage", label: "وسائط الصفحة الرئيسية" },
  { value: "country", label: "صور الوجهات" },
  { value: "continent", label: "صور القارات" },
  { value: "guide-cover", label: "أغلفة الأدلة" },
  { value: "offer", label: "صور العروض" },
] as const;

const label = (v: string) => COLLECTIONS.find((c) => c.value === v)?.label ?? v;

interface MediaRow {
  id: string;
  title: string;
  alt_text: string | null;
  url: string;
  collection: string;
  country_slug: string | null;
  sort_order: number;
  active: boolean;
  storage_path: string | null;
}

function AdminMedia() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<{ url: string; path: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { data } = useQuery({
    queryKey: ["admin-media"],
    queryFn: async () => {
      const { data } = await supabase
        .from("media_assets")
        .select("id, title, alt_text, url, collection, country_slug, sort_order, active, storage_path")
        .order("collection")
        .order("sort_order");
      return (data ?? []) as MediaRow[];
    },
  });

  async function upload(file: File) {
    setUploading(true);
    const clean = file.name.replace(/[^\w.-]/g, "_");
    const path = `${new Date().getFullYear()}/${Date.now()}-${clean}`;
    const { error } = await supabase.storage.from("media").upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });
    setUploading(false);
    if (error) return toast.error("تعذّر رفع الملف");
    setUploadedUrl({ url: `/api/public/media/${path}`, path });
    toast.success("تم رفع الصورة — أكمل البيانات ثم اضغط إضافة");
  }

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const url = String(fd.get("url") ?? "") || uploadedUrl?.url;
    if (!url) return toast.error("ارفع صورة أو أدخل رابطًا");
    const { error } = await supabase.from("media_assets").insert({
      title: String(fd.get("title")),
      alt_text: String(fd.get("alt") ?? "") || null,
      url,
      storage_path: uploadedUrl?.path ?? null,
      collection: String(fd.get("collection")),
      country_slug: String(fd.get("country_slug") ?? "") || null,
      sort_order: Number(fd.get("sort")) || 0,
    } as never);
    if (error) return toast.error("تعذّرت الإضافة");
    toast.success("تمت إضافة الوسائط");
    form.reset();
    setUploadedUrl(null);
    qc.invalidateQueries({ queryKey: ["admin-media"] });
  }

  async function mutate(id: string, patch: Record<string, unknown>) {
    const { error } = await supabase.from("media_assets").update(patch as never).eq("id", id);
    if (error) return toast.error("تعذّر التحديث");
    qc.invalidateQueries({ queryKey: ["admin-media"] });
  }

  async function remove(row: MediaRow) {
    const { error } = await supabase.from("media_assets").delete().eq("id", row.id);
    if (error) return toast.error("تعذّر الحذف");
    if (row.storage_path) await supabase.storage.from("media").remove([row.storage_path]);
    qc.invalidateQueries({ queryKey: ["admin-media"] });
  }

  const rows = (data ?? []).filter((m) => filter === "all" || m.collection === filter);

  return (
    <>
      <h1 className="text-2xl font-extrabold">مكتبة الوسائط</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        ارفع صور الوجهات وبانرات الواجهة وأغلفة الأدلة وصور المعرض، أو أضف روابط جاهزة.
      </p>

      <form ref={formRef} onSubmit={add} className="mt-6 grid gap-4 rounded-3xl border border-border p-6 sm:grid-cols-2">
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="file">رفع صورة من جهازك</Label>
          <input
            id="file"
            type="file"
            accept="image/*"
            disabled={uploading}
            className="text-xs"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
            }}
          />
          {uploading && <span className="text-xs text-muted-foreground">جارٍ الرفع…</span>}
          {uploadedUrl && (
            <div className="flex items-center gap-3 rounded-2xl bg-secondary p-3">
              <img src={uploadedUrl.url} alt="" className="size-14 rounded-xl object-cover" />
              <span className="truncate text-xs text-muted-foreground">{uploadedUrl.url}</span>
            </div>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="title">العنوان</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="url">رابط الصورة (اتركه فارغًا عند الرفع)</Label>
          <Input id="url" name="url" placeholder={uploadedUrl?.url ?? "https://…"} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="alt">النص البديل</Label>
          <Input id="alt" name="alt" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="collection">المجموعة</Label>
          <select
            id="collection"
            name="collection"
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          >
            {COLLECTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="country_slug">الدولة المرتبطة (اختياري)</Label>
          <select
            id="country_slug"
            name="country_slug"
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="">— بدون —</option>
            {countries.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.ar}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sort">الترتيب</Label>
          <Input id="sort" name="sort" type="number" defaultValue={0} />
        </div>
        <Button type="submit" variant="hero" className="self-end sm:col-span-2">
          إضافة إلى المكتبة
        </Button>
      </form>

      <div className="mt-8 flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          الكل
        </FilterChip>
        {COLLECTIONS.map((c) => (
          <FilterChip key={c.value} active={filter === c.value} onClick={() => setFilter(c.value)}>
            {c.label}
          </FilterChip>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((m) => (
          <div key={m.id} className="overflow-hidden rounded-3xl border border-border">
            <img
              src={m.url}
              alt={m.alt_text ?? m.title}
              loading="lazy"
              decoding="async"
              className="h-36 w-full object-cover"
            />
            <div className="p-4 text-sm">
              <p className="font-bold">{m.title}</p>
              <p className="text-xs text-muted-foreground">
                {label(m.collection)}
                {m.country_slug ? ` · ${m.country_slug}` : ""} · ترتيب {m.sort_order} ·{" "}
                {m.active ? "ظاهرة" : "مخفية"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => mutate(m.id, { active: !m.active })}>
                  {m.active ? "إخفاء" : "إظهار"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    void navigator.clipboard?.writeText(m.url);
                    toast.success("تم نسخ الرابط");
                  }}
                >
                  نسخ الرابط
                </Button>
                <Button size="sm" variant="outline" onClick={() => remove(m)}>
                  حذف
                </Button>
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">لا توجد وسائط في هذه المجموعة بعد.</p>
        )}
      </div>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors " +
        (active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")
      }
    >
      {children}
    </button>
  );
}
