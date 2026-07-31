import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/media")({
  component: AdminMedia,
});

const COLLECTIONS = ["gallery", "hero", "continent", "country", "offer"] as const;

function AdminMedia() {
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["admin-media"],
    queryFn: async () => {
      const { data } = await supabase
        .from("media_assets")
        .select("id, title, alt_text, url, collection, sort_order, active")
        .order("collection")
        .order("sort_order");
      return data ?? [];
    },
  });

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const { error } = await supabase.from("media_assets").insert({
      title: String(fd.get("title")),
      alt_text: String(fd.get("alt") ?? "") || null,
      url: String(fd.get("url")),
      collection: String(fd.get("collection")),
      sort_order: Number(fd.get("sort")) || 0,
    } as never);
    if (error) return toast.error("تعذّرت الإضافة");
    toast.success("تمت إضافة الوسائط");
    form.reset();
    qc.invalidateQueries({ queryKey: ["admin-media"] });
  }

  async function mutate(id: string, patch: Record<string, unknown>) {
    const { error } = await supabase.from("media_assets").update(patch as never).eq("id", id);
    if (error) return toast.error("تعذّر التحديث");
    qc.invalidateQueries({ queryKey: ["admin-media"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("media_assets").delete().eq("id", id);
    if (error) return toast.error("تعذّر الحذف");
    qc.invalidateQueries({ queryKey: ["admin-media"] });
  }

  return (
    <>
      <h1 className="text-2xl font-extrabold">إدارة الوسائط</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        صور معرض الإلهام والأغلفة المستخدمة في الصفحات العامة.
      </p>

      <form onSubmit={add} className="mt-6 grid gap-4 rounded-3xl border border-border p-6 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="title">العنوان</Label>
          <Input id="title" name="title" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="url">رابط الصورة</Label>
          <Input id="url" name="url" required />
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
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sort">الترتيب</Label>
          <Input id="sort" name="sort" type="number" defaultValue={0} />
        </div>
        <Button type="submit" variant="hero" className="self-end">
          إضافة
        </Button>
      </form>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((m) => (
          <div key={m.id} className="overflow-hidden rounded-3xl border border-border">
            <img src={m.url} alt={m.alt_text ?? m.title} loading="lazy" className="h-36 w-full object-cover" />
            <div className="p-4 text-sm">
              <p className="font-bold">{m.title}</p>
              <p className="text-xs text-muted-foreground">
                {m.collection} · ترتيب {m.sort_order} · {m.active ? "ظاهرة" : "مخفية"}
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => mutate(m.id, { active: !m.active })}>
                  {m.active ? "إخفاء" : "إظهار"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => remove(m.id)}>
                  حذف
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
