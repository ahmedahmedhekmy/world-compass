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
    console.log('[Leads] submitContactMessage called with:', data);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendAdminEmail } = await import("./notify.server");
    const { error } = await supabaseAdmin.from("messages").insert(data);
    console.log('[Leads] messages insert result:', error ? { error: error.message, details: error.details, hint: error.hint } : 'success');
    if (error) {
      console.error('[Leads] Failed to insert message:', error);
      throw new Error("تعذّر إرسال الرسالة، حاول مرة أخرى.");
    }
    await sendAdminEmail("رسالة جديدة من نموذج التواصل", Object.entries(data));
    return { ok: true };
  });

export const submitTripRequest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => tripSchema.parse(d))
  .handler(async ({ data }) => {
    console.log('[Leads] submitTripRequest called with:', data);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendAdminEmail, sendCustomerEmail } = await import("./notify.server");
    const { data: row, error } = await supabaseAdmin
      .from("trip_requests")
      .insert(data as never)
      .select("id")
      .single();
    console.log('[Leads] trip_requests insert result:', error ? { error: error.message, details: error.details, hint: error.hint } : 'success');
    if (error) {
      console.error('[Leads] Failed to insert trip request:', error);
      throw new Error("تعذّر إرسال الطلب، حاول مرة أخرى.");
    }
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
    console.log('[Leads] submitBookingRequest called with:', data);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendAdminEmail, sendCustomerEmail } = await import("./notify.server");
    const { error } = await supabaseAdmin.from("booking_requests").insert(data as never);
    console.log('[Leads] booking_requests insert result:', error ? { error: error.message, details: error.details, hint: error.hint } : 'success');
    if (error) {
      console.error('[Leads] Failed to insert booking request:', error);
      throw new Error("تعذّر إرسال طلب الحجز، حاول مرة أخرى.");
    }
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
    console.log('[Leads] createOrder called with:', data);
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
    let countryName: string | undefined;

    if (data.product_type === "guide" && data.country_slug) {
      const { data: guide } = await supabaseAdmin
        .from("guides")
        .select("price_usd, title")
        .eq("country_slug", data.country_slug)
        .maybeSingle();
      if (guide?.price_usd) amount = Number(guide.price_usd);
      if (guide?.title) countryName = guide.title.replace("دليل السفر إلى ", "");
    }

    const reference = `TSB-${data.product_type === "guide" ? "GUIDE" : "PLAN"}-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`;

    // Attach the buyer's account when the request carries a valid session, so the
    // purchased guide unlocks in their library.
    let userId: string | null = null;
    try {
      const { getRequest } = await import("@tanstack/react-start/server");
      const authHeader = getRequest().headers.get("authorization") ?? "";
      const token = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7) : "";
      if (token) {
        const { data: userData } = await supabaseAdmin.auth.getUser(token);
        userId = userData.user?.id ?? null;
      }
    } catch {
      userId = null;
    }

    console.log('[Leads] Creating order with reference:', reference);
    const { error } = await supabaseAdmin.from("orders").insert({
      reference,
      user_id: userId,
      email: data.email,
      full_name: data.full_name,
      product_type: data.product_type,
      country_slug: data.country_slug ?? null,
      amount_usd: amount,
      status: "pending",
      admin_notes: data.notes ?? null,
      stripe_session_id: null,
      paid_at: null,
      currency: "USD",
    });
    console.log('[Leads] orders insert result:', error ? { error: error.message, details: error.details, hint: error.hint } : 'success');
    if (error) {
      console.error('[Leads] Failed to create order:', error);
      throw new Error("تعذّر إنشاء الطلب، حاول مرة أخرى.");
    }

    // Try to create Stripe checkout session if configured
    let checkoutUrl: string | null = null;
    try {
      const { createCheckoutSession, isStripeConfigured } = await import("./stripe.server");
      if (isStripeConfigured()) {
        const session = await createCheckoutSession({
          productType: data.product_type,
          countrySlug: data.country_slug,
          countryName,
          price: amount,
          customerEmail: data.email,
          reference,
        });
        if (session) {
          checkoutUrl = session.url;
          // Update order with stripe session ID
          await supabaseAdmin
            .from("orders")
            .update({ stripe_session_id: session.sessionId })
            .eq("reference", reference);
        }
      }
    } catch (err) {
      // Log but don't fail - order is created, payment is optional
      console.error("[Stripe] Failed to create checkout session:", err);
    }

    await sendAdminEmail("طلب شراء جديد", [
      ["رقم الطلب", reference],
      ["البريد", data.email],
      ["المنتج", data.product_type],
      ...(data.country_slug ? ([["الدولة", data.country_slug]] as [string, unknown][]) : []),
      ["المبلغ", `${amount} USD`],
      ...(checkoutUrl ? ([["رابط الدفع", checkoutUrl]] as [string, unknown][]) : []),
    ]);
    const customerEmail = await sendCustomerEmail(
      data.email,
      `تأكيد الطلب ${reference} | Travel Smart Budget`,
      `<p>مرحبًا ${data.full_name}،</p><p>تم إنشاء طلبك برقم <b>${reference}</b> بقيمة ${amount} دولارًا.</p>${checkoutUrl ? `<p>أكمل الدفع من هنا: <a href="${checkoutUrl}">الدفع الآن</a></p>` : "<p>سنرسل لك تعليمات إتمام الدفع خلال وقت قصير.</p>"}`,
    );

    return {
      ok: true,
      reference,
      amount,
      checkoutUrl,
      emailSent: Boolean(customerEmail.sent),
      paymentMode: checkoutUrl ? ("stripe" as const) : ("manual" as const),
    };
  });
