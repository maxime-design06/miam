"use client";

import { useState } from "react";
import { parseRecipeFromText, type ParsedRecipe } from "@/app/admin/import-actions";
import { createRecipe } from "@/app/admin/actions";
import { RecipeForm } from "@/components/admin/RecipeForm";

interface ImportFormProps {
  categories: { id: string; name: string }[];
}

export function ImportForm({ categories }: ImportFormProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedRecipe | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const result = await parseRecipeFromText(text);
      setParsed(result);
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
        <p className="text-sm text-leaf mb-4">
          Voici ce que l&apos;IA a compris. Vérifie et ajuste avant d&apos;enregistrer.
        </p>
        <RecipeForm
          key={JSON.stringify(parsed)}
          action={createRecipe}
          categories={categories}
          initial={{
            title: parsed.title,
            slug: "",
            description: parsed.description,
            prepTimeMinutes: parsed.prepTimeMinutes,
            cookTimeMinutes: parsed.cookTimeMinutes,
            servings: parsed.servings,
            difficulty: parsed.difficulty,
            categoryId: matchedCategory?.id ?? null,
            ingredients: parsed.ingredients,
            steps: parsed.steps.map((description) => ({ description })),
            tips: parsed.tips.map((tip) => ({ tip })),
          }}
        />
        <button
          type="button"
          onClick={() => setParsed(null)}
          className="mt-4 text-sm text-muted"
        >
          ← recommencer avec un autre texte
        </button>
      </div>
    );
  }

  return (
    <div>
      <label className="text-sm text-muted block mb-2">
        colle ici le texte de la légende Instagram (ou tout autre texte de recette)
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder="Colle le texte ici..."
        className="w-full px-4 py-3 rounded-2xl bg-surface text-sm outline-none text-foreground mb-4"
      />
      {error && <p className="text-sm text-papaya mb-4">{error}</p>}
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={loading || !text.trim()}
        className="px-6 h-11 rounded-full bg-leaf text-cream text-sm font-display disabled:opacity-50"
      >
        {loading ? "analyse en cours..." : "analyser le texte"}
      </button>
    </div>
  );
}
