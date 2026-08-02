ALTER TABLE public.guides
  ADD COLUMN IF NOT EXISTS version text NOT NULL DEFAULT 'v1.0',
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text;

ALTER TABLE public.media_assets
  ADD COLUMN IF NOT EXISTS storage_path text;