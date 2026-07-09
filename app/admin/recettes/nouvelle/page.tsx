import { RecipeForm } from "@/components/admin/RecipeForm";
import { createRecipe } from "@/app/admin/actions";
import { getCategories, getTags } from "@/lib/recipes";

export default async function NewRecipePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [categories, tags] = await Promise.all([getCategories(), getTags()]);

  return (
    <main className="max-w-3xl w-full mx-auto px-6 py-8">
      <h1 className="font-heading font-bold text-2xl text-foreground mb-6">Nouvelle recette</h1>

      {error && (
        <p className="text-sm text-papaya mb-4">
          Une erreur est survenue, la recette n&apos;a pas pu être créée. Réessaie.
        </p>
      )}

      <RecipeForm action={createRecipe} categories={categories} tags={tags} />
    </main>
  );
}
