import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "حسابك | Travel Smart Budget" },
      { name: "description", content: "سجّل الدخول أو أنشئ حسابًا للوصول إلى أدلتك وطلباتك." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "حسابك في Travel Smart Budget" },
      { property: "og:description", content: "الدخول إلى الأدلة المشتراة وطلباتك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("تم تسجيل الدخول");
        navigate({ to: "/account" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("أنشئنا حسابك. تفقّد بريدك لتأكيد التسجيل.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذّر إتمام العملية");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container-page max-w-md py-16">
      <h1 className="text-2xl font-extrabold">
        {mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        حسابك يمنحك الوصول إلى الأدلة التي اشتريتها ومتابعة طلباتك.
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        {mode === "signup" && (
          <div className="grid gap-2">
            <Label htmlFor="name">الاسم الكامل</Label>
            <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">كلمة المرور</Label>
          <Input
            id="password"
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" variant="hero" disabled={busy}>
          {busy ? "جارٍ..." : mode === "signin" ? "دخول" : "إنشاء الحساب"}
        </Button>
      </form>

      <button
        type="button"
        className="mt-4 text-sm text-primary underline"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin" ? "ليس لديك حساب؟ أنشئ حسابًا" : "لديك حساب؟ سجّل الدخول"}
      </button>

      <p className="mt-6 text-xs text-muted-foreground">
        بالمتابعة أنت توافق على{" "}
        <Link to="/terms" className="underline">
          الشروط والأحكام
        </Link>{" "}
        و
        <Link to="/privacy" className="underline">
          سياسة الخصوصية
        </Link>
        .
      </p>
    </section>
  );
}
