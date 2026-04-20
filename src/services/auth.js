import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "./firebase";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account",
});

export function isAuthConfigured() {
  return Boolean(auth) && isFirebaseConfigured;
}

export function onAuthChange(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

export async function signInWithGooglePopup() {
  if (!auth) {
    return null;
  }

  return signInWithPopup(auth, provider);
}

export async function signInAnonymouslyUser() {
  if (!auth) {
    return null;
  }

  return signInAnonymously(auth);
}

export async function signOutCurrentUser() {
  if (!auth) {
    return null;
  }

  return signOut(auth);
}
