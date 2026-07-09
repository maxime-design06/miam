import { SiteHeader } from "@/components/SiteHeader";
import { getCategories } from "@/lib/recipes";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="max-w-5xl w-full mx-auto px-6 py-8">
      <SiteHeader />

      <h1 className="font-heading font-bold text-2xl text-foreground mb-6">
        Catégories
      </h1>

      {categories.length === 0 ? (
        <p className="text-muted text-sm">Aucune catégorie pour le moment.</p>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((category) => (
            <li key={category.id}>
              <a
                href={`/recettes?categorie=${category.slug}`}
                className="block bg-surface rounded-2xl p-4 font-heading font-bold text-sm text-foreground hover:opacity-90 transition"
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
