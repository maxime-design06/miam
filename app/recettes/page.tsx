import { Search } from "lucide-react";
import { RecipeCard } from "@/components/RecipeCard";
import { CategoryPills } from "@/components/CategoryPills";
import { SiteHeader } from "@/components/SiteHeader";
import { getRecipes, getCategories } from "@/lib/recipes";

export default async function RecettesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categorie?: string }>;
}) {
  const { q, categorie } = await searchParams;

  const [recipes, categories] = await Promise.all([
    getRecipes({ search: q, categorySlug: categorie }),
    getCategories(),
  ]);

  return (
    <main className="max-w-5xl w-full mx-auto px-6 py-8">
      <SiteHeader />

      <h1 className="font-heading font-bold text-2xl text-foreground mb-6">
        Toutes les recettes
      </h1>

      <form method="get" action="/recettes" className="max-w-md relative mb-6">
        {categorie && <input type="hidden" name="categorie" value={categorie} />}
        <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="rechercher une recette, un ingrédient..."
          className="w-full h-10 pl-10 pr-4 rounded-full bg-surface text-sm outline-none placeholder:text-muted"
        />
      </form>

      <CategoryPills categories={categories} activeSlug={categorie} searchTerm={q} />

      {recipes.length === 0 ? (
        <p className="text-muted text-sm">
          Aucune recette ne correspond à ta recherche.
        </p>
      ) : (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </section>
      )}
    </main>
  );
}
