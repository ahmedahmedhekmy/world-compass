# Production Readiness Checklist — Travel Smart Budget

> Last Updated: 2026-08-03
> Status: Awaiting approval before implementing fixes

---

## 🔴 CRITICAL (Deployment Blockers)

### Payment Integration
- [ ] **NO ACTUAL PAYMENT GATEWAY**: Checkout creates orders with `pending` status but no actual payment processing
  - Need to integrate Stripe, PayPal, or another payment provider
  - No webhook handling for payment confirmations
  - Orders stay in "pending" forever without real payment flow
- [ ] No payment confirmation emails sent to customers (only notification to admin)
- [ ] No mechanism to mark orders as "paid" automatically

### Email Notifications
- [ ] `RESEND_API_KEY` is not configured
  - All emails are being logged to console, not actually sent
  - Customer order confirmations are not delivered
  - Admin notifications are only server-side logs
- [ ] `NOTIFY_EMAIL` not set (defaults to travelsmartbudget@gmail.com)
- [ ] `NOTIFY_FROM` not configured (defaults to onboarding@resend.dev)

### Supabase Configuration
- [ ] `SUPABASE_SERVICE_ROLE_KEY` not configured in production
  - Server-side operations will fail in production
  - Order creation, guide access, admin features need this
- [ ] Database migrations may need to be run on production

### Security
- [ ] Supabase publishable key is exposed in client-side code (expected, but needs RLS policies)
- [ ] No rate limiting on public API endpoints
- [ ] No CSRF protection mentioned

---

## 🟠 HIGH PRIORITY (Must Fix Before Launch)

### Environment Variables
- [ ] **Missing from `.env` and not in `.env.example`**:
  - `SUPABASE_SERVICE_ROLE_KEY` (required for server operations)
  - `RESEND_API_KEY` (required for email)
  - `NOTIFY_EMAIL` (optional, has default)
  - `NOTIFY_FROM` (optional, has default)
  - `PUBLIC_SITE_URL` (needed for sitemap BASE_URL)
  - `STRIPE_SECRET_KEY` (when payment is added)
  - `STRIPE_WEBHOOK_SECRET` (when payment is added)
  - `NEXT_PUBLIC_STRIPE_KEY` (when payment is added)

### SEO Issues
- [ ] **Sitemap `BASE_URL` is empty string** (`sitemap[.]xml.ts:6`)
  - All sitemap URLs will be broken (no domain prefix)
  - Search engines won't be able to crawl properly
- [ ] No Open Graph images set for most pages
- [ ] Twitter cards not fully configured
- [ ] Some pages missing canonical URLs

### Missing Features per README Requirements
- [ ] **Google AdSense monetization not implemented**
  - AdSense code not added
  - Policy compliance not verified
- [ ] **No WhatsApp number configured** (WhatsAppButton will be hidden)
  - `contact.whatsapp` is undefined in settings
  - `contact.telegram` is undefined
- [ ] No video hero (uses static image)

### Analytics
- [ ] Analytics events are being tracked but:
  - No Google Analytics / Google Tag Manager integration
  - No privacy-friendly analytics (Plausible, Fathom, etc.)
  - Admin analytics only shows basic data from custom tracking

---

## 🟡 MEDIUM PRIORITY

### Content & Data
- [ ] Country data is hardcoded in `/src/data/countries.ts`
  - README says "admin must be able to manage country content without modifying code"
  - Country pages use static data, not from database
- [ ] Only ~50 countries in database, README says should support ~195
- [ ] Guide content structure is placeholder (hardcoded CHAPTERS array in `guides.$slug.tsx`)
- [ ] No actual guide PDF files uploaded for any country
- [ ] No testimonials loaded from database (hardcoded in component)

### UI/UX Issues
- [ ] Country pages use continent image as hero (generic), not country-specific images
- [ ] No loading states for some async operations
- [ ] Error messages could be more user-friendly
- [ ] Mobile navigation could be improved

### Admin Dashboard
- [ ] Admin analytics is very basic
  - No charts/visualizations beyond simple counts
  - No date range filtering
  - No export functionality
- [ ] Admin orders table shows raw status values in English (not localized)
- [ ] No search/filter in admin tables
- [ ] No bulk actions for managing orders

### Legal Pages
- [ ] Privacy policy mentions AdSense but it's not implemented
- [ ] Cookie consent banner not implemented
- [ ] GDPR compliance not addressed (no cookie consent mechanism)

---

## 🟢 LOW PRIORITY / NICE TO HAVE

### Performance
- [ ] Images are not optimized (WebP/AVIF mentioned in README but not implemented)
- [ ] No lazy loading for above-the-fold images on some pages
- [ ] No image CDN configuration

### SEO Enhancements
- [ ] Schema.org markup could be expanded (TravelAction, Product, etc.)
- [ ] No breadcrumb JSON-LD on all pages
- [ ] No hreflang for bilingual (AR/EN) support mentioned

### Accessibility
- [ ] Some interactive elements may need better focus states
- [ ] Color contrast could be verified across all pages

### Testing
- [ ] No E2E tests
- [ ] No unit tests
- [ ] No integration tests
- [ ] No visual regression tests

### Documentation
- [ ] No deployment documentation beyond "npm run dev"
- [ ] No environment variable documentation
- [ ] No database schema documentation

---

## 📋 SPECIFIC FILE ISSUES

### `/src/routes/sitemap[.]xml.ts`
```typescript
const BASE_URL = ""; // ← MUST BE SET to production URL
```

### `/src/config/site.ts`
- [ ] `nameAr` is "ترافل سمارت بدجت" (appears to be placeholder/translation error)
  - Should probably be "Travel Smart Budget" in Arabic or proper Arabic name
- [ ] No fallback values if settings query fails

### `/src/routes/checkout.tsx`
- [ ] Line 124-125: Comment says "الدفع الإلكتروني قيد التفعيل حاليًا"
  - This is a placeholder, no actual payment integration

### `/src/routes/guides.$slug.tsx`
- [ ] Guide chapters are hardcoded placeholder (not from database)
- [ ] No actual guide content stored or fetched from Supabase

### `.env` file
- [ ] No `SUPABASE_SERVICE_ROLE_KEY`
- [ ] No `RESEND_API_KEY`
- [ ] No site URL
- [ ] No payment provider keys

---

## ✅ WHAT'S WORKING WELL

1. **Good project structure** - Clean separation of concerns
2. **RTL support** - Arabic language properly implemented
3. **Mobile-first design** - Responsive components throughout
4. **Form validation** - Using Zod schemas
5. **Error handling** - Basic error boundaries in place
6. **Supabase integration** - Auth, database, storage setup
7. **Route structure** - TanStack Router well configured
8. **SEO meta tags** - Most pages have proper titles/descriptions
9. **Auth system** - Login/signup flow implemented
10. **Admin dashboard** - Basic CRUD operations work

---

## 🎯 RECOMMENDED PRIORITY ORDER

1. **Fix payment integration** (critical for revenue)
2. **Configure email** (customer communication)
3. **Set environment variables** (security/functionality)
4. **Fix sitemap BASE_URL** (SEO)
5. **Add WhatsApp/Telegram** (customer support)
6. **Add proper guide content** (core product)
7. **Implement analytics** (business intelligence)
8. **Add AdSense** (monetization)
9. **Improve admin dashboard** (operational efficiency)
10. **Add tests and documentation** (long-term maintainability)

---

*This checklist was generated by inspecting the codebase. Items marked with [ ] need to be addressed before production deployment.*
