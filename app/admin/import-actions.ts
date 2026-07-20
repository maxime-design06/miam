"use server";

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

function extractMetaContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]*property="${property}"[^>]*content="([^"]*)"`, "i"),
    new RegExp(`<meta[^>]*content="([^"]*)"[^>]*property="${property}"`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export interface InstagramPreview {
  imageUrl: string | null;
  caption: string | null;
}

/**
 * Tentative "best effort" de récupération de l'image de couverture et de
 * la légende d'un post/reel Instagram à partir de son lien public.
 *
 * Ça fonctionne en lisant les balises d'aperçu public de la page (les
 * mêmes que celles utilisées quand on colle un lien Instagram dans
 * iMessage ou Slack), sans se connecter à aucun compte. Instagram peut
 * bloquer cet accès à tout moment : dans ce cas, la fonction renvoie
 * simplement des valeurs vides plutôt que de faire échouer tout l'import.
 */
export async function fetchInstagramPreview(url: string): Promise<InstagramPreview> {
  try {
    const pageResponse = await fetch(url, {
      headers: {
        "User-Agent":
          "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      },
    });

    if (!pageResponse.ok) {
      return { imageUrl: null, caption: null };
    }

    const html = await pageResponse.text();
    const ogImage = extractMetaContent(html, "og:image");
    const ogDescription = extractMetaContent(html, "og:description");
    const caption = ogDescription ? decodeHtmlEntities(ogDescription) : null;

    let imageUrl: string | null = null;
    if (ogImage) {
      try {
        const imageResponse = await fetch(ogImage);
        if (imageResponse.ok) {
          const arrayBuffer = await imageResponse.arrayBuffer();
          const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
          const extension = contentType.includes("png") ? "png" : "jpg";

          const supabase = await createClient();
          const path = `import-${Date.now()}.${extension}`;
          const { error: uploadError } = await supabase.storage
            .from("recipe-images")
            .upload(path, Buffer.from(arrayBuffer), { contentType, upsert: true });

          if (!uploadError) {
            const { data } = supabase.storage.from("recipe-images").getPublicUrl(path);
            imageUrl = data.publicUrl;
          }
        }
      } catch (imageError) {
        console.error("Impossible de récupérer l'image de couverture :", imageError);
      }
    }

    return { imageUrl, caption };
  } catch (error) {
    console.error("Impossible de récupérer l'aperçu Instagram :", error);
    return { imageUrl: null, caption: null };
  }
}

export interface ParsedRecipe {
  title: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: "facile" | "moyen" | "difficile";
  categoryName: string | null;
  sections: {
    title: string;
    ingredients: { name: string; quantity: number | null; unit: string | null }[];
    steps: string[];
  }[];
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
  "sections": [
    {
      "title": string (laisse une chaîne vide "" si la recette n'a qu'une seule partie ;
                       ne mets un titre que si le texte distingue clairement plusieurs
                       composants, par exemple "Pour la sauce", "Pour la garniture", etc.),
      "ingredients": [{ "name": string, "quantity": number ou null, "unit": string ou null }],
      "steps": [string, ...] (une chaîne par étape, sans numérotation)
    }
  ],
  "tips": [string, ...] (vide si aucun conseil)
}

Nettoie les emojis et les hashtags. Si une information est absente, fais une estimation
raisonnable plutôt que de laisser un champ vide, sauf pour les temps où 0 est acceptable.
La grande majorité des recettes n'ont qu'une seule partie (un seul élément dans "sections"
avec un titre vide) : ne découpe en plusieurs parties que si c'est vraiment explicite dans
le texte.`;

function extractResponseText(response: {
  text?: string | (() => string);
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}): string {
  if (typeof response.text === "string") return response.text;
  if (typeof response.text === "function") return response.text();
  const candidateText = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (candidateText) return candidateText;
  throw new Error("Réponse inattendue de l'IA.");
}

/**
 * Envoie le texte collé (légende Instagram, etc.) à l'IA (Google Gemini,
 * gratuit pour cet usage) pour en extraire une recette structurée, prête
 * à préremplir le formulaire d'ajout.
 */
export async function parseRecipeFromText(rawText: string): Promise<ParsedRecipe> {
  if (!rawText.trim()) {
    throw new Error("Le texte est vide.");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("La clé GEMINI_API_KEY n'est pas configurée sur le serveur.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: rawText,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
    },
  });

  const text = extractResponseText(response).trim();

  let parsed: ParsedRecipe;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("L'IA n'a pas renvoyé un JSON valide, réessaie.");
  }

  return parsed;
}
