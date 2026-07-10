import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Users, ChefHat, Soup, Cake, Salad, Pencil } from "lucide-react";
import { ExternalLink } from "lucide-react";
import { getRecipeBySlug, isLoggedIn } from "@/lib/recipes";
import { getWeeklyEntryForRecipe } from "@/lib/weekly";
import { WeeklyToggleButton } from "@/components/WeeklyToggleButton";
import { SiteHeader } from "@/components/SiteHeader";
import { accentBg, accentIconColor } from "@/components/RecipeCard";
import type { Recipe } from "@/types/recipe";

const categoryIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  Entrées: Soup,
  Plats: ChefHat,
  Desserts: Cake,
  Rapide: Salad,
};

function formatQuantity(quantity: number | null, unit: string | null, name: string) {
  if (quantity === null) return name;
  const unitLabel = unit ? ` ${unit}` : "";
  return `${quantity}${unitLabel} de ${name}`;
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [recipe, loggedIn] = await Promise.all([getRecipeBySlug(slug), isLoggedIn()]);

  if (!recipe) {
    notFound();
  }

  const weeklyEntry = loggedIn ? await getWeeklyEntryForRecipe(recipe.id) : null;

  const Icon = categoryIcon[recipe.category] ?? ChefHat;
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return (
    <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <SiteHeader />

      {/* Bandeau visuel */}
      {recipe.imageUrl ? (
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-64 object-cover rounded-2xl mb-6"
        />
      ) : (
        <div
          className={`h-40 rounded-2xl flex items-center justify-center mb-6 ${
            accentBg[recipe.accentColor as Recipe["accentColor"]]
          }`}
        >
          <Icon
            className={`w-12 h-12 ${accentIconColor[recipe.accentColor as Recipe["accentColor"]]}`}
          />
        </div>
      )}

      <p className="text-xs text-muted uppercase tracking-wide mb-2">
        {recipe.category}
      </p>
      <div className="mb-3">
        <h1 className="font-display text-2xl sm:text-3xl text-foreground mb-2 break-words">
          {recipe.title}
        </h1>
        {loggedIn && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <WeeklyToggleButton
              recipeId={recipe.id}
              slug={recipe.slug}
              initialEntryId={weeklyEntry?.id ?? null}
            />
            <Link
              href={`/admin/recettes/${recipe.id}`}
              className="flex items-center gap-1.5 text-sm text-leaf"
            >
              <Pencil className="w-3.5 h-3.5" />
              Modifier
            </Link>
          </div>
        )}
      </div>
      {recipe.description && (
        <p className="text-muted text-sm mb-6">{recipe.description}</p>
      )}

      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {recipe.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-xs px-3 py-1 rounded-full bg-surface text-foreground"
            >
              {tag.name.toLowerCase()}
            </span>
          ))}
        </div>
      )}

      {recipe.sourceUrl && (
        <a
          href={recipe.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-leaf mb-6"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Voir la publication d&apos;origine
        </a>
      )}

      {/* Informations pratiques */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground mb-10 bg-surface rounded-2xl p-4">
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-muted" />
          {totalTime} min
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-muted" />
          {recipe.servings} pers.
        </span>
        <span className="capitalize">{recipe.difficulty}</span>
      </div>

      {recipe.sections.map((section, index) => (
        <div key={section.id ?? index} className="mb-10">
          {section.title && (
            <h2 className="font-heading font-bold text-base text-papaya mb-4">
              {section.title}
            </h2>
          )}
          <div className="grid md:grid-cols-[1fr_1.6fr] gap-10">
            {/* Ingrédients */}
            <section>
              <h3 className="font-heading font-bold text-lg text-foreground mb-4">
                Ingrédients
              </h3>
              {section.ingredients.length === 0 ? (
                <p className="text-muted text-sm">Aucun ingrédient renseigné.</p>
              ) : (
                <ul className="space-y-2 text-sm text-foreground">
                  {section.ingredients.map((ingredient) => (
                    <li key={ingredient.id} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-leaf mt-1.5 shrink-0" />
                      {formatQuantity(ingredient.quantity, ingredient.unit, ingredient.name)}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Étapes */}
            <section>
              <h3 className="font-heading font-bold text-lg text-foreground mb-4">
                Préparation
              </h3>
              {section.steps.length === 0 ? (
                <p className="text-muted text-sm">Aucune étape renseignée.</p>
              ) : (
                <ol className="space-y-4">
                  {section.steps.map((step) => (
                    <li key={step.id} className="flex gap-3 text-sm text-foreground">
                      <span className="font-heading font-bold text-papaya shrink-0">
                        {step.stepNumber}
                      </span>
                      <p>{step.description}</p>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </div>
      ))}

      {/* Conseils */}
      {recipe.tips.length > 0 && (
        <section className="mt-10 bg-surface rounded-2xl p-5">
          <h2 className="font-heading font-bold text-lg text-foreground mb-3">
            Conseils
          </h2>
          <ul className="space-y-2 text-sm text-foreground">
            {recipe.tips.map((tip) => (
              <li key={tip.id}>{tip.tip}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
