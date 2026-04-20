import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchRecipeById } from "../services/recipes";

export function useRecipeFromQuery(uid) {
  const { search } = useLocation();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(search);
    const recipeId = params.get("recipeId");

    if (!uid || !recipeId) {
      setRecipe(null);
      setLoading(false);
      setError("");
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    fetchRecipeById(uid, recipeId)
      .then((result) => {
        if (active) {
          setRecipe(result);
        }
      })
      .catch(() => {
        if (active) {
          setError("We could not find that recipe in Firebase.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [search, uid]);

  return { recipe, loading, error };
}
