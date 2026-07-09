import Link from "next/link";
import { getTags } from "@/lib/recipes";
import { createTag, deleteTag } from "@/app/admin/actions";

export default async function TagsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const tags = await getTags();

  return (
    <main className="max-w-lg w-full mx-auto px-6 py-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="font-heading font-bold text-2xl text-papaya">tags</h1>
        <Link href="/admin" className="text-sm text-foreground">
          ← retour
        </Link>
      </header>

      <form action={createTag} className="flex gap-2 mb-6">
        <input
          type="text"
          name="name"
          placeholder="nom du tag (ex : sans gluten)"
          required
          className="flex-1 h-10 px-4 rounded-full bg-surface text-sm outline-none text-foreground"
        />
        <button
          type="submit"
          className="h-10 px-4 rounded-full bg-leaf text-white text-sm font-heading font-bold"
        >
          ajouter
        </button>
      </form>

      {error && (
        <p className="text-sm text-papaya mb-4">
          Ce tag existe peut-être déjà, ou une erreur est survenue.
        </p>
      )}

      {tags.length === 0 ? (
        <p className="text-muted text-sm">Aucun tag pour le moment.</p>
      ) : (
        <ul className="space-y-2">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className="flex items-center justify-between bg-surface rounded-2xl px-4 py-2.5"
            >
              <span className="text-sm text-foreground">{tag.name}</span>
              <form action={deleteTag.bind(null, tag.id)}>
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
