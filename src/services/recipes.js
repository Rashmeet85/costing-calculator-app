import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { normalizeRecipe, normalizeRecipeIngredient } from "../utils/recipe";

const TOP_LEVEL_RECIPE_COLLECTION = "recipes";
const USER_RECIPE_COLLECTION = "recipes";

function customRecipesCollection(uid) {
  return collection(db, "users", uid, "customRecipes");
}

export function subscribeCustomRecipes(uid, callback) {
  if (!db) {
    callback([]);
    return () => {};
  }

  return onSnapshot(query(customRecipesCollection(uid), orderBy("updatedAt", "desc")), (snapshot) => {
    callback(snapshot.docs.map((item) => normalizeRecipe(item.data(), item.id)));
  });
}

export async function saveCustomRecipe(uid, recipe) {
  if (!db || !uid) {
    return null;
  }

  const recipeId = recipe.id || crypto.randomUUID();
  const reference = doc(db, "users", uid, "customRecipes", recipeId);
  const existingSnapshot = await getDoc(reference);
  const normalized = {
    title: recipe.title,
    yield: Number(recipe.yield || 1),
    yieldUnit: recipe.yieldUnit || "pieces",
    ingredients: recipe.ingredients.map(normalizeRecipeIngredient),
    sourceApp: "costing-app",
    updatedAt: serverTimestamp(),
    createdAt: existingSnapshot.exists()
      ? existingSnapshot.data().createdAt || serverTimestamp()
      : serverTimestamp(),
  };

  await setDoc(reference, normalized);
  return normalizeRecipe(normalized, recipeId);
}

export async function fetchRecipeById(uid, recipeId) {
  if (!db) {
    throw new Error("Firebase unavailable");
  }

  const references = [
    doc(db, TOP_LEVEL_RECIPE_COLLECTION, recipeId),
    doc(db, "users", uid, USER_RECIPE_COLLECTION, recipeId),
    doc(db, "users", uid, "customRecipes", recipeId),
  ];

  for (const reference of references) {
    const snapshot = await getDoc(reference);
    if (snapshot.exists()) {
      return normalizeRecipe(snapshot.data(), snapshot.id);
    }
  }

  throw new Error("Recipe not found");
}
