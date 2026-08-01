import { useRouterState } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/lib/site-settings";
import { track } from "@/components/analytics-tracker";

/** Floating WhatsApp contact button. Number is managed from the dashboard. */
export function WhatsAppButton() {
  const { contact } = useSiteSettings();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const raw = (contact.whatsapp ?? "").replace(/[^\d]/g, "");
  if (!raw || pathname.startsWith("/admin")) return null;

  return (
    <a
      href={`https://wa.me/${raw}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("whatsapp_click")}
      aria-label="تواصل معنا عبر واتساب"
      className="fixed bottom-5 end-5 z-40 inline-flex size-13 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 print:hidden"
      style={{ width: "3.25rem", height: "3.25rem" }}
    >
      <MessageCircle className="size-6" aria-hidden />
    </a>
  );
}
