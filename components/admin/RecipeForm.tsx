"use client";

import { useState } from "react";

interface Ingredient {
  name: string;
  quantity: number | null;
  unit: string | null;
}
interface Step {
  description: string;
}
interface Tip {
  tip: string;
}

interface RecipeFormProps {
  action: (formData: FormData) => void;
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  initial?: {
    title: string;
    slug: string;
    description: string;
    imageUrl?: string | null;
    sourceUrl?: string | null;
    prepTimeMinutes: number;
    cookTimeMinutes: number;
    servings: number;
    difficulty: string;
    categoryId: string | null;
    tagIds?: string[];
    ingredients: Ingredient[];
    steps: Step[];
    tips: Tip[];
  };
}

const inputClass =
  "w-full h-10 px-4 rounded-full bg-surface text-sm outline-none text-foreground";

export function RecipeForm({ action, categories, tags, initial }: RecipeFormProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initial?.tagIds ?? []);
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.imageUrl ?? null);
  const [removeImage, setRemoveImage] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initial?.ingredients?.length ? initial.ingredients : [{ name: "", quantity: null, unit: "" }]
  );
  const [steps, setSteps] = useState<Step[]>(
    initial?.steps?.length ? initial.steps : [{ description: "" }]
  );
  const [tips, setTips] = useState<Tip[]>(initial?.tips ?? []);

  return (
    <form action={action} className="space-y-8">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted block mb-1">titre</label>
          <input name="title" defaultValue={initial?.title} required className={inputClass} />
        </div>
        <div>
          <label className="text-sm text-muted block mb-1">
            slug (laisser vide pour générer automatiquement)
          </label>
          <input name="slug" defaultValue={initial?.slug} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="text-sm text-muted block mb-1">description</label>
        <textarea
          name="description"
          defaultValue={initial?.description}
          rows={3}
          className="w-full px-4 py-3 rounded-2xl bg-surface text-sm outline-none text-foreground"
        />
      </div>

      <div>
        <label className="text-sm text-muted block mb-2">photo</label>
        {imagePreview && !removeImage && (
          <div className="mb-3">
            <img
              src={imagePreview}
              alt="Aperçu"
              className="w-40 h-28 object-cover rounded-2xl"
            />
          </div>
        )}
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setImagePreview(URL.createObjectURL(file));
              setRemoveImage(false);
            }
          }}
          className="text-sm text-foreground"
        />
        {initial?.imageUrl && (
          <label className="flex items-center gap-2 text-sm text-muted mt-2">
            <input
              type="checkbox"
              name="removeImage"
              checked={removeImage}
              onChange={(e) => setRemoveImage(e.target.checked)}
            />
            supprimer la photo actuelle
          </label>
        )}
      </div>

      <div>
        <label className="text-sm text-muted block mb-1">
          lien vers le post ou reel Instagram d&apos;origine (optionnel)
        </label>
        <input
          type="url"
          name="sourceUrl"
          defaultValue={initial?.sourceUrl ?? ""}
          placeholder="https://www.instagram.com/..."
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm text-muted block mb-1">préparation (min)</label>
          <input
            type="number"
            name="prepTimeMinutes"
            defaultValue={initial?.prepTimeMinutes ?? 0}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm text-muted block mb-1">cuisson (min)</label>
          <input
            type="number"
            name="cookTimeMinutes"
            defaultValue={initial?.cookTimeMinutes ?? 0}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm text-muted block mb-1">portions</label>
          <input
            type="number"
            name="servings"
            defaultValue={initial?.servings ?? 4}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm text-muted block mb-1">difficulté</label>
          <select name="difficulty" defaultValue={initial?.difficulty ?? "facile"} className={inputClass}>
            <option value="facile">facile</option>
            <option value="moyen">moyen</option>
            <option value="difficile">difficile</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm text-muted block mb-1">catégorie</label>
        <select name="categoryId" defaultValue={initial?.categoryId ?? ""} className={inputClass}>
          <option value="">aucune</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm text-muted block mb-2">tags</label>
        {tags.length === 0 ? (
          <p className="text-sm text-muted">Aucun tag créé pour le moment.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() =>
                    setSelectedTagIds((prev) =>
                      prev.includes(tag.id)
                        ? prev.filter((id) => id !== tag.id)
                        : [...prev, tag.id]
                    )
                  }
                  className={`text-sm px-3.5 py-1.5 rounded-full transition ${
                    isSelected ? "bg-leaf text-white" : "bg-surface text-foreground"
                  }`}
                >
                  {tag.name.toLowerCase()}
                </button>
              );
            })}
          </div>
        )}
        {selectedTagIds.map((tagId) => (
          <input key={tagId} type="hidden" name="tagIds" value={tagId} />
        ))}
      </div>

      {/* Ingrédients */}
      <div>
        <label className="text-sm text-muted block mb-2">ingrédients</label>
        <div className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2">
              <input
                placeholder="quantité"
                type="number"
                value={ingredient.quantity ?? ""}
                onChange={(e) => {
                  const value = e.target.value === "" ? null : Number(e.target.value);
                  setIngredients((prev) =>
                    prev.map((item, i) => (i === index ? { ...item, quantity: value } : item))
                  );
                }}
                className="w-20 h-10 px-3 rounded-full bg-surface text-sm outline-none text-foreground"
              />
              <input
                placeholder="unité"
                value={ingredient.unit ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setIngredients((prev) =>
                    prev.map((item, i) => (i === index ? { ...item, unit: value } : item))
                  );
                }}
                className="w-24 h-10 px-3 rounded-full bg-surface text-sm outline-none text-foreground"
              />
              <input
                placeholder="nom de l'ingrédient"
                value={ingredient.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setIngredients((prev) =>
                    prev.map((item, i) => (i === index ? { ...item, name: value } : item))
                  );
                }}
                className="flex-1 h-10 px-3 rounded-full bg-surface text-sm outline-none text-foreground"
              />
              <button
                type="button"
                onClick={() => setIngredients((prev) => prev.filter((_, i) => i !== index))}
                className="text-papaya text-sm px-2"
                aria-label="Supprimer cet ingrédient"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIngredients((prev) => [...prev, { name: "", quantity: null, unit: "" }])}
          className="mt-2 text-sm text-leaf"
        >
          + Ajouter un ingrédient
        </button>
      </div>

      {/* Étapes */}
      <div>
        <label className="text-sm text-muted block mb-2">étapes</label>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-2">
              <span className="font-heading font-bold text-papaya w-6 pt-2 text-sm">{index + 1}</span>
              <textarea
                value={step.description}
                onChange={(e) => {
                  const value = e.target.value;
                  setSteps((prev) =>
                    prev.map((item, i) => (i === index ? { ...item, description: value } : item))
                  );
                }}
                rows={2}
                className="flex-1 px-4 py-2 rounded-2xl bg-surface text-sm outline-none text-foreground"
              />
              <button
                type="button"
                onClick={() => setSteps((prev) => prev.filter((_, i) => i !== index))}
                className="text-papaya text-sm px-2"
                aria-label="Supprimer cette étape"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSteps((prev) => [...prev, { description: "" }])}
          className="mt-2 text-sm text-leaf"
        >
          + Ajouter une étape
        </button>
      </div>

      {/* Conseils */}
      <div>
        <label className="text-sm text-muted block mb-2">conseils (optionnel)</label>
        <div className="space-y-2">
          {tips.map((tip, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={tip.tip}
                onChange={(e) => {
                  const value = e.target.value;
                  setTips((prev) => prev.map((item, i) => (i === index ? { tip: value } : item)));
                }}
                className="flex-1 h-10 px-4 rounded-full bg-surface text-sm outline-none text-foreground"
              />
              <button
                type="button"
                onClick={() => setTips((prev) => prev.filter((_, i) => i !== index))}
                className="text-papaya text-sm px-2"
                aria-label="Supprimer ce conseil"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setTips((prev) => [...prev, { tip: "" }])}
          className="mt-2 text-sm text-leaf"
        >
          + Ajouter un conseil
        </button>
      </div>

      <input type="hidden" name="ingredientsJson" value={JSON.stringify(ingredients)} />
      <input type="hidden" name="stepsJson" value={JSON.stringify(steps)} />
      <input type="hidden" name="tipsJson" value={JSON.stringify(tips)} />

      <button
        type="submit"
        className="px-6 h-11 rounded-full bg-leaf text-white text-sm font-heading font-bold"
      >
        Enregistrer
      </button>
    </form>
  );
}
