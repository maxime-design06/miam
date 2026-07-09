import Link from "next/link";
import { Search } from "lucide-react";
import { getRecipes } from "@/lib/recipes";
import { signOut, deleteRecipe } from "@/app/admin/actions";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";

const sortOptions = [
  { value: "recent", label: "plus récentes" },
  { value: "oldest", label: "plus anciennes" },
  { value: "alpha", label: "ordre alphabétique" },
];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: "recent" | "oldest" | "alpha"; error?: string }>;
}) {
  const { q, sort, error } = await searchParams;
  const recipes = await getRecipes({ search: q, sort: sort ?? "recent" });

  return (
    <main className="max-w-3xl w-full mx-auto px-6 py-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-papaya">miam admin</h1>
        <div className="flex items-center gap-4 text-sm text-foreground">
          <Link href="/">Voir le site</Link>
          <form action={signOut}>
            <button type="submit" className="text-muted">
              Se déconnecter
            </button>
          </form>
        </div>
      </header>

      {error && (
        <p className="text-sm text-papaya mb-4">
          Une erreur est survenue, l&apos;action n&apos;a pas pu être effectuée. Réessaie.
        </p>
      )}

      <div className="flex gap-3 mb-6">
        <Link
          href="/admin/recettes/nouvelle"
          className="inline-block px-4 py-2 rounded-full bg-papaya text-white text-sm font-heading font-bold"
        >
          + Ajouter une recette
        </Link>
        <Link
          href="/admin/tags"
          className="inline-block px-4 py-2 rounded-full bg-surface text-foreground text-sm font-heading font-bold"
        >
          Gérer les tags
        </Link>
        <Link
          href="/admin/categories"
          className="inline-block px-4 py-2 rounded-full bg-surface text-foreground text-sm font-heading font-bold"
        >
          Gérer les catégories
        </Link>
      </div>

      {/* Recherche et tri */}
      <form method="get" action="/admin" className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="rechercher par mot-clé..."
            className="w-full h-10 pl-10 pr-4 rounded-full bg-surface text-sm outline-none text-foreground"
          />
        </div>
        <select
          name="sort"
          defaultValue={sort ?? "recent"}
          className="h-10 px-4 rounded-full bg-surface text-sm outline-none text-foreground"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-10 px-4 rounded-full bg-leaf text-white text-sm font-heading font-bold"
        >
          Filtrer
        </button>
      </form>

      {recipes.length === 0 ? (
        <p className="text-muted text-sm">Aucune recette ne correspond.</p>
      ) : (
        <ul className="space-y-2">
          {recipes.map((recipe) => (
            <li
              key={recipe.id}
              className="flex items-center justify-between bg-surface rounded-2xl px-4 py-3"
            >
              <span className="text-sm text-foreground">{recipe.title}</span>
              <div className="flex items-center gap-4 text-sm">
                <Link href={`/admin/recettes/${recipe.id}`} className="text-leaf">
                  Modifier
                </Link>
                <form action={deleteRecipe.bind(null, recipe.id)}>
                  <ConfirmDeleteButton
                    className="text-papaya"
                    confirmMessage={`Supprimer définitivement "${recipe.title}" ? Cette action est irréversible.`}
                  />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
