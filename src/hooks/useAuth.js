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

  useEffect(() => {
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
    authError,
    authAvailable: isAuthConfigured(),
    signInWithGoogle: async () => {
      try {
        setAuthError("");
        return await signInWithGoogle();
      } catch (error) {
        setAuthError(
          error?.code
            ? `Google sign-in failed: ${error.code}`
            : "Google sign-in did not complete. Please try again.",
        );
        throw error;
      }
    },
    signInAsGuest: signInAnonymouslyUser,
    signOutUser: signOutCurrentUser,
  };
}
