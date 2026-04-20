import { useEffect, useState } from "react";
import {
  isAuthConfigured,
  onAuthChange,
  signInAnonymouslyUser,
  signInWithGooglePopup,
  signOutCurrentUser,
} from "../services/auth";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    user,
    loading,
    authAvailable: isAuthConfigured(),
    signInWithGoogle: signInWithGooglePopup,
    signInAsGuest: signInAnonymouslyUser,
    signOutUser: signOutCurrentUser,
  };
}
