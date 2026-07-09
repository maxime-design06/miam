import Link from "next/link";
import { getWeeklyList } from "@/lib/weekly";
import { isLoggedIn } from "@/lib/recipes";
import {
  removeFromWeeklyList,
  setWeeklyField,
  clearWeeklyList,
  addCustomWeeklyEntry,
} from "@/app/semaine/actions";
import { AutoSubmitCheckbox } from "@/components/AutoSubmitCheckbox";
import { SiteHeader } from "@/components/SiteHeader";

const statusFields = [
  { field: "isCooked" as const, key: "is_cooked" as const, label: "Cuisinée" },
  { field: "isEaten" as const, key: "is_eaten" as const, label: "Mangée" },
  { field: "hasLeftovers" as const, key: "has_leftovers" as const, label: "Restes" },
];

export default async function SemainePage() {
  const [entries, loggedIn] = await Promise.all([getWeeklyList(), isLoggedIn()]);

  return (
    <main className="max-w-3xl w-full mx-auto px-6 py-8">
      <SiteHeader />

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-2xl text-foreground">Cette semaine</h1>
        <span className="text-sm text-muted">
          {entries.length} recette{entries.length > 1 ? "s" : ""}
        </span>
      </div>

      {loggedIn && (
        <form action={addCustomWeeklyEntry} className="flex gap-2 mb-6">
          <input
            type="text"
            name="title"
            placeholder="ex : pâtes sauce tomate (sans recette liée)"
            className="flex-1 h-10 px-4 rounded-full bg-surface text-sm outline-none text-foreground"
          />
          <button
            type="submit"
            className="h-10 px-4 rounded-full bg-leaf text-white text-sm font-heading font-bold"
          >
            Ajouter
          </button>
        </form>
      )}

      {loggedIn && entries.length > 0 && (
        <form action={clearWeeklyList} className="mb-6">
          <button type="submit" className="text-sm text-papaya">
            Vider la liste
          </button>
        </form>
      )}

      {entries.length === 0 ? (
        <p className="text-muted text-sm">
          Aucune recette pour cette semaine. Ajoute-en depuis une fiche recette, ou juste un texte
          libre ci-dessus.
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="bg-surface rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4"
            >
              {entry.slug ? (
                <Link
                  href={`/recettes/${entry.slug}`}
                  className="font-heading font-bold text-sm text-foreground flex-1"
                >
                  {entry.title}
                </Link>
              ) : (
                <span className="font-heading font-bold text-sm text-foreground flex-1">
                  {entry.title}
                </span>
              )}

              <div className="flex items-center gap-4 text-xs">
                {statusFields.map(({ field, key, label }) => {
                  const value = entry[field];
                  if (!loggedIn) {
                    return (
                      <span
                        key={key}
                        className={`flex items-center gap-1.5 ${
                          value ? "text-leaf" : "text-muted"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            value ? "bg-leaf" : "bg-muted"
                          }`}
                        />
                        {label}
                      </span>
                    );
                  }
                  return (
                    <AutoSubmitCheckbox
                      key={key}
                      action={setWeeklyField.bind(null, entry.id, entry.recipeId, key)}
                      defaultChecked={value}
                      label={label}
                    />
                  );
                })}
              </div>

              {loggedIn && (
                <form action={removeFromWeeklyList.bind(null, entry.id, entry.slug)}>
                  <button type="submit" className="text-xs text-papaya">
                    Retirer
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
