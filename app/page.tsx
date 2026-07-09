import { Search, User } from "lucide-react";
import { RecipeCard } from "@/components/RecipeCard";
import { CategoryPills } from "@/components/CategoryPills";
import { getRecipes, getCategories } from "@/lib/recipes";

export default async function Home() {
  const [recipes, categories] = await Promise.all([getRecipes(), getCategories()]);

  return (
    <main className="max-w-5xl w-full mx-auto px-6 py-8">
      {/* En-tête */}
      <header className="flex items-center justify-between mb-10">
        <span className="font-display text-2xl text-papaya">miam</span>
        <nav className="flex items-center gap-5 text-sm text-foreground">
          <a href="/recettes">Recettes</a>
          <a href="/categories">Catégories</a>
          <User className="w-4 h-4" />
        </nav>
      </header>

      {/* Hero + recherche (redirige vers le catalogue avec le résultat) */}
      <section className="text-center py-6 mb-10">
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-3 leading-relaxed">
          on cuisine quoi,
          <br />
          aujourd&apos;hui ?
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

      {/* Grille de recettes */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </section>
    </main>
  );
}
