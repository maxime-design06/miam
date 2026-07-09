import { ImportForm } from "@/components/admin/ImportForm";
import { getCategories } from "@/lib/recipes";

export default async function ImportRecipePage() {
  const categories = await getCategories();

  return (
    <main className="max-w-3xl w-full mx-auto px-6 py-8">
      <h1 className="font-display text-2xl text-foreground mb-2">
        importer depuis Instagram
      </h1>
      <p className="text-sm text-muted mb-6">
        Colle le texte d&apos;une légende de post ou de reel, l&apos;IA prépare la recette pour toi.
      </p>
      <ImportForm categories={categories} />
    </main>
  );
}
