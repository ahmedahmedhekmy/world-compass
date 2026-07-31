import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const slugSchema = z.object({ slug: z.string().trim().min(2).max(80) });

export interface GuidePreview {
  exists: boolean;
  title: string | null;
  summary: string | null;
  preview_text: string | null;
  cover_image_url: string | null;
  price_usd: number | null;
  last_updated: string | null;
  has_pdf: boolean;
  chapter_titles: string[];
}

/** Public, safe metadata about a guide. Paid body content never leaves the server here. */
export const getGuidePreview = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => slugSchema.parse(d))
  .handler(async ({ data }): Promise<GuidePreview> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("guides")
      .select("title, summary, preview_text, cover_image_url, price_usd, last_updated, pdf_url, sections, published")
      .eq("country_slug", data.slug)
      .eq("published", true)
      .maybeSingle();

    if (!row) {
      return {
        exists: false,
        title: null,
        summary: null,
        preview_text: null,
        cover_image_url: null,
        price_usd: null,
        last_updated: null,
        has_pdf: false,
        chapter_titles: [],
      };
    }

    const sections = Array.isArray(row.sections) ? (row.sections as { title?: string }[]) : [];
    return {
      exists: true,
      title: row.title,
      summary: row.summary,
      preview_text: row.preview_text ?? null,
      cover_image_url: row.cover_image_url,
      price_usd: row.price_usd === null ? null : Number(row.price_usd),
      last_updated: row.last_updated,
      has_pdf: Boolean(row.pdf_url),
      chapter_titles: sections.map((s) => String(s?.title ?? "")).filter(Boolean),
    };
  });

export interface OwnedGuide {
  owned: boolean;
  title: string | null;
  last_updated: string | null;
  sections: { title: string; body: string }[];
  pdf_url: string | null;
}

/** Full guide content — only returned when the signed-in user has a paid order for it. */
export const getOwnedGuide = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => slugSchema.parse(d))
  .handler(async ({ data, context }): Promise<OwnedGuide> => {
    const empty: OwnedGuide = { owned: false, title: null, last_updated: null, sections: [], pdf_url: null };

    const { data: order } = await context.supabase
      .from("orders")
      .select("id")
      .eq("user_id", context.userId)
      .eq("country_slug", data.slug)
      .eq("product_type", "guide")
      .eq("status", "paid")
      .maybeSingle();
    if (!order) return empty;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: guide } = await supabaseAdmin
      .from("guides")
      .select("title, sections, pdf_url, last_updated, published")
      .eq("country_slug", data.slug)
      .maybeSingle();
    if (!guide || !guide.published) return empty;

    let pdfUrl: string | null = null;
    if (guide.pdf_url) {
      if (/^https?:\/\//.test(guide.pdf_url)) {
        pdfUrl = guide.pdf_url;
      } else {
        const { data: signed } = await supabaseAdmin.storage
          .from("guides")
          .createSignedUrl(guide.pdf_url, 60 * 30);
        pdfUrl = signed?.signedUrl ?? null;
      }
    }

    const sections = Array.isArray(guide.sections) ? (guide.sections as { title?: string; body?: string }[]) : [];
    return {
      owned: true,
      title: guide.title,
      last_updated: guide.last_updated,
      pdf_url: pdfUrl,
      sections: sections.map((s) => ({ title: String(s?.title ?? ""), body: String(s?.body ?? "") })),
    };
  });
