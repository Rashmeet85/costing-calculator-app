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
import { formatCurrency, formatDateTime } from "../utils/format";

function profilesCollection(uid) {
  return collection(db, "users", uid, "recipeProfiles");
}

export function subscribeRecipeProfiles(uid, callback) {
  if (!db) {
    callback([]);
    return () => {};
  }

  return onSnapshot(query(profilesCollection(uid), orderBy("updatedAt", "desc")), (snapshot) => {
    callback(
      snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
        sellingPriceDisplay: formatCurrency(item.data().sellingPricePerUnit || 0),
        updatedAtLabel: formatDateTime(item.data().updatedAt),
      })),
    );
  });
}

export async function saveRecipeProfile(uid, profile) {
  if (!db) {
    return null;
  }

  const profileId = profile.recipeId || crypto.randomUUID();
  const reference = doc(db, "users", uid, "recipeProfiles", profileId);

  await setDoc(
    reference,
    {
      ...profile,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return profileId;
}
