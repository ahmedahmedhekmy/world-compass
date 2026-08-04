/**
 * Business configuration.
 * These defaults are read from a single place so they can later be served from
 * the admin dashboard (Supabase `pricing_settings` / `site_settings`)
 * without touching UI components.
 */
export const site = {
  name: "Travel Smart Budget",
  nameAr: "سافر بذكاء",
  email: "travelsmartbudget@gmail.com",
  tagline: "اكتشف العالم، واعرف تكلفة رحلتك قبل أن تحجز.",
  guidePriceUSD: 19,
  planningServicePriceUSD: 49,
  currency: "USD",
} as const;

export const formatUSD = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    Math.round(value),
  );
