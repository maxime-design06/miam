import Link from "next/link";
import { Search } from "lucide-react";
import { RecipeCard } from "@/components/RecipeCard";
import { CategoryPills } from "@/components/CategoryPills";
import { SiteHeader } from "@/components/SiteHeader";
import {
  getRecipesPaginated,
  getRecipesByTagSlug,
  getRecentlyEatenRecipes,
  getForgottenRecipes,
  getCategories,
  isLoggedIn,
} from "@/lib/recipes";
import { getMealPeriod, getCurrentSeason } from "@/lib/time-context";

export default async function Home() {
  const mealPeriod = getMealPeriod();
  const season = getCurrentSeason();

  const [
    { recipes: latest },
    categories,
    mealSuggestions,
    seasonSuggestions,
    recentlyEaten,
    forgotten,
    loggedIn,
  ] = await Promise.all([
    getRecipesPaginated({ pageSize: 4 }),
    getCategories(),
    getRecipesByTagSlug(mealPeriod.slug, 4),
    getRecipesByTagSlug(season.slug, 4),
    getRecentlyEatenRecipes(4),
    getForgottenRecipes(4),
    isLoggedIn(),
  ]);

  return (
    <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <SiteHeader />

      {/* Hero + recherche (redirige vers le catalogue avec le résultat) */}
      <section className="text-center py-6 mb-10">
        <h1 className="font-display text-xl sm:text-3xl md:text-4xl text-foreground mb-3 leading-relaxed sm:whitespace-nowrap">
          on cuisine quoi aujourd&apos;hui ?
        </h1>
        <p className="text-muted text-sm mb-6">
          plus de 1000 recettes, toutes au même endroit
        </p>
        <form method="get" action="/recettes" className="max-w-md mx-auto relative">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="q"
            placeholder="rechercher une recette, un ingrédient..."
            className="w-full h-10 pl-10 pr-4 rounded-full bg-surface text-sm outline-none placeholder:text-muted"
          />
        </form>
      </section>

      {/* Filtres */}
      <CategoryPills categories={categories} />

      {/* Dernières recettes ajoutées */}
      <h2 className="font-heading font-bold text-lg text-foreground mb-4">
        Ajoutées récemment
      </h2>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {latest.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </section>
      <div className="text-center mb-12">
        <Link href="/recettes" className="text-sm text-leaf">
          Voir toutes les recettes →
        </Link>
      </div>

      {/* Suggestion selon le moment de la journée */}
      {mealSuggestions.length > 0 ? (
        <>
          <h2 className="font-heading font-bold text-lg text-foreground mb-4">
            Idée pour {mealPeriod.label}
          </h2>
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {mealSuggestions.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </section>
        </>
      ) : (
        loggedIn && (
          <p className="text-sm text-muted mb-12">
            Aucune recette taguée « {mealPeriod.slug} » pour l&apos;instant. Ajoute ce tag à
            quelques recettes pour voir des suggestions pour {mealPeriod.label} ici.
          </p>
        )
      )}

      {/* Suggestion selon la saison */}
      {seasonSuggestions.length > 0 ? (
        <>
          <h2 className="font-heading font-bold text-lg text-foreground mb-4">
            Recettes de saison : {season.label}
          </h2>
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {seasonSuggestions.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </section>
        </>
      ) : (
        loggedIn && (
          <p className="text-sm text-muted mb-12">
            Aucune recette taguée « {season.slug} » pour l&apos;instant. Ajoute ce tag à quelques
            recettes pour voir des suggestions de saison ici.
          </p>
        )
      )}

      {/* Mangées récemment */}
      {recentlyEaten.length > 0 && (
        <>
          <h2 className="font-heading font-bold text-lg text-foreground mb-4">
            Mangées récemment
          </h2>
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {recentlyEaten.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </section>
        </>
      )}

      {/* Recettes oubliées */}
      {forgotten.length > 0 && (
        <>
          <h2 className="font-heading font-bold text-lg text-foreground mb-4">
            Ça fait longtemps...
          </h2>
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {forgotten.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </section>
        </>
      )}
    </main>
  );
}
