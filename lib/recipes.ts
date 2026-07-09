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
  image_url: string | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  difficulty: Difficulty | null;
};

type CategoryLinkRow = {
  recipe_id: string;
  categories: { name: string } | { name: string }[] | null;
};

/**
 * Indique si la personne qui consulte la page est connectée
 * (donc autorisée à voir les boutons d'administration).
 */
export async function isLoggedIn(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return Boolean(data.user);
}

export interface RecipeEditData {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  sourceUrl: string | null;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: string;
  categoryId: string | null;
  tagIds: string[];
  ingredients: { name: string; quantity: number | null; unit: string | null }[];
  steps: { description: string }[];
  tips: { tip: string }[];
}

/**
 * Récupère une recette avec toutes ses données modifiables,
 * pour préremplir le formulaire d'édition dans l'administration.
 */
export async function getRecipeForAdmin(id: string): Promise<RecipeEditData | null> {
  const supabase = await createClient();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select(
      "id, title, slug, description, image_url, source_url, prep_time_minutes, cook_time_minutes, servings, difficulty"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !recipe) {
    if (error) console.error(error.message);
    return null;
  }

  const [{ data: ingredients }, { data: steps }, { data: tips }, { data: categoryLink }, { data: tagLinks }] =
    await Promise.all([
      supabase
        .from("ingredients")
        .select("name, quantity, unit")
        .eq("recipe_id", id)
        .order("display_order"),
      supabase.from("steps").select("description").eq("recipe_id", id).order("step_number"),
      supabase
        .from("recipe_tips")
        .select("tip")
        .eq("recipe_id", id)
        .order("display_order"),
      supabase
        .from("recipe_categories")
        .select("category_id")
        .eq("recipe_id", id)
        .maybeSingle(),
      supabase.from("recipe_tags").select("tag_id").eq("recipe_id", id),
    ]);

  return {
    id: recipe.id,
    title: recipe.title,
    slug: recipe.slug,
    description: recipe.description ?? "",
    imageUrl: recipe.image_url ?? null,
    sourceUrl: recipe.source_url ?? null,
    prepTimeMinutes: recipe.prep_time_minutes ?? 0,
    cookTimeMinutes: recipe.cook_time_minutes ?? 0,
    servings: recipe.servings ?? 1,
    difficulty: recipe.difficulty ?? "facile",
    categoryId: categoryLink?.category_id ?? null,
    tagIds: (tagLinks ?? []).map((link) => link.tag_id),
    ingredients: (ingredients ?? []).map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
    })),
    steps: (steps ?? []).map((s) => ({ description: s.description })),
    tips: (tips ?? []).map((t) => ({ tip: t.tip })),
  };
}

export async function getTags() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tags")
    .select("id, name, slug")
    .order("name");

  if (error) {
    console.error("Erreur lors de la récupération des tags :", error.message);
    return [];
  }

  return data ?? [];
}

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
  sourceUrl: string | null;
  ingredients: { id: string; name: string; quantity: number | null; unit: string | null }[];
  steps: { id: string; stepNumber: number; description: string }[];
  tips: { id: string; tip: string }[];
  tags: { id: string; name: string }[];
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
      "id, title, slug, description, image_url, source_url, prep_time_minutes, cook_time_minutes, servings, difficulty"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (recipeError || !recipe) {
    if (recipeError) {
      console.error("Erreur lors de la récupération de la recette :", recipeError.message);
    }
    return null;
  }

  const [{ data: ingredients }, { data: steps }, { data: tips }, { data: categoryLink }, { data: tagLinks }] =
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
      supabase.from("recipe_tags").select("tags ( id, name )").eq("recipe_id", recipe.id),
    ]);

  const categoryEntry = categoryLink?.categories;
  const category = Array.isArray(categoryEntry) ? categoryEntry[0]?.name : undefined;
  const resolvedCategory = category ?? "Plats";

  const tags = (tagLinks ?? []).flatMap((link) => {
    const entry = link.tags;
    const tagList = Array.isArray(entry) ? entry : entry ? [entry] : [];
    return tagList.map((tag: { id: string; name: string }) => ({ id: tag.id, name: tag.name }));
  });

  return {
    id: recipe.id,
    title: recipe.title,
    slug: recipe.slug,
    description: recipe.description ?? "",
    imageUrl: recipe.image_url ?? null,
    sourceUrl: recipe.source_url ?? null,
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
    tags,
  };
}

/**
 * Récupère toutes les recettes, avec leur catégorie principale,
 * et les met dans le format utilisé par l'interface (RecipeCard, etc.)
 *
 * Fait en deux requêtes simples plutôt qu'une seule requête avec
 * une jointure imbriquée sur deux niveaux, plus fiable avec Supabase.
 */
export interface PaginatedRecipes {
  recipes: Recipe[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Comme getRecipes, mais découpée en pages : renvoie seulement
 * `pageSize` recettes pour la page demandée, plus le nombre total
 * de recettes correspondant aux filtres (pour afficher "page 2/8").
 * Utilisée par le catalogue, qui doit rester rapide même avec
 * beaucoup de recettes.
 */
export async function getRecipesPaginated(filters?: {
  search?: string;
  categorySlug?: string;
  sort?: "recent" | "oldest" | "alpha";
  page?: number;
  pageSize?: number;
}): Promise<PaginatedRecipes> {
  const supabase = await createClient();
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = filters?.pageSize ?? 24;

  let recipeIdFilter: string[] | null = null;
  if (filters?.categorySlug) {
    const { data: links, error: linksError } = await supabase
      .from("recipe_categories")
      .select("recipe_id, categories!inner ( slug )")
      .eq("categories.slug", filters.categorySlug);

    if (linksError) {
      console.error("Erreur lors du filtrage par catégorie :", linksError.message);
      return { recipes: [], total: 0, page: 1, pageSize, totalPages: 1 };
    }

    recipeIdFilter = (links ?? []).map((link) => link.recipe_id);
    if (recipeIdFilter.length === 0) {
      return { recipes: [], total: 0, page: 1, pageSize, totalPages: 1 };
    }
  }

  let query = supabase
    .from("recipes")
    .select(
      "id, title, slug, description, image_url, prep_time_minutes, cook_time_minutes, servings, difficulty",
      { count: "exact" }
    );

  const term = filters?.search?.trim();
  if (term) {
    const escaped = term.replace(/[%_]/g, "");
    query = query.or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%`);
  }

  if (recipeIdFilter) {
    query = query.in("id", recipeIdFilter);
  }

  const sort = filters?.sort ?? "recent";
  query =
    sort === "alpha"
      ? query.order("title", { ascending: true })
      : query.order("created_at", { ascending: sort === "oldest" });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: recipeRows, error: recipesError, count } = await query.range(from, to);

  if (recipesError) {
    console.error("Erreur lors de la récupération des recettes :", recipesError.message);
    return { recipes: [], total: 0, page: 1, pageSize, totalPages: 1 };
  }

  const { data: categoryLinks } = await supabase
    .from("recipe_categories")
    .select("recipe_id, categories ( name )");

  const categoryByRecipeId = new Map<string, string>();
  for (const link of (categoryLinks as CategoryLinkRow[] | null) ?? []) {
    const categoryEntry = Array.isArray(link.categories) ? link.categories[0] : link.categories;
    if (categoryEntry?.name) {
      categoryByRecipeId.set(link.recipe_id, categoryEntry.name);
    }
  }

  const recipes = ((recipeRows as RecipeRow[]) ?? []).map((row) => {
    const category = categoryByRecipeId.get(row.id) ?? "Plats";
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description ?? "",
      imageUrl: row.image_url ?? null,
      prepTimeMinutes: row.prep_time_minutes ?? 0,
      cookTimeMinutes: row.cook_time_minutes ?? 0,
      servings: row.servings ?? 1,
      difficulty: row.difficulty ?? "facile",
      category,
      accentColor: categoryAccent[category] ?? "kiwi",
    };
  });

  const total = count ?? recipes.length;

  return {
    recipes,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getRecipes(filters?: {
  search?: string;
  categorySlug?: string;
  sort?: "recent" | "oldest" | "alpha";
}): Promise<Recipe[]> {
  const supabase = await createClient();

  // Si un filtre de catégorie est demandé, on récupère d'abord les
  // identifiants des recettes qui appartiennent à cette catégorie.
  let recipeIdFilter: string[] | null = null;
  if (filters?.categorySlug) {
    const { data: links, error: linksError } = await supabase
      .from("recipe_categories")
      .select("recipe_id, categories!inner ( slug )")
      .eq("categories.slug", filters.categorySlug);

    if (linksError) {
      console.error("Erreur lors du filtrage par catégorie :", linksError.message);
      return [];
    }

    recipeIdFilter = (links ?? []).map((link) => link.recipe_id);
    if (recipeIdFilter.length === 0) return [];
  }

  let query = supabase
    .from("recipes")
    .select(
      "id, title, slug, description, image_url, prep_time_minutes, cook_time_minutes, servings, difficulty"
    );

  const term = filters?.search?.trim();
  if (term) {
    const escaped = term.replace(/[%_]/g, "");
    query = query.or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%`);
  }

  if (recipeIdFilter) {
    query = query.in("id", recipeIdFilter);
  }

  const sort = filters?.sort ?? "recent";
  const { data: recipeRows, error: recipesError } =
    sort === "alpha"
      ? await query.order("title", { ascending: true })
      : await query.order("created_at", { ascending: sort === "oldest" });

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
      imageUrl: row.image_url ?? null,
      prepTimeMinutes: row.prep_time_minutes ?? 0,
      cookTimeMinutes: row.cook_time_minutes ?? 0,
      servings: row.servings ?? 1,
      difficulty: row.difficulty ?? "facile",
      category,
      accentColor: categoryAccent[category] ?? "kiwi",
    };
  });
}
