"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addToWeeklyList(recipeId: string, slug: string) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("weekly_recipes")
    .select("id")
    .eq("recipe_id", recipeId)
    .maybeSingle();

  if (!existing) {
    await supabase.from("weekly_recipes").insert({ recipe_id: recipeId });
  }

  revalidatePath("/semaine");
  revalidatePath(`/recettes/${slug}`);
}

export async function removeFromWeeklyList(id: string, slug: string) {
  const supabase = await createClient();
  await supabase.from("weekly_recipes").delete().eq("id", id);

  revalidatePath("/semaine");
  revalidatePath(`/recettes/${slug}`);
}

export async function setWeeklyField(
  id: string,
  field: "is_cooked" | "is_eaten" | "has_leftovers",
  formData: FormData
) {
  const supabase = await createClient();
  const value = formData.get("value") === "on";

  await supabase.from("weekly_recipes").update({ [field]: value }).eq("id", id);

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
