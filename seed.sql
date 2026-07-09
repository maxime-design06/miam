import type { Recipe } from "@/types/recipe";

/**
 * Données temporaires, uniquement pour construire l'interface.
 * Seront remplacées par de vraies requêtes Supabase dès que
 * le projet Supabase sera prêt.
 */
export const mockRecipes: Recipe[] = [
  {
    id: "1",
    title: "Velouté de potimarron",
    slug: "veloute-de-potimarron",
    description: "Un velouté d'automne réconfortant, doux et légèrement épicé.",
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    servings: 4,
    difficulty: "facile",
    category: "Entrées",
    accentColor: "papaya",
  },
  {
    id: "2",
    title: "Risotto aux champignons",
    slug: "risotto-aux-champignons",
    description: "Un risotto crémeux aux champignons de saison.",
    prepTimeMinutes: 15,
    cookTimeMinutes: 30,
    servings: 4,
    difficulty: "moyen",
    category: "Plats",
    accentColor: "pulp",
  },
  {
    id: "3",
    title: "Fondant au chocolat",
    slug: "fondant-au-chocolat",
    description: "Un cœur coulant au chocolat noir, simple et efficace.",
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 6,
    difficulty: "facile",
    category: "Desserts",
    accentColor: "mango",
  },
  {
    id: "4",
    title: "Salade de lentilles",
    slug: "salade-de-lentilles",
    description: "Fraîche, rapide et pleine de protéines végétales.",
    prepTimeMinutes: 20,
    cookTimeMinutes: 0,
    servings: 2,
    difficulty: "facile",
    category: "Entrées",
    accentColor: "kiwi",
  },
];

export const mockCategories = ["Toutes", "Entrées", "Plats", "Desserts", "Rapide"];
