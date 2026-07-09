-- ============================================================
-- MIAM - Données de test
-- ============================================================
-- À exécuter APRÈS schema.sql
-- Supabase > SQL Editor > New query > coller > Run
-- ============================================================

insert into categories (id, name, slug) values
  ('11111111-1111-1111-1111-111111111111', 'Entrées', 'entrees'),
  ('22222222-2222-2222-2222-222222222222', 'Plats', 'plats'),
  ('33333333-3333-3333-3333-333333333333', 'Desserts', 'desserts');

insert into tags (id, name, slug) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Végétarien', 'vegetarien'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Rapide', 'rapide');

insert into recipes (id, title, slug, description, prep_time_minutes, cook_time_minutes, servings, difficulty) values
  ('44444444-4444-4444-4444-444444444444', 'Velouté de potimarron', 'veloute-de-potimarron', 'Un velouté d''automne réconfortant, doux et légèrement épicé.', 15, 20, 4, 'facile'),
  ('55555555-5555-5555-5555-555555555555', 'Risotto aux champignons', 'risotto-aux-champignons', 'Un risotto crémeux aux champignons de saison.', 15, 30, 4, 'moyen'),
  ('66666666-6666-6666-6666-666666666666', 'Fondant au chocolat', 'fondant-au-chocolat', 'Un cœur coulant au chocolat noir, simple et efficace.', 10, 15, 6, 'facile'),
  ('77777777-7777-7777-7777-777777777777', 'Salade de lentilles', 'salade-de-lentilles', 'Fraîche, rapide et pleine de protéines végétales.', 20, 0, 2, 'facile');

insert into recipe_categories (recipe_id, category_id) values
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111'),
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222'),
  ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333'),
  ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111');

insert into recipe_tags (recipe_id, tag_id) values
  ('77777777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('77777777-7777-7777-7777-777777777777', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

insert into ingredients (recipe_id, name, quantity, unit, display_order) values
  ('44444444-4444-4444-4444-444444444444', 'potimarron', 1, null, 1),
  ('44444444-4444-4444-4444-444444444444', 'oignon', 1, null, 2),
  ('44444444-4444-4444-4444-444444444444', 'bouillon de légumes', 1, 'l', 3);

insert into steps (recipe_id, step_number, description) values
  ('44444444-4444-4444-4444-444444444444', 1, 'Éplucher et couper le potimarron et l''oignon en morceaux.'),
  ('44444444-4444-4444-4444-444444444444', 2, 'Faire revenir l''oignon puis ajouter le potimarron et le bouillon.'),
  ('44444444-4444-4444-4444-444444444444', 3, 'Cuire 20 minutes puis mixer jusqu''à obtenir un velouté lisse.');
