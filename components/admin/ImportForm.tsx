"use client";

import { useState } from "react";
import {
  parseRecipeFromText,
  fetchInstagramPreview,
  type ParsedRecipe,
} from "@/app/admin/import-actions";
import { createRecipe } from "@/app/admin/actions";
import { RecipeForm } from "@/components/admin/RecipeForm";

interface ImportFormProps {
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  ingredientSuggestions: string[];
}

interface ParsedWithMedia extends ParsedRecipe {
  imageUrl: string | null;
  sourceUrl: string | null;
}

export function ImportForm({ categories, tags, ingredientSuggestions }: ImportFormProps) {
  const [instagramUrl, setInstagramUrl] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageNotice, setImageNotice] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedWithMedia | null>(null);

  const canAnalyze = Boolean(instagramUrl.trim() || text.trim());

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setImageNotice(null);
    try {
      const url = instagramUrl.trim();
      let caption = text.trim();
      let imageUrl: string | null = null;

      if (url) {
        const preview = await fetchInstagramPreview(url);
        imageUrl = preview.imageUrl;
        if (!caption && preview.caption) caption = preview.caption;

        if (!imageUrl) {
          setImageNotice(
            "Je n'ai pas réussi à récupérer automatiquement l'image de couverture (Instagram bloque parfois cet accès). Tu peux l'ajouter toi-même plus bas."
          );
        }
      }

      if (caption) {
        const result = await parseRecipeFromText(caption);
        setParsed({ ...result, imageUrl, sourceUrl: url || null });
      } else {
        setParsed({
          title: "",
          description: "",
          prepTimeMinutes: 0,
          cookTimeMinutes: 0,
          servings: 4,
          difficulty: "facile",
          categoryName: null,
          sections: [{ title: "", ingredients: [], steps: [] }],
          tips: [],
          imageUrl,
          sourceUrl: url || null,
        });
        setImageNotice(
          (prev) =>
            prev ??
            "Je n'ai pas trouvé de légende à analyser automatiquement. Complète le formulaire ci-dessous à la main."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (parsed) {
    const matchedCategory = categories.find(
      (c) => c.name.toLowerCase() === parsed.categoryName?.toLowerCase()
    );

    return (
      <div>
        <p className="text-sm text-leaf mb-2">
          Voici ce que l&apos;IA a compris. Vérifie et ajuste avant d&apos;enregistrer.
        </p>
        {imageNotice && <p className="text-sm text-muted mb-4">{imageNotice}</p>}
        <RecipeForm
          key={JSON.stringify(parsed)}
          action={createRecipe}
          categories={categories}
          tags={tags}
          ingredientSuggestions={ingredientSuggestions}
          initial={{
            title: parsed.title,
            slug: "",
            description: parsed.description,
            imageUrl: parsed.imageUrl,
            sourceUrl: parsed.sourceUrl,
            prepTimeMinutes: parsed.prepTimeMinutes,
            cookTimeMinutes: parsed.cookTimeMinutes,
            servings: parsed.servings,
            difficulty: parsed.difficulty,
            categoryId: matchedCategory?.id ?? null,
            sections: parsed.sections.map((section) => ({
              title: section.title,
              ingredients: section.ingredients,
              steps: section.steps.map((description) => ({ description })),
            })),
            tips: parsed.tips.map((tip) => ({ tip })),
          }}
        />
        <button
          type="button"
          onClick={() => {
            setParsed(null);
            setImageNotice(null);
          }}
          className="mt-4 text-sm text-muted"
        >
          ← Recommencer avec un autre lien ou un autre texte
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-muted block mb-2">
          lien du post ou reel Instagram (optionnel)
        </label>
        <input
          type="url"
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          placeholder="https://www.instagram.com/reel/..."
          className="w-full h-10 px-4 rounded-full bg-surface text-sm outline-none text-foreground"
        />
        <p className="text-xs text-muted mt-1">
          Je tenterai de récupérer automatiquement l&apos;image de couverture (et la légende si tu
          ne colles pas de texte ci-dessous). Ça ne fonctionne pas toujours, Instagram bloque
          parfois cet accès.
        </p>
      </div>

      <div>
        <label className="text-sm text-muted block mb-2">
          texte de la légende (colle-le ici si tu l&apos;as, sinon je tente de le récupérer via le
          lien ci-dessus)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Colle le texte ici..."
          className="w-full px-4 py-3 rounded-2xl bg-surface text-sm outline-none text-foreground"
        />
      </div>

      {error && <p className="text-sm text-papaya">{error}</p>}

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={loading || !canAnalyze}
        className="px-6 h-11 rounded-full bg-leaf text-white text-sm font-heading font-bold disabled:opacity-50"
      >
        {loading ? "Analyse en cours..." : "Analyser"}
      </button>
    </div>
  );
}
