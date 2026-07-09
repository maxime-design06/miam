import { notFound } from "next/navigation";
import { Clock, Users, ChefHat, Soup, Cake, Salad, User } from "lucide-react";
import { getRecipeBySlug } from "@/lib/recipes";
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
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  const Icon = categoryIcon[recipe.category] ?? ChefHat;
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return (
    <main className="max-w-3xl w-full mx-auto px-6 py-8">
      <header className="flex items-center justify-between mb-10">
        <a href="/" className="font-display text-2xl text-papaya">
          miam
        </a>
        <nav className="flex items-center gap-5 text-sm text-foreground">
          <a href="/recettes">Recettes</a>
          <a href="/categories">Catégories</a>
          <a href="/admin"><User className="w-4 h-4" /></a>
        </nav>
      </header>

      {/* Bandeau visuel */}
      <div
        className={`h-40 rounded-2xl flex items-center justify-center mb-6 ${
          accentBg[recipe.accentColor as Recipe["accentColor"]]
        }`}
      >
        <Icon className={`w-12 h-12 ${accentIconColor[recipe.accentColor as Recipe["accentColor"]]}`} />
      </div>

      <p className="text-xs text-muted uppercase tracking-wide mb-2">
        {recipe.category}
      </p>
      <h1 className="font-display text-3xl text-foreground mb-3">
        {recipe.title}
      </h1>
      {recipe.description && (
        <p className="text-muted text-sm mb-6">{recipe.description}</p>
      )}

      {/* Informations pratiques */}
      <div className="flex gap-6 text-sm text-foreground mb-10 bg-surface rounded-2xl p-4">
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

      <div className="grid md:grid-cols-[1fr_1.6fr] gap-10">
        {/* Ingrédients */}
        <section>
          <h2 className="font-display text-lg text-foreground mb-4">
            ingrédients
          </h2>
          {recipe.ingredients.length === 0 ? (
            <p className="text-muted text-sm">Aucun ingrédient renseigné.</p>
          ) : (
            <ul className="space-y-2 text-sm text-foreground">
              {recipe.ingredients.map((ingredient) => (
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
          <h2 className="font-display text-lg text-foreground mb-4">
            préparation
          </h2>
          {recipe.steps.length === 0 ? (
            <p className="text-muted text-sm">Aucune étape renseignée.</p>
          ) : (
            <ol className="space-y-4">
              {recipe.steps.map((step) => (
                <li key={step.id} className="flex gap-3 text-sm text-foreground">
                  <span className="font-display text-papaya shrink-0">
                    {step.stepNumber}
                  </span>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {/* Conseils */}
      {recipe.tips.length > 0 && (
        <section className="mt-10 bg-surface rounded-2xl p-5">
          <h2 className="font-display text-lg text-foreground mb-3">
            conseils
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
