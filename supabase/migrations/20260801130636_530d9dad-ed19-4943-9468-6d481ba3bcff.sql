CREATE TABLE public.testimonials (
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
CREATE POLICY "published testimonials readable" ON public.testimonials FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "admins manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER testimonials_touch BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, country_slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own favorites" ON public.favorites FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

INSERT INTO public.testimonials (name, country, rating, comment, is_demo, published, sort_order) VALUES
('سارة العتيبي','السعودية',5,'حاسبة التكلفة أعطتني رقمًا واقعيًا قبل الحجز، ووفّرت عليّ ساعات بحث في مواقع متفرقة.',true,true,1),
('محمد الحربي','الإمارات',5,'دليل الدولة كان منظّمًا وواضحًا: التأشيرة، التنقل، وخطة الأيام. استعددت للرحلة بسهولة.',true,true,2),
('ليلى بن عيسى','المغرب',4,'أعجبني أن المعلومات المجانية مفيدة فعلًا وليست مجرد دعاية للمنتج المدفوع.',true,true,3),
('أحمد يوسف','مصر',5,'خدمة التخطيط المخصصة وفّرت عليّ إرباك التنسيق بين الرحلات والإقامة.',true,true,4);

INSERT INTO public.settings (key, value, is_public) VALUES
('homepage', '{"heroTitle":"","heroSubtitle":"","heroImageUrl":"","heroVideoUrl":"","featuredSlugs":[]}'::jsonb, true),
('trust', '{"badges":["دفع آمن","تسعير شفاف","معلومات سفر محدّثة","متوافق مع الجوال","تخطيط سفر احترافي","إرشادات عملية"]}'::jsonb, true),
('comparison', '{"rows":[{"without":"البحث في مواقع كثيرة","with":"كل شيء منظّم في مكان واحد"},{"without":"تكاليف غير واضحة","with":"تقدير كامل لتكلفة الرحلة"},{"without":"معلومات مبعثرة","with":"تحضير سفر مرتّب خطوة بخطوة"},{"without":"تخطيط مربك","with":"تخطيط احترافي متسلسل"}]}'::jsonb, true)
ON CONFLICT (key) DO NOTHING;