"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/slugify";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

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

interface RecipeFormPayload {
  title: string;
  slug: string;
  description: string;
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

function parseRecipeForm(formData: FormData): RecipeFormPayload {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();

  return {
    title,
    slug: slugInput ? slugify(slugInput) : slugify(title),
    description: String(formData.get("description") ?? ""),
    prepTimeMinutes: Number(formData.get("prepTimeMinutes") ?? 0) || 0,
    cookTimeMinutes: Number(formData.get("cookTimeMinutes") ?? 0) || 0,
    servings: Number(formData.get("servings") ?? 1) || 1,
    difficulty: String(formData.get("difficulty") ?? "facile"),
    categoryId: (formData.get("categoryId") as string) || null,
    tagIds: formData.getAll("tagIds").map(String),
    ingredients: JSON.parse(String(formData.get("ingredientsJson") ?? "[]")).filter(
      (i: { name: string }) => i.name?.trim()
    ),
    steps: JSON.parse(String(formData.get("stepsJson") ?? "[]")).filter(
      (s: { description: string }) => s.description?.trim()
    ),
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
) {
  await supabase.from("recipe_categories").delete().eq("recipe_id", recipeId);
  if (payload.categoryId) {
    await supabase
      .from("recipe_categories")
      .insert({ recipe_id: recipeId, category_id: payload.categoryId });
  }

  await supabase.from("recipe_tags").delete().eq("recipe_id", recipeId);
  if (payload.tagIds.length > 0) {
    await supabase.from("recipe_tags").insert(
      payload.tagIds.map((tagId) => ({ recipe_id: recipeId, tag_id: tagId }))
    );
  }

  await supabase.from("ingredients").delete().eq("recipe_id", recipeId);
  if (payload.ingredients.length > 0) {
    await supabase.from("ingredients").insert(
      payload.ingredients.map((ingredient, index) => ({
        recipe_id: recipeId,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        display_order: index,
      }))
    );
  }

  await supabase.from("steps").delete().eq("recipe_id", recipeId);
  if (payload.steps.length > 0) {
    await supabase.from("steps").insert(
      payload.steps.map((step, index) => ({
        recipe_id: recipeId,
        step_number: index + 1,
        description: step.description,
      }))
    );
  }

  await supabase.from("recipe_tips").delete().eq("recipe_id", recipeId);
  if (payload.tips.length > 0) {
    await supabase.from("recipe_tips").insert(
      payload.tips.map((tip, index) => ({
        recipe_id: recipeId,
        tip: tip.tip,
        display_order: index,
      }))
    );
  }
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
  await supabase.from("tags").delete().eq("id", id);

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

  const { data: recipe, error } = await supabase
    .from("recipes")
    .insert({
      title: payload.title,
      slug: payload.slug,
      description: payload.description,
      prep_time_minutes: payload.prepTimeMinutes,
      cook_time_minutes: payload.cookTimeMinutes,
      servings: payload.servings,
      difficulty: payload.difficulty,
    })
    .select("id")
    .single();

  if (error || !recipe) {
    console.error("Erreur lors de la création de la recette :", error?.message);
    redirect("/admin/recettes/nouvelle?error=1");
  }

  await saveRelatedData(supabase, recipe.id, payload);

  const imageFile = formData.get("image") as File | null;
  const imageUrl = await uploadRecipeImage(supabase, recipe.id, imageFile);
  if (imageUrl) {
    await supabase.from("recipes").update({ image_url: imageUrl }).eq("id", recipe.id);
  }

  revalidatePath("/");
  revalidatePath("/recettes");
  redirect("/admin");
}

export async function updateRecipe(id: string, formData: FormData) {
  const supabase = await createClient();
  const payload = parseRecipeForm(formData);

  const { error } = await supabase
    .from("recipes")
    .update({
      title: payload.title,
      slug: payload.slug,
      description: payload.description,
      prep_time_minutes: payload.prepTimeMinutes,
      cook_time_minutes: payload.cookTimeMinutes,
      servings: payload.servings,
      difficulty: payload.difficulty,
    })
    .eq("id", id);

  if (error) {
    console.error("Erreur lors de la modification de la recette :", error.message);
    redirect(`/admin/recettes/${id}?error=1`);
  }

  await saveRelatedData(supabase, id, payload);

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
  await supabase.from("recipes").delete().eq("id", id);

  revalidatePath("/");
  revalidatePath("/recettes");
  redirect("/admin");
}
