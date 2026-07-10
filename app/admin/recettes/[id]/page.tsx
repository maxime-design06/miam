import { notFound } from "next/navigation";
import { RecipeForm } from "@/components/admin/RecipeForm";
import { updateRecipe, deleteRecipe } from "@/app/admin/actions";
import { getCategories, getTags, getRecipeForAdmin, getPopularIngredientNames } from "@/lib/recipes";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";

export default async function EditRecipePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const [recipe, categories, tags, ingredientSuggestions] = await Promise.all([
    getRecipeForAdmin(id),
    getCategories(),
    getTags(),
    getPopularIngredientNames(),
  ]);

  if (!recipe) {
    notFound();
  }

  return (
    <main className="max-w-3xl w-full mx-auto px-6 py-8">
      <h1 className="font-heading font-bold text-2xl text-foreground mb-6">Modifier la recette</h1>

      {error && (
        <p className="text-sm text-papaya mb-4">
          Une erreur est survenue, tes modifications n&apos;ont pas pu être enregistrées. Réessaie.
        </p>
      )}

      <RecipeForm
        action={updateRecipe.bind(null, id)}
        categories={categories}
        tags={tags}
        ingredientSuggestions={ingredientSuggestions}
        initial={recipe}
      />

      <form action={deleteRecipe.bind(null, id)} className="mt-8 pt-6 border-t border-surface">
        <ConfirmDeleteButton
          className="text-sm text-papaya"
          label="Supprimer cette recette"
          confirmMessage={`Supprimer définitivement "${recipe.title}" ? Cette action est irréversible.`}
        />
      </form>
    </main>
  );
}
