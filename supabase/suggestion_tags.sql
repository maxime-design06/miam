-- ============================================================
-- MIAM - Tags de moment de la journée et de saison
-- ============================================================
-- À exécuter dans Supabase > SQL Editor > New query > Run
--
-- Ces tags permettent d'afficher des suggestions sur l'accueil
-- en fonction de l'heure et de la saison. Tague ensuite tes
-- recettes avec le ou les tags correspondants (dans le
-- formulaire recette) pour qu'elles apparaissent en suggestion.
-- ============================================================

insert into tags (name, slug) values
  ('Petit-déjeuner', 'petit-dejeuner'),
  ('Déjeuner', 'dejeuner'),
  ('Goûter', 'gouter'),
  ('Dîner', 'diner'),
  ('Printemps', 'printemps'),
  ('Été', 'ete'),
  ('Automne', 'automne'),
  ('Hiver', 'hiver')
on conflict (slug) do nothing;
