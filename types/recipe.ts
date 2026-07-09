export type Difficulty = "facile" | "moyen" | "difficile";

export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: Difficulty;
  category: string;
  /** Couleur d'accent de la carte, utilisée quand il n'y a pas encore d'image */
  accentColor: "papaya" | "mango" | "pulp" | "kiwi" | "leaf" | "honey";
}
