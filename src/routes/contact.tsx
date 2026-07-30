import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactMessage } from "@/lib/leads.functions";
import { useSiteSettings } from "@/lib/site-settings";
import { site } from "@/config/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا | Travel Smart Budget" },
      {
        name: "description",
        content: `تواصل مع فريق Travel Smart Budget عبر النموذج أو البريد ${site.email} للاستفسار عن الأدلة أو خدمة التخطيط.`,
      },
      { property: "og:title", content: "تواصل معنا | Travel Smart Budget" },
      { property: "og:description", content: "نحن هنا للإجابة عن أسئلتك حول رحلتك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const send = useServerFn(submitContactMessage);
  const { contact } = useSiteSettings();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await send({
        data: {
          full_name: String(fd.get("full_name") ?? ""),
          email: String(fd.get("email") ?? ""),
          subject: String(fd.get("subject") ?? "") || undefined,
          body: String(fd.get("body") ?? ""),
        },
      });
      setDone(true);
      toast.success("وصلتنا رسالتك، سنرد عليك قريبًا.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذّر الإرسال");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container-page max-w-3xl py-16">
      <h1 className="text-3xl font-black">تواصل معنا</h1>
      <p className="mt-4 text-sm leading-8 text-muted-foreground">
        أرسل رسالتك من النموذج مباشرة، أو راسلنا على البريد. نرد عادةً خلال 24–48 ساعة عمل.
      </p>

      {done ? (
        <div className="mt-8 rounded-3xl bg-secondary p-6 text-sm leading-7">
          شكرًا لتواصلك. استلمنا رسالتك وسنعود إليك على بريدك الإلكتروني.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 grid gap-4 rounded-3xl border border-border p-6 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="full_name">الاسم الكامل</Label>
            <Input id="full_name" name="full_name" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="subject">الموضوع</Label>
            <Input id="subject" name="subject" />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="body">رسالتك</Label>
            <Textarea id="body" name="body" rows={5} required />
          </div>
          <Button type="submit" variant="hero" disabled={busy} className="w-fit sm:col-span-2">
            {busy ? "جارٍ الإرسال…" : "إرسال الرسالة"}
          </Button>
        </form>
      )}

      <div className="mt-8 rounded-3xl border border-border p-6">
        <p className="text-sm text-muted-foreground">البريد الرسمي</p>
        <p className="mt-1 text-lg font-extrabold">{contact.email}</p>
        <Button asChild variant="outline" className="mt-5">
          <a href={`mailto:${contact.email}`}>
            <Mail className="size-4" /> راسلنا بالبريد
          </a>
        </Button>
      </div>
    </section>
  );
}
