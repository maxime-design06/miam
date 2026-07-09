import Link from "next/link";
import { getCategories } from "@/lib/recipes";
import { createCategory, deleteCategory } from "@/app/admin/actions";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const categories = await getCategories();

  return (
    <main className="max-w-lg w-full mx-auto px-6 py-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-papaya">catégories</h1>
        <Link href="/admin" className="text-sm text-foreground">
          ← retour
        </Link>
      </header>

      <form action={createCategory} className="flex gap-2 mb-6">
        <input
          type="text"
          name="name"
          placeholder="nom de la catégorie (ex : boissons)"
          required
          className="flex-1 h-10 px-4 rounded-full bg-surface text-sm outline-none text-foreground"
        />
        <button
          type="submit"
          className="h-10 px-4 rounded-full bg-leaf text-cream text-sm font-display"
        >
          ajouter
        </button>
      </form>

      {error && (
        <p className="text-sm text-papaya mb-4">
          Cette catégorie existe peut-être déjà, ou une erreur est survenue.
        </p>
      )}

      {categories.length === 0 ? (
        <p className="text-muted text-sm">Aucune catégorie pour le moment.</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between bg-surface rounded-2xl px-4 py-2.5"
            >
              <span className="text-sm text-foreground">{category.name}</span>
              <form action={deleteCategory.bind(null, category.id)}>
                <button type="submit" className="text-sm text-papaya">
                  supprimer
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
