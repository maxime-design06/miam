"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addToWeeklyList(recipeId: string, slug: string): Promise<string> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("weekly_recipes")
    .select("id")
    .eq("recipe_id", recipeId)
    .maybeSingle();

  let entryId = existing?.id as string | undefined;

  if (!entryId) {
    const { data: inserted, error } = await supabase
      .from("weekly_recipes")
      .insert({ recipe_id: recipeId })
      .select("id")
      .single();

    if (error || !inserted) {
      throw new Error(error?.message ?? "Impossible d'ajouter la recette.");
    }
    entryId = inserted.id;
  }

  revalidatePath("/semaine");
  revalidatePath(`/recettes/${slug}`);

  if (!entryId) {
    throw new Error("Impossible de déterminer l'identifiant de la recette ajoutée.");
  }

  return entryId;
}

export async function removeFromWeeklyList(id: string, slug: string | null) {
  const supabase = await createClient();
  await supabase.from("weekly_recipes").delete().eq("id", id);

  revalidatePath("/semaine");
  if (slug) revalidatePath(`/recettes/${slug}`);
}

export async function addCustomWeeklyEntry(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const supabase = await createClient();
  const { error } = await supabase.from("weekly_recipes").insert({ custom_title: title });

  if (error) {
    console.error("Erreur lors de l'ajout de l'entrée libre :", error.message);
  }

  revalidatePath("/semaine");
}

export async function setWeeklyField(
  id: string,
  recipeId: string | null,
  field: "is_cooked" | "is_eaten" | "has_leftovers",
  formData: FormData
) {
  const supabase = await createClient();
  const value = formData.get("value") === "on";

  await supabase.from("weekly_recipes").update({ [field]: value }).eq("id", id);

  // On garde une trace durable de la dernière fois qu'une recette a
  // été mangée, même après avoir vidé la liste de la semaine.
  // (Les entrées libres, sans recette liée, n'ont rien à mettre à jour ici.)
  if (field === "is_eaten" && value && recipeId) {
    await supabase
      .from("recipes")
      .update({ last_eaten_at: new Date().toISOString() })
      .eq("id", recipeId);
    revalidatePath("/");
  }

  revalidatePath("/semaine");
}

export async function clearWeeklyList() {
  const supabase = await createClient();
  await supabase
    .from("weekly_recipes")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  revalidatePath("/semaine");
}
