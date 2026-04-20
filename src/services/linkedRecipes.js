import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

function linkedRecipesCollection(uid) {
  return collection(db, "users", uid, "linkedRecipes");
}

export function subscribeLinkedRecipes(uid, callback) {
  if (!db) {
    callback([]);
    return () => {};
  }

  return onSnapshot(
    query(linkedRecipesCollection(uid), orderBy("updatedAt", "desc")),
    (snapshot) => {
      callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    },
  );
}

export async function saveLinkedRecipe(uid, recipe) {
  if (!db || !uid || !recipe?.id) {
    return;
  }

  await setDoc(
    doc(db, "users", uid, "linkedRecipes", recipe.id),
    {
      recipeId: recipe.id,
      title: recipe.title,
      yield: Number(recipe.yield || 1),
      yieldUnit: recipe.yieldUnit || "pcs",
      ingredientCount: recipe.ingredients?.length || 0,
      sourceApp: "recipe-app",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
