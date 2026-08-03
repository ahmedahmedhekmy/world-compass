import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "cookie_consent";

interface CookieConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [preferences, setPreferences] = useState<CookieConsentState | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      // Show banner after a short delay to not interrupt initial page load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    } else {
      try {
        setPreferences(JSON.parse(stored));
      } catch {
        setVisible(true);
      }
    }
  }, []);

  const acceptAll = () => {
    const consent: CookieConsentState = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    setPreferences(consent);
    setVisible(false);
    applyAnalyticsConsent(true);
  };

  const acceptNecessary = () => {
    const consent: CookieConsentState = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    setPreferences(consent);
    setVisible(false);
    applyAnalyticsConsent(false);
  };

  const applyAnalyticsConsent = (enabled: boolean) => {
    // Enable/disable analytics based on consent
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", enabled ? "grant" : "deny");
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6"
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-description"
    >
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-background p-6 shadow-2xl">
        <button
          onClick={acceptNecessary}
          className="absolute end-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-secondary"
          aria-label="إغلاق"
        >
          <X className="size-4" />
        </button>

        <h2 id="cookie-title" className="text-lg font-bold">ملفات تعريف الارتباط</h2>
        <p id="cookie-description" className="mt-2 text-sm text-muted-foreground">
          نستخدم ملفات تعريف الارتباط لتحسين تجربتك. يمكنك اختيار قبول جميع ملفات تعريف الارتباط أو
          فقط الضرورية منها.
        </p>

        <div className="mt-4 grid gap-3 text-sm">
          <div className="flex items-center gap-3 rounded-2xl bg-secondary p-3">
            <input type="checkbox" id="necessary" checked disabled className="size-4" />
            <label htmlFor="necessary" className="flex-1">
              <span className="font-semibold">ضروري</span>
              <p className="text-xs text-muted-foreground">ضرورية للتشغيل الصحيح للموقع</p>
            </label>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-secondary p-3">
            <input type="checkbox" id="analytics" checked disabled className="size-4" />
            <label htmlFor="analytics" className="flex-1">
              <span className="font-semibold">تحليلات</span>
              <p className="text-xs text-muted-foreground">تساعدنا على فهم كيفية استخدام الموقع</p>
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={acceptAll} variant="hero" size="sm">
            قبول الكل
          </Button>
          <Button onClick={acceptNecessary} variant="outline" size="sm">
            رفض غير الضروري
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          اقرأ{" "}
          <a href="/privacy" className="underline">
            سياسة الخصوصية
          </a>{" "}
          لمزيد من المعلومات.
        </p>
      </div>
    </div>
  );
}

// Extend window interface for analytics
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
