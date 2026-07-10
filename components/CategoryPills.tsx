import Link from "next/link";

interface CategoryPillsProps {
  categories: { name: string; slug: string }[];
  activeSlug?: string;
  searchTerm?: string;
}

export function CategoryPills({ categories, activeSlug, searchTerm }: CategoryPillsProps) {
  function buildHref(slug?: string) {
    const params = new URLSearchParams();
    if (searchTerm) params.set("q", searchTerm);
    if (slug) params.set("categorie", slug);
    const query = params.toString();
    return `/recettes${query ? `?${query}` : ""}`;
  }

  const isAllActive = !activeSlug;

  return (
    <div className="flex gap-2 overflow-x-auto flex-nowrap mb-8 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
      <Link
        href={buildHref(undefined)}
        className={`shrink-0 whitespace-nowrap text-sm px-3.5 py-1.5 rounded-full transition ${
          isAllActive ? "bg-leaf text-white" : "bg-surface text-foreground hover:opacity-80"
        }`}
      >
        toutes
      </Link>
      {categories.map((category) => {
        const isActive = category.slug === activeSlug;
        return (
          <Link
            key={category.slug}
            href={buildHref(category.slug)}
            className={`shrink-0 whitespace-nowrap text-sm px-3.5 py-1.5 rounded-full transition ${
              isActive ? "bg-leaf text-white" : "bg-surface text-foreground hover:opacity-80"
            }`}
          >
            {category.name.toLowerCase()}
          </Link>
        );
      })}
    </div>
  );
}
