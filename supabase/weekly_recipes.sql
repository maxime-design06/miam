-- ============================================================
-- MIAM - Liste "cette semaine"
-- ============================================================
-- À exécuter dans Supabase > SQL Editor > New query > Run
-- ============================================================

create table weekly_recipes (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  is_cooked boolean not null default false,
  is_eaten boolean not null default false,
  has_leftovers boolean not null default false,
  added_at timestamptz not null default now()
);

create index idx_weekly_recipes_recipe_id on weekly_recipes(recipe_id);

alter table weekly_recipes enable row level security;

create policy "Lecture publique" on weekly_recipes for select using (true);
create policy "Écriture connecté" on weekly_recipes for insert to authenticated with check (true);
create policy "Modification connectée" on weekly_recipes for update to authenticated using (true);
create policy "Suppression connectée" on weekly_recipes for delete to authenticated using (true);
