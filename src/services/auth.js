import {
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithRedirect,
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

function shouldPreferRedirect() {
  if (typeof window === "undefined") {
    return false;
  }

  const isStandalone =
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true;
  const isSmallScreen = window.innerWidth < 768;

  return isStandalone || isSmallScreen;
}

export async function resolveRedirectSignIn() {
  if (!auth) {
    return null;
  }

  return getRedirectResult(auth);
}

export async function signInWithGoogle() {
  if (!auth) {
    return null;
  }

  if (shouldPreferRedirect()) {
    await signInWithRedirect(auth, provider);
    return null;
  }

  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    if (
      error?.code === "auth/popup-blocked" ||
      error?.code === "auth/popup-closed-by-user" ||
      error?.code === "auth/cancelled-popup-request"
    ) {
      await signInWithRedirect(auth, provider);
      return null;
    }

    throw error;
  }
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
