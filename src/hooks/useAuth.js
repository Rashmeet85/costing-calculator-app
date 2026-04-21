import { useEffect, useState } from "react";
import {
  isAuthConfigured,
  onAuthChange,
  resolveRedirectSignIn,
  signInAnonymouslyUser,
  signInWithGoogle,
  signOutCurrentUser,
} from "../services/auth";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!isAuthConfigured()) {
      setAuthError("Google sign-in is unavailable. Check the Firebase web app configuration.");
    }

    resolveRedirectSignIn().catch((error) => {
      setAuthError(
        error?.code
          ? `Google sign-in failed: ${error.code}`
          : "Google sign-in did not complete. Please try again.",
      );
    });

    const unsubscribe = onAuthChange((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    user,
    loading,
    signingIn,
    authError,
    authAvailable: isAuthConfigured(),
    signInWithGoogle: async () => {
      try {
        setSigningIn(true);
        setAuthError("");
        return await signInWithGoogle();
      } catch (error) {
        setAuthError(
          error?.code
            ? `Google sign-in failed: ${error.code}`
            : "Google sign-in did not complete. Please try again.",
        );
        throw error;
      } finally {
        setSigningIn(false);
      }
    },
    signInAsGuest: signInAnonymouslyUser,
    signOutUser: signOutCurrentUser,
  };
}
