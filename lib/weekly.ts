import { createClient } from "@/lib/supabase/server";

export interface WeeklyEntry {
  id: string;
  recipeId: string | null;
  title: string;
  slug: string | null;
  imageUrl: string | null;
  isCustom: boolean;
  isCooked: boolean;
  isEaten: boolean;
  hasLeftovers: boolean;
}

type WeeklyRow = {
  id: string;
  recipe_id: string | null;
  custom_title: string | null;
  is_cooked: boolean;
  is_eaten: boolean;
  has_leftovers: boolean;
  recipes: { title: string; slug: string; image_url: string | null } | { title: string; slug: string; image_url: string | null }[] | null;
};

/**
 * Récupère la liste des recettes ajoutées pour la semaine en cours,
 * avec leur statut (cuisinée, mangée, restes). Certaines entrées
 * peuvent être du simple texte libre, sans fiche recette liée.
 */
export async function getWeeklyList(): Promise<WeeklyEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("weekly_recipes")
    .select(
      "id, recipe_id, custom_title, is_cooked, is_eaten, has_leftovers, recipes ( title, slug, image_url )"
    )
    .order("added_at", { ascending: true });

  if (error) {
    console.error("Erreur lors de la récupération de la liste de la semaine :", error.message);
    return [];
  }

  return ((data as WeeklyRow[]) ?? []).map((row) => {
    const recipe = Array.isArray(row.recipes) ? row.recipes[0] : row.recipes;
    return {
      id: row.id,
      recipeId: row.recipe_id,
      title: recipe?.title ?? row.custom_title ?? "Sans titre",
      slug: recipe?.slug ?? null,
      imageUrl: recipe?.image_url ?? null,
      isCustom: !row.recipe_id,
      isCooked: row.is_cooked,
      isEaten: row.is_eaten,
      hasLeftovers: row.has_leftovers,
    };
  });
}

/**
 * Renvoie l'entrée de la liste de la semaine pour cette recette,
 * si elle y a déjà été ajoutée (utile pour afficher le bon bouton
 * sur la fiche recette).
 */
export async function getWeeklyEntryForRecipe(recipeId: string): Promise<{ id: string } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("weekly_recipes")
    .select("id")
    .eq("recipe_id", recipeId)
    .maybeSingle();
  return data ?? null;
}
