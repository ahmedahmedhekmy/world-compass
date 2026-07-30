import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const eventSchema = z.object({
  event: z.string().trim().min(1).max(60),
  path: z.string().trim().max(300).optional(),
  country_slug: z.string().trim().max(80).optional(),
  referrer_source: z.string().trim().max(200).optional(),
  device_type: z.string().trim().max(20).optional(),
  language: z.string().trim().max(20).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const trackEvent = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => eventSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("analytics_events").insert(data as never);
    return { ok: true };
  });
