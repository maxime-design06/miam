import { RecipeForm } from "@/components/admin/RecipeForm";
import { createRecipe } from "@/app/admin/actions";
import { getCategories, getTags } from "@/lib/recipes";

export default async function NewRecipePage() {
  const [categories, tags] = await Promise.all([getCategories(), getTags()]);

  return (
    <main className="max-w-3xl w-full mx-auto px-6 py-8">
      <h1 className="font-heading font-bold text-2xl text-foreground mb-6">nouvelle recette</h1>
      <RecipeForm action={createRecipe} categories={categories} tags={tags} />
    </main>
  );
}
