import Link from "next/link";
import { Clock, Soup, ChefHat, Cake, Salad } from "lucide-react";
import type { Recipe } from "@/types/recipe";

const accentBg: Record<Recipe["accentColor"], string> = {
  papaya: "bg-papaya",
  mango: "bg-mango",
  pulp: "bg-pulp",
  kiwi: "bg-kiwi",
  leaf: "bg-leaf",
  honey: "bg-honey",
};

// Sur fond clair (jaune/pulp), on assombrit l'icône plutôt que
// de la mettre en blanc, pour garder un bon contraste.
const accentIconColor: Record<Recipe["accentColor"], string> = {
  papaya: "text-cream",
  mango: "text-cream",
  pulp: "text-[#5C3A0F]",
  kiwi: "text-[#2E3A19]",
  leaf: "text-cream",
  honey: "text-cream",
};

const categoryIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  Entrées: Soup,
  Plats: ChefHat,
  Desserts: Cake,
  Rapide: Salad,
};

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const Icon = categoryIcon[recipe.category] ?? ChefHat;
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return (
    <Link
      href={`/recettes/${recipe.slug}`}
      className="block bg-surface rounded-2xl overflow-hidden hover:opacity-90 transition"
    >
      <div
        className={`h-24 flex items-center justify-center ${accentBg[recipe.accentColor]}`}
      >
        <Icon className={`w-7 h-7 ${accentIconColor[recipe.accentColor]}`} />
      </div>
      <div className="p-3">
        <p className="font-display text-sm text-foreground mb-1.5">
          {recipe.title}
        </p>
        <div className="flex gap-2.5 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {totalTime} min
          </span>
          <span>{recipe.difficulty}</span>
        </div>
      </div>
    </Link>
  );
}
