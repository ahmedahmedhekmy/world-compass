# Production Deployment Guide

This guide walks through deploying Travel Smart Budget to production.

## Prerequisites

1. Node.js 18+ installed
2. A Supabase project created
3. A Stripe account (for payments)
4. Domain configured (optional)

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PUBLIC_SITE_URL` | Production site URL | `https://travelsmartbudget.com` |
| `SUPABASE_URL` | Supabase project URL (server-side) | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_URL` | Supabase URL (client-side) | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | `eyJhbGci...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `STRIPE_PRICE_ID_GUIDE` | Stripe price ID for travel guide | - |
| `STRIPE_PRICE_ID_PLANNING` | Stripe price ID for planning service | - |
| `EMAIL_ENABLED` | Enable email sending | `false` |
| `EMAIL_HOST` | SMTP host | - |
| `EMAIL_PORT` | SMTP port | - |
| `EMAIL_USER` | SMTP username | - |
| `EMAIL_PASS` | SMTP password | - |

## Database Setup

1. Run the Stripe migration:
```bash
npx supabase db push
```

2. Or manually apply `supabase/migrations/20260803230000_add_stripe_fields.sql`

## Stripe Configuration

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create products and prices for:
   - Travel Guide (one-time, $19)
   - Travel Planning (one-time, $49)

3. Copy the Price IDs to your environment:
   ```
   STRIPE_PRICE_ID_GUIDE=price_xxx
   STRIPE_PRICE_ID_PLANNING=price_xxx
   ```

4. Set up webhook endpoint:
   - URL: `https://your-domain/api/stripe-webhook`
   - Events: `checkout.session.completed`, `payment_intent.payment_failed`

## Deployment

### Option 1: Vercel (Recommended)

1. Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

2. Add ALL required environment variables:
   - `SUPABASE_URL` (Production, Preview, Development)
   - `SUPABASE_SERVICE_ROLE_KEY` (Production, Preview, Development)
   - `VITE_SUPABASE_URL` (Production, Preview, Development)
   - `VITE_SUPABASE_PUBLISHABLE_KEY` (Production, Preview, Development)
   - `STRIPE_SECRET_KEY` (Production, Preview)
   - `VITE_STRIPE_PUBLISHABLE_KEY` (Production, Preview)
   - `STRIPE_WEBHOOK_SECRET` (Production, Preview)

3. Go to **Deployments** tab and click **Redeploy** (or push a commit to trigger auto-deploy)

4. Verify the deployment URL loads correctly

### Option 2: Docker

```bash
docker build -t travel-smart-budget .
docker run -p 3000:3000 --env-file .env travel-smart-budget
```

### Option 3: Manual

```bash
npm install
npm run build
npm start
```

## Post-Deployment Checklist

- [ ] Verify sitemap.xml loads correctly
- [ ] Test checkout flow (use Stripe test mode first)
- [ ] Check admin dashboard functionality
- [ ] Test mobile responsiveness
- [ ] Verify SSL certificate
- [ ] Set up monitoring (Sentry, LogRocket, etc.)
- [ ] Configure CDN caching rules
- [ ] Test email notifications (if enabled)
- [ ] Configure robots.txt via hosting platform (Vercel, Netlify, or CDN)

## Monitoring

### Error Tracking
Recommended: [Sentry](https://sentry.io)

```bash
npm install @sentry/react
```

### Analytics
- Google Analytics 4
- Google Tag Manager
- Custom analytics via Supabase

### Uptime Monitoring
Recommended services:
- UptimeRobot
- Pingdom
- Grafana + Prometheus

## Security Checklist

- [ ] All environment variables are set (no defaults in production)
- [ ] Stripe is in live mode (not test mode)
- [ ] Supabase Row Level Security is enabled
- [ ] Admin routes are protected
- [ ] HTTPS is enforced
- [ ] CSP headers configured
- [ ] Rate limiting is enabled

## Support

For issues, check:
1. Supabase Dashboard > Logs
2. Vercel Deployment Logs
3. Stripe Dashboard > Webhooks > Failed events
4. Application server logs
