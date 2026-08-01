import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { site } from "@/config/site";

export interface Pricing {
  guidePriceUSD: number;
  planningStartFeeUSD: number;
  currency: string;
}

export interface ContactSettings {
  email: string;
  whatsapp?: string;
  telegram?: string;
}

export interface TrustSettings {
  badges: string[];
}

export interface ComparisonRow {
  without: string;
  with: string;
}

export interface ComparisonSettings {
  rows: ComparisonRow[];
}

export interface HomepageSettings {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string;
  heroVideoUrl?: string;
  featuredSlugs?: string[];
}

export interface SiteSettings {
  pricing: Pricing;
  contact: ContactSettings;
  trust: TrustSettings;
  comparison: ComparisonSettings;
  homepage: HomepageSettings;
}

const defaults: SiteSettings = {
  pricing: {
    guidePriceUSD: site.guidePriceUSD,
    planningStartFeeUSD: site.planningServicePriceUSD,
    currency: site.currency,
  },
  contact: { email: site.email },
  trust: {
    badges: [
      "دفع آمن",
      "تسعير شفاف",
      "معلومات سفر محدّثة",
      "متوافق مع الجوال",
      "تخطيط سفر احترافي",
      "إرشادات عملية",
    ],
  },
  comparison: {
    rows: [
      { without: "البحث في مواقع كثيرة", with: "كل شيء منظّم في مكان واحد" },
      { without: "تكاليف غير واضحة", with: "تقدير كامل لتكلفة الرحلة" },
      { without: "معلومات مبعثرة", with: "تحضير سفر مرتّب خطوة بخطوة" },
      { without: "تخطيط مربك", with: "تخطيط احترافي متسلسل" },
    ],
  },
  homepage: {},
};

export const settingsQueryOptions = {
  queryKey: ["settings"],
  staleTime: 60_000,
  queryFn: async (): Promise<SiteSettings> => {
    const { data } = await supabase.from("settings").select("key, value");
    const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<
      string,
      unknown
    >;
    const trust = (map.trust as Partial<TrustSettings>) ?? {};
    const comparison = (map.comparison as Partial<ComparisonSettings>) ?? {};
    return {
      pricing: { ...defaults.pricing, ...((map.pricing as Partial<Pricing>) ?? {}) },
      contact: { ...defaults.contact, ...((map.contact as Partial<ContactSettings>) ?? {}) },
      trust: { badges: trust.badges?.length ? trust.badges : defaults.trust.badges },
      comparison: {
        rows: comparison.rows?.length ? comparison.rows : defaults.comparison.rows,
      },
      homepage: { ...defaults.homepage, ...((map.homepage as HomepageSettings) ?? {}) },
    };
  },
};

/** Prices, contact details and editable homepage copy always come from admin settings. */
export function useSiteSettings(): SiteSettings {
  const { data } = useQuery(settingsQueryOptions);
  return data ?? defaults;
}
