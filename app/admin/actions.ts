"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/slugify";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Deux recettes ne peuvent pas avoir le même slug (le même "lien").
 * Si le slug demandé existe déjà, on ajoute -2, -3, etc. automatiquement.
 */
async function ensureUniqueSlug(
  supabase: SupabaseServerClient,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  const base = baseSlug || "recette";
  let query = supabase.from("recipes").select("slug").like("slug", `${base}%`);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query;
  const taken = new Set((data ?? []).map((row) => row.slug as string));
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix++;
  return `${base}-${suffix}`;
}

function errorQuery(message: string | undefined) {
  return encodeURIComponent((message ?? "erreur inconnue").slice(0, 200));
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect("/admin/login?error=1");
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

interface RecipeSectionPayload {
  title: string;
  ingredients: { name: string; quantity: number | null; unit: string | null }[];
  steps: { description: string }[];
}

interface RecipeFormPayload {
  title: string;
  slug: string;
  description: string;
  sourceUrl: string | null;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: string;
  categoryId: string | null;
  tagIds: string[];
  sections: RecipeSectionPayload[];
  tips: { tip: string }[];
}

function parseRecipeForm(formData: FormData): RecipeFormPayload {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const sourceUrlInput = String(formData.get("sourceUrl") ?? "").trim();

  const rawSections: {
    title?: string;
    ingredients?: { name: string; quantity: number | null; unit: string | null }[];
    steps?: { description: string }[];
  }[] = JSON.parse(String(formData.get("sectionsJson") ?? "[]"));

  const sections: RecipeSectionPayload[] = rawSections
    .map((section) => ({
      title: section.title?.trim() ?? "",
      ingredients: (section.ingredients ?? []).filter((i) => i.name?.trim()),
      steps: (section.steps ?? []).filter((s) => s.description?.trim()),
    }))
    .filter((section) => section.title || section.ingredients.length > 0 || section.steps.length > 0);

  return {
    title,
    slug: slugInput ? slugify(slugInput) : slugify(title),
    description: String(formData.get("description") ?? ""),
    sourceUrl: sourceUrlInput || null,
    prepTimeMinutes: Number(formData.get("prepTimeMinutes") ?? 0) || 0,
    cookTimeMinutes: Number(formData.get("cookTimeMinutes") ?? 0) || 0,
    servings: Number(formData.get("servings") ?? 1) || 1,
    difficulty: String(formData.get("difficulty") ?? "facile"),
    categoryId: (formData.get("categoryId") as string) || null,
    tagIds: formData.getAll("tagIds").map(String),
    sections,
    tips: JSON.parse(String(formData.get("tipsJson") ?? "[]")).filter((t: { tip: string }) =>
      t.tip?.trim()
    ),
  };
}

/**
 * Remplace les ingrédients, étapes, conseils et catégorie d'une recette.
 * On supprime tout puis on réinsère : plus simple et fiable que de
 * comparer ce qui a changé ligne par ligne.
 */
async function saveRelatedData(
  supabase: SupabaseServerClient,
  recipeId: string,
  payload: RecipeFormPayload
): Promise<string | null> {
  const errors: string[] = [];
  const track = (label: string, error: { message: string } | null) => {
    if (error) {
      console.error(`Erreur (${label}) :`, error.message);
      errors.push(`${label} : ${error.message}`);
    }
  };

  await supabase.from("recipe_categories").delete().eq("recipe_id", recipeId);
  if (payload.categoryId) {
    const { error } = await supabase
      .from("recipe_categories")
      .insert({ recipe_id: recipeId, category_id: payload.categoryId });
    track("catégorie", error);
  }

  await supabase.from("recipe_tags").delete().eq("recipe_id", recipeId);
  if (payload.tagIds.length > 0) {
    const { error } = await supabase.from("recipe_tags").insert(
      payload.tagIds.map((tagId) => ({ recipe_id: recipeId, tag_id: tagId }))
    );
    track("tags", error);
  }

  // On supprime les anciennes parties (ce qui supprime en cascade
  // leurs ingrédients/étapes), puis on nettoie aussi par précaution
  // les éventuels ingrédients/étapes d'anciennes recettes qui
  // n'avaient pas encore de partie du tout.
  await supabase.from("recipe_sections").delete().eq("recipe_id", recipeId);
  await supabase.from("ingredients").delete().eq("recipe_id", recipeId);
  await supabase.from("steps").delete().eq("recipe_id", recipeId);

  for (let sectionIndex = 0; sectionIndex < payload.sections.length; sectionIndex++) {
    const section = payload.sections[sectionIndex];

    const { data: sectionRow, error: sectionError } = await supabase
      .from("recipe_sections")
      .insert({ recipe_id: recipeId, title: section.title, display_order: sectionIndex })
      .select("id")
      .single();

    if (sectionError || !sectionRow) {
      track("partie de recette", sectionError ?? { message: "création impossible" });
      continue;
    }

    if (section.ingredients.length > 0) {
      const { error } = await supabase.from("ingredients").insert(
        section.ingredients.map((ingredient, index) => ({
          recipe_id: recipeId,
          section_id: sectionRow.id,
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          display_order: index,
        }))
      );
      track("ingrédients", error);
    }

    if (section.steps.length > 0) {
      const { error } = await supabase.from("steps").insert(
        section.steps.map((step, index) => ({
          recipe_id: recipeId,
          section_id: sectionRow.id,
          step_number: index + 1,
          description: step.description,
        }))
      );
      track("étapes", error);
    }
  }

  await supabase.from("recipe_tips").delete().eq("recipe_id", recipeId);
  if (payload.tips.length > 0) {
    const { error } = await supabase.from("recipe_tips").insert(
      payload.tips.map((tip, index) => ({
        recipe_id: recipeId,
        tip: tip.tip,
        display_order: index,
      }))
    );
    track("conseils", error);
  }

  return errors.length > 0 ? errors.join(" | ") : null;
}

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/admin/categories");

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({ name, slug: slugify(name) });

  if (error) {
    console.error("Erreur lors de la création de la catégorie :", error.message);
    redirect("/admin/categories?error=1");
  }

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    console.error("Erreur lors de la suppression de la catégorie :", error.message);
    redirect("/admin/categories?error=1");
  }

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  redirect("/admin/categories");
}

export async function createTag(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/admin/tags");

  const supabase = await createClient();
  const { error } = await supabase.from("tags").insert({ name, slug: slugify(name) });

  if (error) {
    console.error("Erreur lors de la création du tag :", error.message);
    redirect("/admin/tags?error=1");
  }

  revalidatePath("/admin/tags");
  redirect("/admin/tags");
}

export async function deleteTag(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tags").delete().eq("id", id);

  if (error) {
    console.error("Erreur lors de la suppression du tag :", error.message);
    redirect("/admin/tags?error=1");
  }

  revalidatePath("/admin/tags");
  redirect("/admin/tags");
}

/**
 * Envoie l'image choisie vers Supabase Storage et renvoie son URL publique.
 * Renvoie null si aucun fichier n'a été sélectionné.
 */
async function uploadRecipeImage(
  supabase: SupabaseServerClient,
  recipeId: string,
  file: File | null
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const extension = file.name.split(".").pop() || "jpg";
  const path = `${recipeId}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from("recipe-images")
    .upload(path, file, { contentType: file.type, upsert: true });

  if (error) {
    console.error("Erreur lors de l'envoi de l'image :", error.message);
    return null;
  }

  const { data } = supabase.storage.from("recipe-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function createRecipe(formData: FormData) {
  const supabase = await createClient();
  const payload = parseRecipeForm(formData);
  payload.slug = await ensureUniqueSlug(supabase, payload.slug);
  const existingImageUrl = String(formData.get("existingImageUrl") ?? "").trim() || null;

  const { data: recipe, error } = await supabase
    .from("recipes")
    .insert({
      title: payload.title,
      slug: payload.slug,
      description: payload.description,
      source_url: payload.sourceUrl,
      image_url: existingImageUrl,
      prep_time_minutes: payload.prepTimeMinutes,
      cook_time_minutes: payload.cookTimeMinutes,
      servings: payload.servings,
      difficulty: payload.difficulty,
    })
    .select("id")
    .single();

  if (error || !recipe) {
    console.error("Erreur lors de la création de la recette :", error?.message);
    redirect(`/admin/recettes/nouvelle?error=${errorQuery(error?.message)}`);
  }

  const relatedError = await saveRelatedData(supabase, recipe.id, payload);
  if (relatedError) {
    // On retire la recette à moitié créée, pour ne pas laisser de doublon vide.
    await supabase.from("recipes").delete().eq("id", recipe.id);
    redirect(`/admin/recettes/nouvelle?error=${errorQuery(relatedError)}`);
  }

  // Une nouvelle photo choisie manuellement prend le pas sur une image
  // déjà récupérée automatiquement (ex : import Instagram).
  const imageFile = formData.get("image") as File | null;
  const uploadedImageUrl = await uploadRecipeImage(supabase, recipe.id, imageFile);
  if (uploadedImageUrl) {
    await supabase.from("recipes").update({ image_url: uploadedImageUrl }).eq("id", recipe.id);
  }

  revalidatePath("/");
  revalidatePath("/recettes");
  redirect("/admin");
}

export async function updateRecipe(id: string, formData: FormData) {
  const supabase = await createClient();
  const payload = parseRecipeForm(formData);
  payload.slug = await ensureUniqueSlug(supabase, payload.slug, id);

  const { error } = await supabase
    .from("recipes")
    .update({
      title: payload.title,
      slug: payload.slug,
      description: payload.description,
      source_url: payload.sourceUrl,
      prep_time_minutes: payload.prepTimeMinutes,
      cook_time_minutes: payload.cookTimeMinutes,
      servings: payload.servings,
      difficulty: payload.difficulty,
    })
    .eq("id", id);

  if (error) {
    console.error("Erreur lors de la modification de la recette :", error.message);
    redirect(`/admin/recettes/${id}?error=${errorQuery(error.message)}`);
  }

  const relatedError = await saveRelatedData(supabase, id, payload);
  if (relatedError) {
    redirect(`/admin/recettes/${id}?error=${errorQuery(relatedError)}`);
  }

  const imageFile = formData.get("image") as File | null;
  const removeImage = formData.get("removeImage") === "on";
  const newImageUrl = await uploadRecipeImage(supabase, id, imageFile);

  if (newImageUrl) {
    await supabase.from("recipes").update({ image_url: newImageUrl }).eq("id", id);
  } else if (removeImage) {
    await supabase.from("recipes").update({ image_url: null }).eq("id", id);
  }

  revalidatePath("/");
  revalidatePath("/recettes");
  revalidatePath(`/recettes/${payload.slug}`);
  redirect("/admin");
}

export async function deleteRecipe(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("recipes").delete().eq("id", id);

  if (error) {
    console.error("Erreur lors de la suppression de la recette :", error.message);
    redirect("/admin?error=1");
  }

  revalidatePath("/");
  revalidatePath("/recettes");
  redirect("/admin");
}
