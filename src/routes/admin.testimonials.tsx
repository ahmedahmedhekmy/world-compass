import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/testimonials")({
  component: AdminTestimonials,
});

interface Row {
  id: string;
  name: string;
  country: string | null;
  rating: number;
  comment: string;
  photo_url: string | null;
  published: boolean;
  is_demo: boolean;
  sort_order: number;
}

function AdminTestimonials() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("*")
        .order("sort_order", { ascending: true });
      return (data ?? []) as Row[];
    },
  });

  function refresh() {
    qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
    qc.invalidateQueries({ queryKey: ["testimonials"] });
  }

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const { error } = await supabase.from("testimonials").insert({
      name: String(fd.get("name")),
      country: String(fd.get("country") ?? ""),
      rating: Number(fd.get("rating")) || 5,
      comment: String(fd.get("comment")),
      photo_url: String(fd.get("photo_url") ?? "") || null,
      sort_order: Number(fd.get("sort_order")) || 0,
      published: true,
      is_demo: false,
    });
    if (error) return toast.error("تعذّر إضافة الرأي");
    toast.success("تمت إضافة الرأي");
    form.reset();
    refresh();
  }

  async function update(id: string, patch: Partial<Row>) {
    const { error } = await supabase.from("testimonials").update(patch as never).eq("id", id);
    if (error) return toast.error("تعذّر التحديث");
    refresh();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) return toast.error("تعذّر الحذف");
    toast.success("تم الحذف");
    refresh();
  }

  return (
    <>
      <h1 className="text-2xl font-extrabold">آراء العملاء</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        الآراء المعلّمة كنموذج توضيحي تظهر للزوار مع إشارة واضحة. احذفها بعد إضافة آراء حقيقية.
      </p>

      <form onSubmit={add} className="mt-6 grid gap-4 rounded-3xl border border-border p-6 sm:grid-cols-2">
        <h2 className="text-lg font-bold sm:col-span-2">إضافة رأي جديد</h2>
        <div className="grid gap-2">
          <Label htmlFor="name">الاسم</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="country">الدولة</Label>
          <Input id="country" name="country" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="rating">التقييم (1-5)</Label>
          <Input id="rating" name="rating" type="number" min={1} max={5} defaultValue={5} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sort_order">الترتيب</Label>
          <Input id="sort_order" name="sort_order" type="number" defaultValue={0} />
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="photo_url">رابط الصورة</Label>
          <Input id="photo_url" name="photo_url" placeholder="https://" />
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="comment">التعليق</Label>
          <Textarea id="comment" name="comment" rows={3} required />
        </div>
        <Button type="submit" variant="hero" className="w-fit sm:col-span-2">
          إضافة
        </Button>
      </form>

      <div className="mt-8 grid gap-4">
        {(data ?? []).map((t) => (
          <article key={t.id} className="rounded-3xl border border-border p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">
                  {t.name}
                  {t.country ? ` · ${t.country}` : ""}
                  {t.is_demo && (
                    <span className="ms-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-normal text-muted-foreground">
                      نموذج توضيحي
                    </span>
                  )}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">التقييم: {t.rating}/5</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={t.published ? "outline" : "hero"}
                  onClick={() => update(t.id, { published: !t.published })}
                >
                  {t.published ? "إخفاء" : "نشر"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => remove(t.id)}>
                  حذف
                </Button>
              </div>
            </div>
            <Textarea
              className="mt-3"
              defaultValue={t.comment}
              rows={3}
              onBlur={(e) => {
                if (e.target.value !== t.comment) update(t.id, { comment: e.target.value });
              }}
            />
          </article>
        ))}
        {(data ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">لا توجد آراء بعد.</p>
        )}
      </div>
    </>
  );
}
