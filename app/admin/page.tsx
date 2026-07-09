import Link from "next/link";
import { getRecipes } from "@/lib/recipes";
import { signOut, deleteRecipe } from "@/app/admin/actions";

export default async function AdminPage() {
  const recipes = await getRecipes();

  return (
    <main className="max-w-3xl w-full mx-auto px-6 py-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-papaya">miam admin</h1>
        <div className="flex items-center gap-4 text-sm text-foreground">
          <Link href="/">voir le site</Link>
          <form action={signOut}>
            <button type="submit" className="text-muted">
              se déconnecter
            </button>
          </form>
        </div>
      </header>

      <div className="flex gap-3 mb-6">
        <Link
          href="/admin/recettes/nouvelle"
          className="inline-block px-4 py-2 rounded-full bg-papaya text-cream text-sm font-display"
        >
          + ajouter une recette
        </Link>
        <Link
          href="/admin/recettes/importer"
          className="inline-block px-4 py-2 rounded-full bg-surface text-foreground text-sm font-display"
        >
          importer depuis Instagram
        </Link>
      </div>

      {recipes.length === 0 ? (
        <p className="text-muted text-sm">Aucune recette pour le moment.</p>
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
                  modifier
                </Link>
                <form action={deleteRecipe.bind(null, recipe.id)}>
                  <button type="submit" className="text-papaya">
                    supprimer
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
