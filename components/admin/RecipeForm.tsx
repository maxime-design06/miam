"use client";

import { useState } from "react";
import { compressImageToWebp } from "@/lib/image-compression";

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
interface RecipeSection {
  title: string;
  ingredients: Ingredient[];
  steps: Step[];
}

interface RecipeFormProps {
  action: (formData: FormData) => Promise<void>;
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  ingredientSuggestions?: string[];
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
    sections: RecipeSection[];
    tips: Tip[];
  };
}

const inputClass =
  "w-full h-10 px-4 rounded-full bg-surface text-sm outline-none text-foreground";

const UNIT_OPTIONS = [
  { value: "", label: "Aucune (pièce)" },
  { value: "g", label: "g (grammes)" },
  { value: "kg", label: "kg (kilogrammes)" },
  { value: "l", label: "l (litres)" },
  { value: "ml", label: "ml (millilitres)" },
  { value: "cl", label: "cl (centilitres)" },
  { value: "c. à s.", label: "c. à s. (cuillère à soupe)" },
  { value: "c. à c.", label: "c. à c. (cuillère à café)" },
  { value: "pincée", label: "pincée" },
  { value: "filet", label: "filet" },
  { value: "gousse", label: "gousse" },
  { value: "tranche", label: "tranche" },
  { value: "botte", label: "botte" },
  { value: "sachet", label: "sachet" },
];

const emptySection = (): RecipeSection => ({
  title: "",
  ingredients: [{ name: "", quantity: null, unit: "" }],
  steps: [{ description: "" }],
});

export function RecipeForm({
  action,
  categories,
  tags,
  ingredientSuggestions = [],
  initial,
}: RecipeFormProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initial?.tagIds ?? []);
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.imageUrl ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [sections, setSections] = useState<RecipeSection[]>(
    initial?.sections?.length ? initial.sections : [emptySection()]
  );
  // Pour chaque ingrédient de chaque partie, indique si on saisit une
  // unité "libre" (absente de la liste déroulante) plutôt qu'une unité
  // choisie dedans. Structure : customUnitRows[sectionIndex][ingredientIndex]
  const [customUnitRows, setCustomUnitRows] = useState<boolean[][]>(() =>
    (initial?.sections?.length ? initial.sections : [emptySection()]).map((section) =>
      section.ingredients.map(
        (ingredient) =>
          Boolean(ingredient.unit) && !UNIT_OPTIONS.some((option) => option.value === ingredient.unit)
      )
    )
  );

  const [tips, setTips] = useState<Tip[]>(initial?.tips ?? []);

  function updateSection(sectionIndex: number, patch: Partial<RecipeSection>) {
    setSections((prev) =>
      prev.map((section, i) => (i === sectionIndex ? { ...section, ...patch } : section))
    );
  }

  function addSection() {
    setSections((prev) => [...prev, emptySection()]);
    setCustomUnitRows((prev) => [...prev, [false]]);
  }

  function removeSection(sectionIndex: number) {
    setSections((prev) => prev.filter((_, i) => i !== sectionIndex));
    setCustomUnitRows((prev) => prev.filter((_, i) => i !== sectionIndex));
  }

  function updateIngredient(sectionIndex: number, ingredientIndex: number, patch: Partial<Ingredient>) {
    setSections((prev) =>
      prev.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              ingredients: section.ingredients.map((ingredient, j) =>
                j === ingredientIndex ? { ...ingredient, ...patch } : ingredient
              ),
            }
          : section
      )
    );
  }

  function addIngredient(sectionIndex: number) {
    setSections((prev) =>
      prev.map((section, i) =>
        i === sectionIndex
          ? { ...section, ingredients: [...section.ingredients, { name: "", quantity: null, unit: "" }] }
          : section
      )
    );
    setCustomUnitRows((prev) => prev.map((rows, i) => (i === sectionIndex ? [...rows, false] : rows)));
  }

  function removeIngredient(sectionIndex: number, ingredientIndex: number) {
    setSections((prev) =>
      prev.map((section, i) =>
        i === sectionIndex
          ? { ...section, ingredients: section.ingredients.filter((_, j) => j !== ingredientIndex) }
          : section
      )
    );
    setCustomUnitRows((prev) =>
      prev.map((rows, i) => (i === sectionIndex ? rows.filter((_, j) => j !== ingredientIndex) : rows))
    );
  }

  function setCustomUnit(sectionIndex: number, ingredientIndex: number, value: boolean) {
    setCustomUnitRows((prev) =>
      prev.map((rows, i) =>
        i === sectionIndex ? rows.map((v, j) => (j === ingredientIndex ? value : v)) : rows
      )
    );
  }

  function updateStep(sectionIndex: number, stepIndex: number, description: string) {
    setSections((prev) =>
      prev.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              steps: section.steps.map((step, j) => (j === stepIndex ? { description } : step)),
            }
          : section
      )
    );
  }

  function addStep(sectionIndex: number) {
    setSections((prev) =>
      prev.map((section, i) =>
        i === sectionIndex ? { ...section, steps: [...section.steps, { description: "" }] } : section
      )
    );
  }

  function removeStep(sectionIndex: number, stepIndex: number) {
    setSections((prev) =>
      prev.map((section, i) =>
        i === sectionIndex
          ? { ...section, steps: section.steps.filter((_, j) => j !== stepIndex) }
          : section
      )
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (imageFile) {
      formData.set("image", imageFile, imageFile.name);
    }
    setSubmitting(true);
    await action(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
            <img src={imagePreview} alt="Aperçu" className="w-40 h-28 object-cover rounded-2xl" />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setRemoveImage(false);
            setCompressing(true);
            try {
              const compressed = await compressImageToWebp(file);
              setImageFile(compressed);
              setImagePreview(URL.createObjectURL(compressed));
            } finally {
              setCompressing(false);
            }
          }}
          className="text-sm text-foreground"
        />
        {compressing && <p className="text-xs text-muted mt-1">Compression de l&apos;image...</p>}
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
                      prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
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

      <datalist id="ingredient-suggestions">
        {ingredientSuggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>

      {/* Parties de la recette */}
      <div className="space-y-6">
        <label className="text-sm text-muted block">
          composition de la recette
        </label>

        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-surface rounded-2xl p-4 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <input
                placeholder='Titre de cette partie (ex : "Garniture") — laisse vide pour une recette simple'
                value={section.title}
                onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
                className="flex-1 min-w-[200px] h-10 px-4 rounded-full bg-background text-sm outline-none text-foreground"
              />
              {sections.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSection(sectionIndex)}
                  className="text-papaya text-sm px-2 shrink-0"
                >
                  Supprimer cette partie
                </button>
              )}
            </div>

            {/* Ingrédients de la partie */}
            <div>
              <label className="text-sm text-muted block mb-2">ingrédients</label>
              <div className="space-y-2">
                {section.ingredients.map((ingredient, ingredientIndex) => (
                  <div key={ingredientIndex} className="flex flex-wrap gap-2">
                    <input
                      placeholder="quantité"
                      type="number"
                      value={ingredient.quantity ?? ""}
                      onChange={(e) =>
                        updateIngredient(sectionIndex, ingredientIndex, {
                          quantity: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                      className="w-20 h-10 px-3 rounded-full bg-background text-sm outline-none text-foreground"
                    />

                    {customUnitRows[sectionIndex]?.[ingredientIndex] ? (
                      <div className="flex items-center gap-1 w-28 shrink-0">
                        <input
                          placeholder="unité"
                          value={ingredient.unit ?? ""}
                          onChange={(e) =>
                            updateIngredient(sectionIndex, ingredientIndex, { unit: e.target.value })
                          }
                          className="w-full h-10 px-3 rounded-full bg-background text-sm outline-none text-foreground"
                        />
                        <button
                          type="button"
                          title="Revenir à la liste des unités"
                          onClick={() => {
                            setCustomUnit(sectionIndex, ingredientIndex, false);
                            updateIngredient(sectionIndex, ingredientIndex, { unit: "" });
                          }}
                          className="text-muted text-xs shrink-0"
                        >
                          ↺
                        </button>
                      </div>
                    ) : (
                      <select
                        value={ingredient.unit ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "__autre__") {
                            setCustomUnit(sectionIndex, ingredientIndex, true);
                            updateIngredient(sectionIndex, ingredientIndex, { unit: "" });
                            return;
                          }
                          updateIngredient(sectionIndex, ingredientIndex, { unit: value });
                        }}
                        className="w-28 shrink-0 h-10 px-2 rounded-full bg-background text-sm outline-none text-foreground"
                      >
                        {UNIT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                        <option value="__autre__">Autre...</option>
                      </select>
                    )}

                    <input
                      placeholder="nom de l'ingrédient"
                      list="ingredient-suggestions"
                      value={ingredient.name}
                      onChange={(e) =>
                        updateIngredient(sectionIndex, ingredientIndex, { name: e.target.value })
                      }
                      className="flex-1 min-w-[140px] h-10 px-3 rounded-full bg-background text-sm outline-none text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => removeIngredient(sectionIndex, ingredientIndex)}
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
                onClick={() => addIngredient(sectionIndex)}
                className="mt-2 text-sm text-leaf"
              >
                + Ajouter un ingrédient
              </button>
            </div>

            {/* Étapes de la partie */}
            <div>
              <label className="text-sm text-muted block mb-2">étapes</label>
              <div className="space-y-2">
                {section.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex gap-2">
                    <span className="font-heading font-bold text-papaya w-6 pt-2 text-sm">
                      {stepIndex + 1}
                    </span>
                    <textarea
                      value={step.description}
                      onChange={(e) => updateStep(sectionIndex, stepIndex, e.target.value)}
                      rows={2}
                      className="flex-1 px-4 py-2 rounded-2xl bg-background text-sm outline-none text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => removeStep(sectionIndex, stepIndex)}
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
                onClick={() => addStep(sectionIndex)}
                className="mt-2 text-sm text-leaf"
              >
                + Ajouter une étape
              </button>
            </div>
          </div>
        ))}

        <button type="button" onClick={addSection} className="text-sm text-leaf">
          + Ajouter une partie (ex : garniture, accompagnement...)
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

      <input
        type="hidden"
        name="existingImageUrl"
        value={initial?.imageUrl && !removeImage ? initial.imageUrl : ""}
      />
      <input type="hidden" name="sectionsJson" value={JSON.stringify(sections)} />
      <input type="hidden" name="tipsJson" value={JSON.stringify(tips)} />

      <button
        type="submit"
        disabled={submitting || compressing}
        className="px-6 h-11 rounded-full bg-leaf text-white text-sm font-heading font-bold disabled:opacity-60"
      >
        {submitting ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
