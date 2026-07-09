"use server";

import Anthropic from "@anthropic-ai/sdk";

export interface ParsedRecipe {
  title: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: "facile" | "moyen" | "difficile";
  categoryName: string | null;
  ingredients: { name: string; quantity: number | null; unit: string | null }[];
  steps: string[];
  tips: string[];
}

const SYSTEM_PROMPT = `Tu extrais une recette de cuisine à partir d'un texte de légende Instagram
(souvent désordonné, avec des emojis, hashtags, et une mise en forme libre).

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, sans balises markdown,
respectant exactement cette forme :

{
  "title": string,
  "description": string (une phrase courte, sans emoji),
  "prepTimeMinutes": number (0 si inconnu),
  "cookTimeMinutes": number (0 si inconnu),
  "servings": number (4 si inconnu),
  "difficulty": "facile" | "moyen" | "difficile" (déduis-le si non précisé),
  "categoryName": string ou null (une valeur parmi "Entrées", "Plats", "Desserts", ou null si incertain),
  "ingredients": [{ "name": string, "quantity": number ou null, "unit": string ou null }],
  "steps": [string, ...] (une chaîne par étape, sans numérotation),
  "tips": [string, ...] (vide si aucun conseil)
}

Nettoie les emojis et les hashtags. Si une information est absente, fais une estimation
raisonnable plutôt que de laisser un champ vide, sauf pour les temps où 0 est acceptable.`;

/**
 * Envoie le texte collé (légende Instagram, etc.) à l'IA pour en extraire
 * une recette structurée, prête à préremplir le formulaire d'ajout.
 */
export async function parseRecipeFromText(rawText: string): Promise<ParsedRecipe> {
  if (!rawText.trim()) {
    throw new Error("Le texte est vide.");
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "La clé ANTHROPIC_API_KEY n'est pas configurée sur le serveur."
    );
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: rawText }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Réponse inattendue de l'IA.");
  }

  const cleaned = textBlock.text.replace(/```json|```/g, "").trim();

  let parsed: ParsedRecipe;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("L'IA n'a pas renvoyé un JSON valide, réessaie.");
  }

  return parsed;
}
