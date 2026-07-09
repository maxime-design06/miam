-- ============================================================
-- MIAM - Sécurité (RLS) : lecture publique, écriture restreinte
-- ============================================================
-- À exécuter dans Supabase > SQL Editor > New query > Run
--
-- Pourquoi ce script : par sécurité, une table dont la RLS
-- (Row Level Security) est activée refuse TOUT accès tant qu'on
-- n'a pas explicitement défini une règle ("policy") qui l'autorise.
-- Ce script active la RLS sur toutes les tables et ajoute une
-- règle "tout le monde peut lire", ce qui correspond à un site
-- de recettes public en consultation. L'écriture (ajout,
-- modification, suppression) restera réservée à toi, via un accès
-- séparé qu'on mettra en place avec l'interface d'administration.
-- ============================================================

alter table recipes enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table ingredients enable row level security;
alter table steps enable row level security;
alter table recipe_tips enable row level security;
alter table recipe_categories enable row level security;
alter table recipe_tags enable row level security;

create policy "Lecture publique" on recipes for select using (true);
create policy "Lecture publique" on categories for select using (true);
create policy "Lecture publique" on tags for select using (true);
create policy "Lecture publique" on ingredients for select using (true);
create policy "Lecture publique" on steps for select using (true);
create policy "Lecture publique" on recipe_tips for select using (true);
create policy "Lecture publique" on recipe_categories for select using (true);
create policy "Lecture publique" on recipe_tags for select using (true);
