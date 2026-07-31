import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeNewsletter } from "@/lib/content.functions";
import { useLang } from "@/lib/i18n";
import { track } from "@/components/analytics-tracker";

export function NewsletterForm({ source = "homepage" }: { source?: string }) {
  const { t, lang } = useLang();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (done) {
    return <p className="text-sm font-semibold">{t("news.done")}</p>;
  }

  return (
    <form
      className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await subscribeNewsletter({ data: { email, language: lang, source } });
          track("newsletter_subscribe", { source });
          setDone(true);
        } catch {
          toast.error(t("news.error"));
        } finally {
          setBusy(false);
        }
      }}
    >
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("news.placeholder")}
        aria-label={t("news.placeholder")}
        className="h-12 rounded-full bg-background"
      />
      <Button type="submit" variant="sand" size="lg" disabled={busy} className="shrink-0">
        {busy ? "..." : t("news.submit")}
      </Button>
    </form>
  );
}
