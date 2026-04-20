import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import { subscribeCustomRecipes, saveCustomRecipe } from "../services/recipes";
import { createBlankIngredient } from "../utils/costing";
import { UNIT_OPTIONS } from "../utils/units";

function createEmptyRecipeForm() {
  return {
    title: "",
    yield: 1,
    yieldUnit: "pcs",
    ingredients: [createBlankIngredient()],
  };
}

export default function CustomRecipePage({ user }) {
  const navigate = useNavigate();
  const { search } = useLocation();
  const customRecipeId = useMemo(
    () => new URLSearchParams(search).get("customRecipeId"),
    [search],
  );
  const [customRecipes, setCustomRecipes] = useState([]);
  const [recipeForm, setRecipeForm] = useState(createEmptyRecipeForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeCustomRecipes(user.uid, setCustomRecipes), [user.uid]);

  useEffect(() => {
    if (!customRecipeId) {
      setRecipeForm(createEmptyRecipeForm());
      return;
    }

    const current = customRecipes.find((recipe) => recipe.id === customRecipeId);
    if (!current) {
      return;
    }

    setRecipeForm({
      title: current.title,
      yield: current.yield,
      yieldUnit: current.yieldUnit,
      ingredients: current.ingredients.map((ingredient) => ({
        ...ingredient,
        key: ingredient.key || crypto.randomUUID(),
      })),
    });
  }, [customRecipeId, customRecipes]);

  const handleIngredientChange = (index, field, value) => {
    setRecipeForm((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient, ingredientIndex) =>
        ingredientIndex === index
          ? { ...ingredient, [field]: value }
          : ingredient,
      ),
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    const saved = await saveCustomRecipe(user.uid, {
      ...recipeForm,
      id: customRecipeId,
      ingredients: recipeForm.ingredients.filter((ingredient) => ingredient.name.trim()),
    });

    setSaving(false);
    navigate(`/costing?customRecipeId=${saved.id}`);
  };

  return (
    <div className="page-stack">
      <section className="page-hero">
        <p className="eyebrow">Custom Recipe</p>
        <h2>{customRecipeId ? "Edit your local recipe" : "Add a new custom order"}</h2>
        <p className="muted">
          Keep one-off bakes and special orders inside the costing app without
          cluttering the menu app.
        </p>
      </section>

      <GlassCard
        title="Recipe details"
        subtitle="Use fixed unit options so prices and costing stay consistent."
        action={
          <Link className="secondary-button inline-button" to="/">
            Back to recipes
          </Link>
        }
      >
        <div className="form-grid">
          <label className="field">
            <span>Recipe name</span>
            <input
              value={recipeForm.title}
              onChange={(event) =>
                setRecipeForm((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="Chocolate tub cake"
            />
          </label>

          <label className="field">
            <span>How much does it make?</span>
            <input
              type="number"
              min="1"
              value={recipeForm.yield}
              onChange={(event) =>
                setRecipeForm((current) => ({
                  ...current,
                  yield: Number(event.target.value || 1),
                }))
              }
            />
          </label>

          <label className="field">
            <span>Yield unit</span>
            <select
              value={recipeForm.yieldUnit}
              onChange={(event) =>
                setRecipeForm((current) => ({
                  ...current,
                  yieldUnit: event.target.value,
                }))
              }
            >
              {UNIT_OPTIONS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </GlassCard>

      <GlassCard title="Ingredients" subtitle="Add the items exactly the way you buy or measure them.">
        <div className="ingredient-editor-list">
          {recipeForm.ingredients.map((ingredient, index) => (
            <div className="ingredient-editor-item" key={ingredient.key}>
              <label className="field grow">
                <span>Ingredient</span>
                <input
                  value={ingredient.name}
                  onChange={(event) =>
                    handleIngredientChange(index, "name", event.target.value)
                  }
                  placeholder="Butter"
                />
              </label>

              <label className="field">
                <span>Qty</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={ingredient.quantity}
                  onChange={(event) =>
                    handleIngredientChange(index, "quantity", event.target.value)
                  }
                />
              </label>

              <label className="field">
                <span>Unit</span>
                <select
                  value={ingredient.unit}
                  onChange={(event) =>
                    handleIngredientChange(index, "unit", event.target.value)
                  }
                >
                  {UNIT_OPTIONS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </div>

        <div className="button-row">
          <button
            className="secondary-button"
            onClick={() =>
              setRecipeForm((current) => ({
                ...current,
                ingredients: [...current.ingredients, createBlankIngredient()],
              }))
            }
          >
            Add ingredient
          </button>
          <button className="primary-button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save recipe"}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
