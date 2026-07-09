-- ============================================================
-- MIAM - Autoriser l'écriture pour une personne connectée
-- ============================================================
-- À exécuter dans Supabase > SQL Editor > New query > Run
--
-- Le script précédent (policies.sql) n'autorisait que la LECTURE
-- publique. Celui-ci ajoute le droit d'ajouter, modifier et
-- supprimer des données, mais uniquement pour une personne
-- connectée (toi, via l'interface d'administration). Une
-- personne qui visite juste le site ne pourra jamais écrire.
-- ============================================================

create policy "Écriture connecté" on recipes for insert to authenticated with check (true);
create policy "Modification connecté" on recipes for update to authenticated using (true);
create policy "Suppression connecté" on recipes for delete to authenticated using (true);

create policy "Écriture connecté" on categories for insert to authenticated with check (true);
create policy "Modification connecté" on categories for update to authenticated using (true);
create policy "Suppression connecté" on categories for delete to authenticated using (true);

create policy "Écriture connecté" on tags for insert to authenticated with check (true);
create policy "Modification connecté" on tags for update to authenticated using (true);
create policy "Suppression connecté" on tags for delete to authenticated using (true);

create policy "Écriture connecté" on ingredients for insert to authenticated with check (true);
create policy "Modification connecté" on ingredients for update to authenticated using (true);
create policy "Suppression connecté" on ingredients for delete to authenticated using (true);

create policy "Écriture connecté" on steps for insert to authenticated with check (true);
create policy "Modification connecté" on steps for update to authenticated using (true);
create policy "Suppression connecté" on steps for delete to authenticated using (true);

create policy "Écriture connecté" on recipe_tips for insert to authenticated with check (true);
create policy "Modification connecté" on recipe_tips for update to authenticated using (true);
create policy "Suppression connecté" on recipe_tips for delete to authenticated using (true);

create policy "Écriture connecté" on recipe_categories for insert to authenticated with check (true);
create policy "Modification connecté" on recipe_categories for update to authenticated using (true);
create policy "Suppression connecté" on recipe_categories for delete to authenticated using (true);

create policy "Écriture connecté" on recipe_tags for insert to authenticated with check (true);
create policy "Modification connecté" on recipe_tags for update to authenticated using (true);
create policy "Suppression connecté" on recipe_tags for delete to authenticated using (true);
