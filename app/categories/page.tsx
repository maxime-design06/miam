import { User } from "lucide-react";
import { getCategories } from "@/lib/recipes";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="max-w-5xl w-full mx-auto px-6 py-8">
      <header className="flex items-center justify-between mb-10">
        <a href="/" className="font-display text-2xl text-papaya">
          miam
        </a>
        <nav className="flex items-center gap-5 text-sm text-foreground">
          <a href="/recettes">Recettes</a>
          <a href="/categories">Catégories</a>
          <a href="/semaine">Cette semaine</a>
          <a href="/admin"><User className="w-4 h-4" /></a>
        </nav>
      </header>

      <h1 className="font-display text-2xl text-foreground mb-6">
        catégories
      </h1>

      {categories.length === 0 ? (
        <p className="text-muted text-sm">Aucune catégorie pour le moment.</p>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((category) => (
            <li key={category.id}>
              <a
                href={`/recettes?categorie=${category.slug}`}
                className="block bg-surface rounded-2xl p-4 font-display text-sm text-foreground hover:opacity-90 transition"
              >
                {category.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
