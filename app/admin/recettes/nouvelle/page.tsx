import { RecipeForm } from "@/components/admin/RecipeForm";
import { createRecipe } from "@/app/admin/actions";
import { getCategories } from "@/lib/recipes";

export default async function NewRecipePage() {
  const categories = await getCategories();

  return (
    <main className="max-w-3xl w-full mx-auto px-6 py-8">
      <h1 className="font-display text-2xl text-foreground mb-6">nouvelle recette</h1>
      <RecipeForm action={createRecipe} categories={categories} />
    </main>
  );
}
