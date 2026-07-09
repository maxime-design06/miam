-- ============================================================
-- MIAM - Stockage des images de recettes
-- ============================================================
-- À exécuter dans Supabase > SQL Editor > New query > Run
--
-- Crée un espace de stockage ("bucket") public pour les photos
-- de recettes, avec les mêmes règles que le reste : tout le monde
-- peut voir les images, seule une personne connectée peut en
-- ajouter, remplacer ou supprimer.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

create policy "Lecture publique images" on storage.objects
  for select using (bucket_id = 'recipe-images');

create policy "Ajout connecté images" on storage.objects
  for insert to authenticated with check (bucket_id = 'recipe-images');

create policy "Modification connectée images" on storage.objects
  for update to authenticated using (bucket_id = 'recipe-images');

create policy "Suppression connectée images" on storage.objects
  for delete to authenticated using (bucket_id = 'recipe-images');
