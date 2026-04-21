import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import { subscribeLinkedRecipes } from "../services/linkedRecipes";
import { subscribeRecipeProfiles } from "../services/profiles";
import { subscribeCustomRecipes } from "../services/recipes";
import { formatCurrency } from "../utils/format";
import { getUnitLabel } from "../utils/units";

export default function RecipesPage({ user }) {
  const [linkedRecipes, setLinkedRecipes] = useState([]);
  const [customRecipes, setCustomRecipes] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribeLinked = subscribeLinkedRecipes(user.uid, setLinkedRecipes);
    const unsubscribeCustom = subscribeCustomRecipes(user.uid, setCustomRecipes);
    const unsubscribeProfiles = subscribeRecipeProfiles(user.uid, setProfiles);

    return () => {
      unsubscribeLinked();
      unsubscribeCustom();
      unsubscribeProfiles();
    };
  }, [user.uid]);

  const allRecipes = useMemo(() => {
    const importedItems = linkedRecipes.map((recipe) => ({
      id: recipe.recipeId || recipe.id,
      title: recipe.title,
      sourceApp: "recipe-app",
      ingredientCount: recipe.ingredientCount || 0,
      yield: recipe.yield || 1,
      yieldUnit: recipe.yieldUnit || "pcs",
      pricingLink: `/costing?recipeId=${recipe.recipeId || recipe.id}`,
      editLink: null,
    }));

    const customItems = customRecipes.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      sourceApp: "costing-app",
      ingredientCount: recipe.ingredients?.length || 0,
      yield: recipe.yield || 1,
      yieldUnit: recipe.yieldUnit || "pcs",
      pricingLink: `/costing?customRecipeId=${recipe.id}`,
      editLink: `/recipes/edit?customRecipeId=${recipe.id}`,
    }));

    return [...customItems, ...importedItems];
  }, [customRecipes, linkedRecipes]);

  const filteredRecipes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return allRecipes;
    }

    return allRecipes.filter((recipe) => recipe.title.toLowerCase().includes(query));
  }, [allRecipes, searchQuery]);

  const profilesByRecipeId = useMemo(
    () => Object.fromEntries(profiles.map((profile) => [profile.recipeId || profile.id, profile])),
    [profiles],
  );

  return (
    <div className="page-stack">
      <section className="page-hero">
        <p className="eyebrow">Recipe Library</p>
        <h2>All your bakes, ready for pricing</h2>
        <p className="muted">
          Imported recipes land here automatically after you open them from the
          Recipe App. Custom orders live here too.
        </p>
      </section>

      <label className="field search-field">
        <span className="sr-only">Search recipes</span>
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search your bakes"
        />
      </label>

      <GlassCard
        title="Your recipes"
        subtitle={`${filteredRecipes.length} recipe${filteredRecipes.length === 1 ? "" : "s"} available`}
        action={
          <Link className="primary-button inline-button" to="/recipes/new">
            Add custom recipe
          </Link>
        }
      >
        <div className="recipe-list">
          {filteredRecipes.length ? (
            filteredRecipes.map((recipe) => {
              const savedSetup = profilesByRecipeId[recipe.id];

              return (
                <div className="recipe-card" key={`${recipe.sourceApp}-${recipe.id}`}>
                  <div className="recipe-card-copy">
                    <div className="recipe-card-head">
                      <strong>{recipe.title}</strong>
                      <span className={`source-chip ${recipe.sourceApp}`}>
                        {recipe.sourceApp === "recipe-app" ? "From menu app" : "Custom order"}
                      </span>
                    </div>
                    <p className="muted">
                      {recipe.ingredientCount} ingredients | Makes {recipe.yield} {getUnitLabel(recipe.yieldUnit)}
                    </p>
                    {savedSetup ? (
                      <p className="recipe-card-price">
                        Suggested selling price: {formatCurrency(savedSetup.sellingPrice)}
                      </p>
                    ) : (
                      <p className="muted">No pricing saved yet</p>
                    )}
                  </div>

                  <div className="recipe-card-actions">
                    <Link className="primary-button inline-button" to={recipe.pricingLink}>
                      Open pricing
                    </Link>
                    {recipe.editLink ? (
                      <Link className="secondary-button inline-button" to={recipe.editLink}>
                        Edit
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <h3>No recipes here yet</h3>
              <p className="muted">
                Open a recipe from the Recipe App or add a custom order here.
              </p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
