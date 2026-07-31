CREATE POLICY "admins read guide files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'guides' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins upload guide files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'guides' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update guide files" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'guides' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'guides' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete guide files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'guides' AND public.has_role(auth.uid(), 'admin'));