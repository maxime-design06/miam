-- ============================================================
-- MIAM - Schéma de base de données
-- ============================================================
-- À exécuter dans Supabase : SQL Editor > New query > coller > Run
-- ============================================================

-- Catégories (Entrée, Plat, Dessert, ...)
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- Tags (Végétarien, Rapide, Italien, ...)
create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- Recettes (table principale)
create table recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  image_url text,
  prep_time_minutes integer,
  cook_time_minutes integer,
  servings integer,
  difficulty text check (difficulty in ('facile', 'moyen', 'difficile')),
  author text,
  notes text, -- notes personnelles, non affichées publiquement
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ingrédients d'une recette (une ligne = un ingrédient)
create table ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  name text not null,
  quantity numeric,
  unit text,
  display_order integer not null default 0
);

-- Étapes d'une recette (une ligne = une étape)
create table steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  step_number integer not null,
  description text not null
);

-- Conseils liés à une recette (une ligne = un conseil)
create table recipe_tips (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  tip text not null,
  display_order integer not null default 0
);

-- Liaison recettes <-> catégories (une recette peut avoir plusieurs catégories)
create table recipe_categories (
  recipe_id uuid not null references recipes(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (recipe_id, category_id)
);

-- Liaison recettes <-> tags (une recette peut avoir plusieurs tags)
create table recipe_tags (
  recipe_id uuid not null references recipes(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (recipe_id, tag_id)
);

-- ============================================================
-- Index pour accélérer les recherches et filtres
-- ============================================================
create index idx_recipes_slug on recipes(slug);
create index idx_recipes_difficulty on recipes(difficulty);
create index idx_ingredients_recipe_id on ingredients(recipe_id);
create index idx_steps_recipe_id on steps(recipe_id);
create index idx_recipe_categories_category_id on recipe_categories(category_id);
create index idx_recipe_tags_tag_id on recipe_tags(tag_id);

-- Index de recherche texte (titre + description)
create index idx_recipes_search on recipes using gin (
  to_tsvector('french', coalesce(title, '') || ' ' || coalesce(description, ''))
);

-- ============================================================
-- Mise à jour automatique de updated_at
-- ============================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_recipes_updated_at
before update on recipes
for each row
execute function set_updated_at();
