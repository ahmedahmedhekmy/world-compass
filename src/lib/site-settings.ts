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

const defaults: { pricing: Pricing; contact: ContactSettings } = {
  pricing: {
    guidePriceUSD: site.guidePriceUSD,
    planningStartFeeUSD: site.planningServicePriceUSD,
    currency: site.currency,
  },
  contact: { email: site.email },
};

export const settingsQueryOptions = {
  queryKey: ["settings"],
  staleTime: 60_000,
  queryFn: async () => {
    const { data } = await supabase.from("settings").select("key, value");
    const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<string, unknown>;
    return {
      pricing: { ...defaults.pricing, ...((map.pricing as Partial<Pricing>) ?? {}) },
      contact: { ...defaults.contact, ...((map.contact as Partial<ContactSettings>) ?? {}) },
    };
  },
};

/** Prices and contact details are always read from the admin-editable settings. */
export function useSiteSettings() {
  const { data } = useQuery(settingsQueryOptions);
  return data ?? defaults;
}
