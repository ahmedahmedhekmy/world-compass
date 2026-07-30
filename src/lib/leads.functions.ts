import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contactSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().max(200).optional(),
  body: z.string().trim().min(5).max(4000),
});

const tripSchema = z.object({
  kind: z.enum(["estimate", "planning"]).default("estimate"),
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(60).optional(),
  nationality: z.string().trim().max(120).optional(),
  departure_country: z.string().trim().max(120).optional(),
  departure_city: z.string().trim().max(120).optional(),
  destination_country: z.string().trim().max(120).optional(),
  destination_city: z.string().trim().max(120).optional(),
  start_date: z.string().trim().max(20).optional(),
  end_date: z.string().trim().max(20).optional(),
  nights: z.number().int().min(1).max(120).optional(),
  adults: z.number().int().min(1).max(20).default(1),
  children: z.number().int().min(0).max(20).default(0),
  children_ages: z.string().trim().max(120).optional(),
  accommodation_level: z.string().trim().max(40).optional(),
  travel_style: z.string().trim().max(40).optional(),
  budget: z.number().min(0).max(1_000_000).optional(),
  visa_help: z.boolean().default(false),
  preferred_contact: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(4000).optional(),
  estimate: z.record(z.unknown()).optional(),
});

const bookingSchema = z.object({
  offer_id: z.string().uuid().optional(),
  offer_title: z.string().trim().max(200).optional(),
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(60).optional(),
  travellers: z.number().int().min(1).max(40).default(1),
  start_date: z.string().trim().max(20).optional(),
  end_date: z.string().trim().max(20).optional(),
  special_requests: z.string().trim().max(2000).optional(),
});

const orderSchema = z.object({
  product_type: z.enum(["guide", "planning"]),
  country_slug: z.string().trim().max(80).optional(),
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  notes: z.string().trim().max(2000).optional(),
});

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => contactSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendAdminEmail } = await import("./notify.server");
    const { error } = await supabaseAdmin.from("messages").insert(data);
    if (error) throw new Error("تعذّر إرسال الرسالة، حاول مرة أخرى.");
    await sendAdminEmail("رسالة جديدة من نموذج التواصل", Object.entries(data));
    return { ok: true };
  });

export const submitTripRequest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => tripSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendAdminEmail, sendCustomerEmail } = await import("./notify.server");
    const { data: row, error } = await supabaseAdmin
      .from("trip_requests")
      .insert(data as never)
      .select("id")
      .single();
    if (error) throw new Error("تعذّر إرسال الطلب، حاول مرة أخرى.");
    await sendAdminEmail(
      data.kind === "planning" ? "طلب تخطيط رحلة جديد" : "طلب تقدير ميزانية جديد",
      Object.entries(data),
    );
    await sendCustomerEmail(
      data.email,
      "استلمنا طلبك | Travel Smart Budget",
      `<p>مرحبًا ${data.full_name}،</p><p>استلمنا طلبك وسنتواصل معك قريبًا. جميع الأرقام المقدّمة تقديرية وليست نهائية.</p>`,
    );
    return { ok: true, id: row?.id as string };
  });

export const submitBookingRequest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => bookingSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendAdminEmail, sendCustomerEmail } = await import("./notify.server");
    const { error } = await supabaseAdmin.from("booking_requests").insert(data as never);
    if (error) throw new Error("تعذّر إرسال طلب الحجز، حاول مرة أخرى.");
    await sendAdminEmail("طلب حجز جديد", Object.entries(data));
    await sendCustomerEmail(
      data.email,
      "استلمنا طلب الحجز | Travel Smart Budget",
      `<p>مرحبًا ${data.full_name}، استلمنا طلب الحجز الخاص بك وسنعود إليك بالتفاصيل.</p>`,
    );
    return { ok: true };
  });

/** Creates a pending order with a server-side price — the client never sends the amount. */
export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => orderSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendAdminEmail, sendCustomerEmail } = await import("./notify.server");

    const { data: pricingRow } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", "pricing")
      .maybeSingle();
    const pricing = (pricingRow?.value ?? {}) as {
      guidePriceUSD?: number;
      planningStartFeeUSD?: number;
    };

    let amount =
      data.product_type === "guide" ? (pricing.guidePriceUSD ?? 19) : (pricing.planningStartFeeUSD ?? 49);

    if (data.product_type === "guide" && data.country_slug) {
      const { data: guide } = await supabaseAdmin
        .from("guides")
        .select("price_usd")
        .eq("country_slug", data.country_slug)
        .maybeSingle();
      if (guide?.price_usd) amount = Number(guide.price_usd);
    }

    const reference = `TSB-${data.product_type === "guide" ? "GUIDE" : "PLAN"}-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`;

    const { error } = await supabaseAdmin.from("orders").insert({
      reference,
      email: data.email,
      full_name: data.full_name,
      product_type: data.product_type,
      country_slug: data.country_slug ?? null,
      amount_usd: amount,
      status: "pending",
      admin_notes: data.notes ?? null,
    } as never);
    if (error) throw new Error("تعذّر إنشاء الطلب، حاول مرة أخرى.");

    await sendAdminEmail("طلب شراء جديد", [
      ["رقم الطلب", reference],
      ...Object.entries(data),
      ["المبلغ", `${amount} USD`],
    ]);
    await sendCustomerEmail(
      data.email,
      `تأكيد الطلب ${reference} | Travel Smart Budget`,
      `<p>مرحبًا ${data.full_name}،</p><p>تم إنشاء طلبك برقم <b>${reference}</b> بقيمة ${amount} دولارًا.</p><p>سنرسل لك تعليمات إتمام الدفع خلال وقت قصير.</p>`,
    );

    return { ok: true, reference, amount };
  });
