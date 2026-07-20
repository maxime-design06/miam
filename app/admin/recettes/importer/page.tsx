import { ImportForm } from "@/components/admin/ImportForm";
import { getCategories, getTags, getPopularIngredientNames } from "@/lib/recipes";

export default async function ImportRecipePage() {
  const [categories, tags, ingredientSuggestions] = await Promise.all([
    getCategories(),
    getTags(),
    getPopularIngredientNames(),
  ]);

  return (
    <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="font-heading font-bold text-2xl text-foreground mb-2">
        Importer depuis Instagram
      </h1>
      <p className="text-sm text-muted mb-6">
        Colle un lien de post/reel et/ou le texte de sa légende, l&apos;IA prépare la recette pour
        toi.
      </p>
      <ImportForm
        categories={categories}
        tags={tags}
        ingredientSuggestions={ingredientSuggestions}
      />
    </main>
  );
}
