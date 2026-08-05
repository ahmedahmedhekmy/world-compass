-- Migration: Create all missing tables for the application
-- This migration is idempotent and can be safely run multiple times
-- Apply with: npx supabase db push or through Supabase dashboard

-- ============================================================================
-- ROLES & FUNCTIONS (required for RLS policies)
-- ============================================================================

CREATE TYPE IF NOT EXISTS public.app_role AS ENUM ('admin', 'customer');

-- Helper function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Helper function to check guide ownership
CREATE OR REPLACE FUNCTION public.owns_guide(_user_id uuid, _country_slug text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders
    WHERE user_id = _user_id AND country_slug = _country_slug
      AND product_type = 'guide' AND status = 'paid'
  )
$$;

-- Helper function to update timestamps
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============================================================================
-- USER ROLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY IF NOT EXISTS "admins read roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============================================================================
-- PROFILES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  country text,
  preferred_language text NOT NULL DEFAULT 'ar',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY IF NOT EXISTS "insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY IF NOT EXISTS "update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TRIGGER IF NOT EXISTS profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================================
-- SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  is_public boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.settings TO anon, authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "public settings readable" ON public.settings FOR SELECT TO anon, authenticated USING (is_public = true);
CREATE POLICY IF NOT EXISTS "admins manage settings" ON public.settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER IF NOT EXISTS settings_touch BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Insert default settings if not exists
INSERT INTO public.settings (key, value, is_public) VALUES
  ('pricing', '{"guidePriceUSD":19,"planningStartFeeUSD":49,"currency":"USD"}'::jsonb, true),
  ('contact', '{"email":"travelsmartbudget@gmail.com","whatsapp":"","telegram":""}'::jsonb, true),
  ('media', '{"heroVideoUrl":"","heroPosterUrl":""}'::jsonb, true),
  ('payments', '{"provider":"none","enabled":false}'::jsonb, true),
  ('homepage', '{"heroTitle":"","heroSubtitle":"","heroImageUrl":"","heroVideoUrl":"","featuredSlugs":[]}'::jsonb, true),
  ('trust', '{"badges":["دفع آمن","تسعير شفاف","معلومات سفر محدّثة","متوافق مع الجوال","تخطيط سفر احترافي","إرشادات عملية"]}'::jsonb, true)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- COUNTRIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  native_name text,
  iso_code text,
  flag text,
  continent text NOT NULL,
  region text,
  capital text,
  currency text,
  languages text[],
  hero_image_url text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  seo_title text,
  seo_description text,
  guide_price_usd numeric,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.countries TO anon, authenticated;
GRANT ALL ON public.countries TO service_role;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "published countries readable" ON public.countries FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY IF NOT EXISTS "admins manage countries" ON public.countries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER IF NOT EXISTS countries_touch BEFORE UPDATE ON public.countries FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================================
-- GUIDES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text,
  preview_text text,
  cover_image_url text,
  price_usd numeric,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  pdf_url text,
  version text NOT NULL DEFAULT 'v1.0',
  published boolean NOT NULL DEFAULT false,
  last_updated date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.guides TO anon, authenticated;
GRANT ALL ON public.guides TO service_role;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "published guides readable" ON public.guides FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY IF NOT EXISTS "buyers read guides" ON public.guides FOR SELECT TO authenticated
  USING (published = true AND public.owns_guide(auth.uid(), country_slug));
CREATE POLICY IF NOT EXISTS "admins manage guides" ON public.guides FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER IF NOT EXISTS guides_touch BEFORE UPDATE ON public.guides FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================================
-- ORDERS (CRITICAL - was missing in user's database)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  full_name text,
  product_type text NOT NULL,
  country_slug text,
  amount_usd numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending',
  provider text,
  provider_ref text,
  admin_notes text,
  stripe_session_id text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "own orders" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY IF NOT EXISTS "admins manage orders" ON public.orders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER IF NOT EXISTS orders_touch BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON public.orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON public.orders(reference);

-- ============================================================================
-- OFFERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  destination text,
  duration text,
  includes text[],
  starting_price_usd numeric,
  image_url text,
  video_url text,
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  cta_label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.offers TO anon, authenticated;
GRANT ALL ON public.offers TO service_role;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "active offers readable" ON public.offers FOR SELECT TO anon, authenticated
  USING (active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now()));
CREATE POLICY IF NOT EXISTS "admins manage offers" ON public.offers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER IF NOT EXISTS offers_touch BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================================
-- NEWSLETTER SUBSCRIBERS (CRITICAL - was missing in user's database)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  language text NOT NULL DEFAULT 'ar',
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "newsletter readable" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "newsletter insertable" ON public.newsletter_subscribers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "admins manage newsletter" ON public.newsletter_subscribers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER IF NOT EXISTS touch_newsletter BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================================
-- TRIP REQUESTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.trip_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'estimate',
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  nationality text,
  departure_country text,
  departure_city text,
  destination_country text,
  destination_city text,
  start_date date,
  end_date date,
  nights integer,
  adults integer NOT NULL DEFAULT 1,
  children integer NOT NULL DEFAULT 0,
  children_ages text,
  accommodation_level text,
  travel_style text,
  budget numeric,
  currency text DEFAULT 'USD',
  visa_help boolean NOT NULL DEFAULT false,
  preferred_contact text,
  notes text,
  estimate jsonb,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.trip_requests TO authenticated;
GRANT ALL ON public.trip_requests TO service_role;
ALTER TABLE public.trip_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "admins manage trip requests" ON public.trip_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY IF NOT EXISTS "own trip requests" ON public.trip_requests FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER IF NOT EXISTS trip_requests_touch BEFORE UPDATE ON public.trip_requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================================
-- BOOKING REQUESTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid REFERENCES public.offers(id) ON DELETE SET NULL,
  offer_title text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  travellers integer NOT NULL DEFAULT 1,
  start_date date,
  end_date date,
  special_requests text,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.booking_requests TO authenticated;
GRANT ALL ON public.booking_requests TO service_role;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "admins manage bookings" ON public.booking_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY IF NOT EXISTS "own bookings" ON public.booking_requests FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER IF NOT EXISTS booking_requests_touch BEFORE UPDATE ON public.booking_requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================================
-- CONTACT MESSAGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  subject text,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "admins manage messages" ON public.messages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER IF NOT EXISTS messages_touch BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================================
-- ANALYTICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id bigserial PRIMARY KEY,
  event text NOT NULL,
  path text,
  country_slug text,
  referrer_source text,
  device_type text,
  browser text,
  language text,
  region text,
  visitor_hash text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_created_idx ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_event_idx ON public.analytics_events (event);

GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "admins read analytics" ON public.analytics_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- ============================================================================
-- MEDIA ASSETS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  alt_text text,
  kind text NOT NULL DEFAULT 'image',
  url text NOT NULL,
  collection text NOT NULL DEFAULT 'gallery',
  country_slug text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  storage_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.media_assets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "active media readable" ON public.media_assets FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY IF NOT EXISTS "admins manage media" ON public.media_assets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER IF NOT EXISTS touch_media BEFORE UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================================
-- FAVORITES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, country_slug)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "own favorites" ON public.favorites FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- TESTIMONIALS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text,
  rating integer NOT NULL DEFAULT 5,
  comment text NOT NULL,
  photo_url text,
  is_demo boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "published testimonials readable" ON public.testimonials FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY IF NOT EXISTS "admins manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER IF NOT EXISTS testimonials_touch BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Insert demo testimonials if table is empty
INSERT INTO public.testimonials (name, country, rating, comment, is_demo, published, sort_order) 
SELECT * FROM (VALUES
  ('سارة العتيبي','السعودية',5,'حاسبة التكلفة أعطتني رقمًا واقعيًا قبل الحجز، ووفّرت عليّ ساعات بحث في مواقع متفرقة.',true,true,1),
  ('محمد الحربي','الإمارات',5,'دليل الدولة كان منظّمًا وواضحًا: التأشيرة، التنقل، وخطة الأيام. استعددت للرحلة بسهولة.',true,true,2),
  ('ليلى بن عيسى','المغرب',4,'أعجبني أن المعلومات المجانية مفيدة فعلًا وليست مجرد دعاية للمنتج المدفوع.',true,true,3),
  ('أحمد يوسف','مصر',5,'خدمة التخطيط المخصصة وفّرت عليّ إرباك التنسيق بين الرحلات والإقامة.',true,true,4)
) AS t(name, country, rating, comment, is_demo, published, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials LIMIT 1);
