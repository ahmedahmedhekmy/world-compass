import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { trackEvent } from "@/lib/analytics.functions";

function referrerSource(): string {
  if (typeof document === "undefined") return "direct";
  const params = new URLSearchParams(window.location.search);
  const utm = params.get("utm_source");
  if (utm) return utm.slice(0, 60);
  const ref = document.referrer;
  if (!ref) return "direct";
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "");
    if (host === window.location.hostname) return "internal";
    if (/google\./.test(host)) return "google";
    if (/bing\./.test(host)) return "bing";
    if (/(facebook|instagram|tiktok|x\.com|twitter|youtube|snapchat|linkedin)/.test(host)) return "social";
    return host.slice(0, 60);
  } catch {
    return "direct";
  }
}

function deviceType(): string {
  if (typeof window === "undefined") return "unknown";
  const w = window.innerWidth;
  return w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
}

/** Fires one page_view event per navigation. Failures are silent by design. */
export function AnalyticsTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (last.current === pathname) return;
    last.current = pathname;
    if (pathname.startsWith("/admin")) return;

    const countryMatch = pathname.match(/^\/(?:countries|guides|library)\/([^/]+)/);

    void trackEvent({
      data: {
        event: "page_view",
        path: pathname.slice(0, 300),
        country_slug: countryMatch?.[1],
        referrer_source: referrerSource(),
        device_type: deviceType(),
        language: document.documentElement.lang || "ar",
      },
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}

/** Explicit conversion / interaction events. */
export function track(event: string, extra: Record<string, unknown> = {}, countrySlug?: string) {
  if (typeof window === "undefined") return;
  void trackEvent({
    data: {
      event: event.slice(0, 60),
      path: window.location.pathname.slice(0, 300),
      country_slug: countrySlug,
      referrer_source: referrerSource(),
      device_type: deviceType(),
      language: document.documentElement.lang || "ar",
      metadata: extra,
    },
  }).catch(() => undefined);
}
