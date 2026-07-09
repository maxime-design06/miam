import { createClient } from "@/lib/supabase/server";
import type { Difficulty, Recipe } from "@/types/recipe";

// Couleur d'accent attribuée selon la catégorie (cohérent avec la charte MIAM)
const categoryAccent: Record<string, Recipe["accentColor"]> = {
  Entrées: "papaya",
  Plats: "pulp",
  Desserts: "mango",
  Rapide: "kiwi",
};

type RecipeRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  difficulty: Difficulty | null;
  recipe_categories: { categories: { name: string }[] | null }[] | null;
};

/**
 * Récupère toutes les recettes, avec leur catégorie principale,
 * et les met dans le format utilisé par l'interface (RecipeCard, etc.)
 */
export async function getRecipes(): Promise<Recipe[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select(
      `
      id,
      title,
      slug,
      description,
      prep_time_minutes,
      cook_time_minutes,
      servings,
      difficulty,
      recipe_categories ( categories ( name ) )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur lors de la récupération des recettes :", error.message);
    return [];
  }

  return (data as RecipeRow[]).map((row) => {
    const category = row.recipe_categories?.[0]?.categories?.[0]?.name ?? "Plats";

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description ?? "",
      prepTimeMinutes: row.prep_time_minutes ?? 0,
      cookTimeMinutes: row.cook_time_minutes ?? 0,
      servings: row.servings ?? 1,
      difficulty: row.difficulty ?? "facile",
      category,
      accentColor: categoryAccent[category] ?? "kiwi",
    };
  });
}
