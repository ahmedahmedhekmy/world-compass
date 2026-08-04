import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const subscribeSchema = z.object({
  email: z.string().trim().email().max(200),
  language: z.string().trim().max(10).default("ar"),
  source: z.string().trim().max(80).optional(),
});

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => subscribeSchema.parse(d))
  .handler(async ({ data }) => {
    console.log('[Content] subscribeNewsletter called with:', data);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .upsert(
        { email: data.email.toLowerCase(), language: data.language, source: data.source ?? null },
        { onConflict: "email" },
      );
    console.log('[Content] newsletter_subscribers upsert result:', error ? { error: error.message, details: error.details, hint: error.hint } : 'success');
    if (error) {
      console.error('[Content] Failed to subscribe:', error);
      throw new Error("تعذّر الاشتراك، حاول مرة أخرى.");
    }
    return { ok: true };
  });

/** Admin-only: pushes the built-in country catalog into the editable countries table. */
export const syncCountryCatalog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: role } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("غير مصرح");

    const { countries } = await import("@/data/countries");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const rows = countries.map((c) => ({
      slug: c.slug,
      name_ar: c.ar,
      name_en: c.en,
      native_name: c.native ?? null,
      iso_code: c.iso2,
      flag: c.flag,
      continent: c.continent,
      region: c.region,
      capital: c.capital,
      currency: c.currency,
      languages: c.languages,
      content: {
        tagline: c.tagline,
        overview: c.overview,
        bestTime: c.bestTime,
        weather: c.weather,
        visa: c.visa,
        cities: c.cities,
        attractions: c.attractions,
        tier: c.tier,
        popular: Boolean(c.popular),
        guideAvailable: c.guideAvailable,
      },
      seo_title: `${c.ar} ${c.flag} | دليل السفر والمعلومات المجانية`,
      seo_description: c.tagline,
      published: true,
    }));

    const { error } = await supabaseAdmin.from("countries").upsert(rows as never, { onConflict: "slug" });
    if (error) throw new Error(error.message);
    return { ok: true, count: rows.length };
  });
