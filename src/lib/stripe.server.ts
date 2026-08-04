/**
 * Stripe payment integration for processing guide and planning service payments.
 * 
 * SETUP REQUIRED:
 * 1. Create Stripe account at https://stripe.com
 * 2. Get API keys from https://dashboard.stripe.com/apikeys
 * 3. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in environment
 * 4. Configure webhook endpoint in Stripe dashboard pointing to /api/stripe/webhook
 */

import Stripe from "stripe";

// Env injection happens at request time, so the key must be read lazily.
let _stripe: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (_stripe === undefined) {
    const key = process.env.STRIPE_SECRET_KEY;
    _stripe = key ? new Stripe(key) : null;
  }
  return _stripe;
}


/**
 * Check if Stripe is properly configured with API keys.
 */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

export interface CreateCheckoutSessionParams {
  productType: "guide" | "planning";
  countrySlug?: string;
  countryName?: string;
  price: number;
  customerEmail?: string;
  reference: string;
}

/**
 * Creates a Stripe Checkout session for guide or planning purchase.
 */
export async function createCheckoutSession({
  productType,
  countrySlug,
  countryName,
  price,
  customerEmail,
  reference,
}: CreateCheckoutSessionParams): Promise<{ url: string; sessionId: string } | null> {
  if (!stripe) {
    console.warn("[Stripe] Not configured - set STRIPE_SECRET_KEY environment variable");
    return null;
  }

  const siteUrl = process.env.PUBLIC_SITE_URL ?? "http://localhost:5173";
  
  const productName =
    productType === "guide"
      ? `دليل السفر إلى ${countryName ?? countrySlug ?? "الدولة"}`
      : "خدمة تخطيط رحلة مخصصة";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: productName,
            description: `رقم الطلب: ${reference}`,
          },
          unit_amount: Math.round(price * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      product_type: productType,
      country_slug: countrySlug ?? "",
      reference,
    },
    success_url: `${siteUrl}/account?payment=success&ref=${reference}`,
    cancel_url: `${siteUrl}/checkout?product=${productType}&country=${countrySlug}&cancelled=true`,
  });

  return { url: session.url!, sessionId: session.id };
}

/**
 * Verifies and processes Stripe webhook events.
 * Handles checkout.session.completed to mark orders as paid.
 */
export async function handleStripeWebhook(
  payload: string,
  signature: string
): Promise<{ success: boolean; message: string }> {
  if (!stripe) {
    return { success: false, message: "Stripe not configured" };
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return { success: false, message: "Webhook secret not configured" };
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("[Stripe] Webhook signature verification failed:", err);
    return { success: false, message: "Invalid signature" };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(session);
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`[Stripe] Payment failed: ${paymentIntent.id}`);
      break;
    }
    default:
      console.log(`[Stripe] Unhandled event type: ${event.type}`);
  }

  return { success: true, message: "Webhook processed" };
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  
  const reference = session.metadata?.reference;
  if (!reference) {
    console.error("[Stripe] No reference in session metadata");
    return;
  }

  // Update order status to paid
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ 
      status: "paid",
      stripe_session_id: session.id,
      paid_at: new Date().toISOString(),
    })
    .eq("reference", reference);

  if (error) {
    console.error(`[Stripe] Failed to update order ${reference}:`, error);
    return;
  }

  // Send confirmation email
  const { sendCustomerEmail } = await import("./notify.server");
  const customerEmail = session.customer_email;
  if (customerEmail) {
    await sendCustomerEmail(
      customerEmail,
      `تأكيد الدفع ${reference} | Travel Smart Budget`,
      `<p>تم استلام دفعتك بنجاح!</p>
       <p>رقم الطلب: <b>${reference}</b></p>
       <p>يمكنك الآن الوصول إلى محتواک في صفحة "حسابي".</p>`
    );
  }

  console.log(`[Stripe] Order ${reference} marked as paid`);
}

/**
 * Creates a Stripe customer portal session for managing subscriptions/billing.
 */
export async function createPortalSession(customerId: string): Promise<string | null> {
  if (!stripe) return null;
  
  const siteUrl = process.env.PUBLIC_SITE_URL ?? "http://localhost:5173";
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${siteUrl}/account`,
  });

  return session.url;
}
