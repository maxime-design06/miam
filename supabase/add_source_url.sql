-- ============================================================
-- MIAM - Ajout du lien source (Instagram, etc.)
-- ============================================================
-- À exécuter dans Supabase > SQL Editor > New query > Run
-- ============================================================

alter table recipes add column if not exists source_url text;
