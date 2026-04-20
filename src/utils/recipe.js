import { normalizeUnit } from "./units";

export function normalizeIngredientKey(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeRecipeIngredient(ingredient) {
  const name =
    ingredient.name ||
    ingredient.ingredient ||
    ingredient.ingredientName ||
    "Untitled ingredient";
  const quantity = Number(
    ingredient.quantity ?? ingredient.amount ?? ingredient.qty ?? 0,
  );
  const unit = ingredient.unit || ingredient.measure || "g";

  return {
    key: ingredient.key || normalizeIngredientKey(name) || crypto.randomUUID(),
    name,
    quantity,
    unit: normalizeUnit(unit),
  };
}

export function normalizeRecipe(data, id) {
  const ingredientsSource =
    data.ingredients || data.items || data.recipeIngredients || [];

  return {
    id,
    title: data.title || data.name || "Untitled recipe",
    yield: Number(data.yield || data.output || 1),
    yieldUnit: normalizeUnit(data.yieldUnit || data.outputUnit || "pcs"),
    sourceApp: data.sourceApp || "recipe-app",
    ingredients: ingredientsSource.map(normalizeRecipeIngredient),
  };
}
