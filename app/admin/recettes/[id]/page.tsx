import { notFound } from "next/navigation";
import { RecipeForm } from "@/components/admin/RecipeForm";
import { updateRecipe, deleteRecipe } from "@/app/admin/actions";
import { getCategories, getTags, getRecipeForAdmin } from "@/lib/recipes";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [recipe, categories, tags] = await Promise.all([
    getRecipeForAdmin(id),
    getCategories(),
    getTags(),
  ]);

  if (!recipe) {
    notFound();
  }

  return (
    <main className="max-w-3xl w-full mx-auto px-6 py-8">
      <h1 className="font-heading font-bold text-2xl text-foreground mb-6">Modifier la recette</h1>
      <RecipeForm
        action={updateRecipe.bind(null, id)}
        categories={categories}
        tags={tags}
        initial={recipe}
      />

      <form action={deleteRecipe.bind(null, id)} className="mt-8 pt-6 border-t border-surface">
        <button type="submit" className="text-sm text-papaya">
          Supprimer cette recette
        </button>
      </form>
    </main>
  );
}
