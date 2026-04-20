import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

function pricesCollection(uid) {
  return collection(db, "users", uid, "ingredientPrices");
}

export function subscribeIngredientPrices(uid, callback) {
  if (!db) {
    callback({});
    return () => {};
  }

  return onSnapshot(pricesCollection(uid), (snapshot) => {
    const next = {};
    snapshot.forEach((item) => {
      next[item.id] = item.data();
    });
    callback(next);
  });
}

export async function upsertIngredientPrice(uid, ingredient) {
  if (!db || !ingredient.key) {
    return;
  }

  const reference = doc(db, "users", uid, "ingredientPrices", ingredient.key);
  return setDoc(
    reference,
    {
      ...ingredient,
      pricePerUnit: Number(ingredient.pricePerUnit || 0),
      pricingUnit: ingredient.pricingUnit,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
