import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { RecipeCard } from "@/components/RecipeCard";
import { CategoryPills } from "@/components/CategoryPills";
import { SiteHeader } from "@/components/SiteHeader";
import { getRecipesPaginated, getCategories } from "@/lib/recipes";

export default async function RecettesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categorie?: string; page?: string }>;
}) {
  const { q, categorie, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const [{ recipes, total, totalPages }, categories] = await Promise.all([
    getRecipesPaginated({ search: q, categorySlug: categorie, page: currentPage }),
    getCategories(),
  ]);

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categorie) params.set("categorie", categorie);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return `/recettes${query ? `?${query}` : ""}`;
  }

  return (
    <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <SiteHeader />

      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h1 className="font-heading font-bold text-2xl text-foreground">
          Toutes les recettes
        </h1>
        {total > 0 && (
          <span className="text-sm text-muted">
            {total} recette{total > 1 ? "s" : ""}
          </span>
        )}
      </div>

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
        <>
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </section>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 text-sm">
              {currentPage > 1 ? (
                <Link
                  href={pageHref(currentPage - 1)}
                  className="flex items-center gap-1 text-foreground"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </Link>
              ) : (
                <span className="flex items-center gap-1 text-muted opacity-50">
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </span>
              )}

              <span className="text-muted">
                Page {currentPage} / {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={pageHref(currentPage + 1)}
                  className="flex items-center gap-1 text-foreground"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <span className="flex items-center gap-1 text-muted opacity-50">
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
