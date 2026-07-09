-- ============================================================
-- MIAM - Date de dernière consommation d'une recette
-- ============================================================
-- À exécuter dans Supabase > SQL Editor > New query > Run
--
-- Contrairement à la liste "cette semaine" qui est vidée
-- régulièrement, cette date reste enregistrée sur la recette
-- elle-même, pour pouvoir un jour retrouver "qu'est-ce qu'on n'a
-- pas mangé depuis longtemps ?"
-- ============================================================

alter table recipes add column if not exists last_eaten_at timestamptz;
