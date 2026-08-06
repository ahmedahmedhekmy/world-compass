import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "تعيين كلمة مرور جديدة | Travel Smart Budget" },
      { name: "description", content: "اختر كلمة مرور جديدة لحسابك في Travel Smart Budget." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "تعيين كلمة مرور جديدة" },
      { property: "og:description", content: "اختر كلمة مرور جديدة لحسابك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    // Supabase puts the recovery session in the URL hash; getSession resolves it.
    supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("تم تحديث كلمة المرور");
      navigate({ to: "/account" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذّر تحديث كلمة المرور");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container-page max-w-md py-16">
      <h1 className="text-2xl font-extrabold">تعيين كلمة مرور جديدة</h1>
      {ready === false ? (
        <p className="mt-4 text-sm text-muted-foreground">
          هذا الرابط غير صالح أو انتهت صلاحيته. اطلب رابط استعادة جديدًا من صفحة تسجيل الدخول.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="pw">كلمة المرور الجديدة</Label>
            <Input
              id="pw"
              type="password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pw2">تأكيد كلمة المرور</Label>
            <Input
              id="pw2"
              type="password"
              minLength={8}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <Button type="submit" variant="hero" disabled={busy || ready === null}>
            {busy ? "جارٍ الحفظ…" : "حفظ كلمة المرور"}
          </Button>
        </form>
      )}
    </section>
  );
}
