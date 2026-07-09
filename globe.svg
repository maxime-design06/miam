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
};

type CategoryLinkRow = {
  recipe_id: string;
  categories: { name: string } | { name: string }[] | null;
};

export async function getCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  if (error) {
    console.error("Erreur lors de la récupération des catégories :", error.message);
    return [];
  }

  return data ?? [];
}

export interface RecipeDetail extends Recipe {
  ingredients: { id: string; name: string; quantity: number | null; unit: string | null }[];
  steps: { id: string; stepNumber: number; description: string }[];
  tips: { id: string; tip: string }[];
}

/**
 * Récupère une recette complète (ingrédients, étapes, conseils, catégorie)
 * à partir de son slug, pour la page de fiche recette.
 * Renvoie null si aucune recette ne correspond.
 */
export async function getRecipeBySlug(slug: string): Promise<RecipeDetail | null> {
  const supabase = await createClient();

  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select(
      "id, title, slug, description, prep_time_minutes, cook_time_minutes, servings, difficulty"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (recipeError || !recipe) {
    if (recipeError) {
      console.error("Erreur lors de la récupération de la recette :", recipeError.message);
    }
    return null;
  }

  const [{ data: ingredients }, { data: steps }, { data: tips }, { data: categoryLink }] =
    await Promise.all([
      supabase
        .from("ingredients")
        .select("id, name, quantity, unit")
        .eq("recipe_id", recipe.id)
        .order("display_order"),
      supabase
        .from("steps")
        .select("id, step_number, description")
        .eq("recipe_id", recipe.id)
        .order("step_number"),
      supabase
        .from("recipe_tips")
        .select("id, tip")
        .eq("recipe_id", recipe.id)
        .order("display_order"),
      supabase
        .from("recipe_categories")
        .select("categories ( name )")
        .eq("recipe_id", recipe.id)
        .maybeSingle(),
    ]);

  const categoryEntry = categoryLink?.categories;
  const category = Array.isArray(categoryEntry) ? categoryEntry[0]?.name : undefined;
  const resolvedCategory = category ?? "Plats";

  return {
    id: recipe.id,
    title: recipe.title,
    slug: recipe.slug,
    description: recipe.description ?? "",
    prepTimeMinutes: recipe.prep_time_minutes ?? 0,
    cookTimeMinutes: recipe.cook_time_minutes ?? 0,
    servings: recipe.servings ?? 1,
    difficulty: recipe.difficulty ?? "facile",
    category: resolvedCategory,
    accentColor: categoryAccent[resolvedCategory] ?? "kiwi",
    ingredients: (ingredients ?? []).map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
    })),
    steps: (steps ?? []).map((s) => ({
      id: s.id,
      stepNumber: s.step_number,
      description: s.description,
    })),
    tips: (tips ?? []).map((t) => ({ id: t.id, tip: t.tip })),
  };
}

/**
 * Récupère toutes les recettes, avec leur catégorie principale,
 * et les met dans le format utilisé par l'interface (RecipeCard, etc.)
 *
 * Fait en deux requêtes simples plutôt qu'une seule requête avec
 * une jointure imbriquée sur deux niveaux, plus fiable avec Supabase.
 */
export async function getRecipes(): Promise<Recipe[]> {
  const supabase = await createClient();

  const { data: recipeRows, error: recipesError } = await supabase
    .from("recipes")
    .select(
      "id, title, slug, description, prep_time_minutes, cook_time_minutes, servings, difficulty"
    )
    .order("created_at", { ascending: false });

  if (recipesError) {
    console.error("Erreur lors de la récupération des recettes :", recipesError.message);
    return [];
  }

  const { data: categoryLinks, error: categoriesError } = await supabase
    .from("recipe_categories")
    .select("recipe_id, categories ( name )");

  if (categoriesError) {
    console.error("Erreur lors de la récupération des catégories :", categoriesError.message);
  }

  // On construit une correspondance recipe_id -> nom de catégorie
  const categoryByRecipeId = new Map<string, string>();
  for (const link of (categoryLinks as CategoryLinkRow[] | null) ?? []) {
    const categoryEntry = Array.isArray(link.categories)
      ? link.categories[0]
      : link.categories;
    if (categoryEntry?.name) {
      categoryByRecipeId.set(link.recipe_id, categoryEntry.name);
    }
  }

  return ((recipeRows as RecipeRow[]) ?? []).map((row) => {
    const category = categoryByRecipeId.get(row.id) ?? "Plats";

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
