import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import IngredientPricingTable from "../components/IngredientPricingTable";
import MetricCard from "../components/MetricCard";
import { saveLinkedRecipe } from "../services/linkedRecipes";
import { saveRecipeProfile, subscribeRecipeProfiles } from "../services/profiles";
import {
  fetchRecipeById,
  subscribeCustomRecipes,
} from "../services/recipes";
import {
  subscribeIngredientPrices,
  upsertIngredientPrice,
} from "../services/pricing";
import {
  calculateCostBreakdown,
  createHiddenCost,
} from "../utils/costing";
import { getUnitLabel } from "../utils/units";

export default function CostCalculatorPage({ user }) {
  const { search } = useLocation();
  const [customRecipes, setCustomRecipes] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [ingredientPrices, setIngredientPrices] = useState({});
  const [activeRecipe, setActiveRecipe] = useState(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [recipeError, setRecipeError] = useState("");
  const [priceDrafts, setPriceDrafts] = useState({});
  const [extraCosts, setExtraCosts] = useState([createHiddenCost()]);
  const [yieldCount, setYieldCount] = useState(1);
  const [yieldUnit, setYieldUnit] = useState("pcs");
  const [profitPercent, setProfitPercent] = useState(30);
  const [sellingPrice, setSellingPrice] = useState("");
  const [status, setStatus] = useState("");

  const queryParams = useMemo(() => new URLSearchParams(search), [search]);
  const importedRecipeId = queryParams.get("recipeId");
  const customRecipeId = queryParams.get("customRecipeId");

  useEffect(() => {
    const unsubscribeCustom = subscribeCustomRecipes(user.uid, setCustomRecipes);
    const unsubscribeProfiles = subscribeRecipeProfiles(user.uid, setProfiles);
    const unsubscribePrices = subscribeIngredientPrices(user.uid, setIngredientPrices);

    return () => {
      unsubscribeCustom();
      unsubscribeProfiles();
      unsubscribePrices();
    };
  }, [user.uid]);

  useEffect(() => {
    if (customRecipeId) {
      const recipe = customRecipes.find((item) => item.id === customRecipeId);
      if (recipe) {
        setActiveRecipe(recipe);
        setLoadingRecipe(false);
        setRecipeError("");
      }
      return;
    }

    if (!importedRecipeId) {
      setActiveRecipe(null);
      setLoadingRecipe(false);
      setRecipeError("");
      return;
    }

    let isActive = true;
    setLoadingRecipe(true);
    setRecipeError("");

    fetchRecipeById(user.uid, importedRecipeId)
      .then(async (recipe) => {
        if (!isActive) {
          return;
        }

        setActiveRecipe(recipe);
        await saveLinkedRecipe(user.uid, recipe);
      })
      .catch(() => {
        if (isActive) {
          setRecipeError("We could not open this recipe from the Recipe App.");
        }
      })
      .finally(() => {
        if (isActive) {
          setLoadingRecipe(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [customRecipeId, customRecipes, importedRecipeId, user.uid]);

  useEffect(() => {
    if (!activeRecipe) {
      return;
    }

    setYieldCount(activeRecipe.yield || 1);
    setYieldUnit(activeRecipe.yieldUnit || "pcs");

    const existingProfile = profiles.find((profile) => profile.recipeId === activeRecipe.id);
    if (existingProfile) {
      setProfitPercent(30);
      setSellingPrice(existingProfile.sellingPrice || "");
      setExtraCosts(existingProfile.hiddenCosts?.length ? existingProfile.hiddenCosts : [createHiddenCost()]);
      setStatus("Saved pricing loaded.");
    } else {
      setProfitPercent(30);
      setSellingPrice("");
      setExtraCosts([createHiddenCost()]);
      setStatus("");
    }
  }, [activeRecipe, profiles]);

  useEffect(() => {
    if (!activeRecipe) {
      return;
    }

    const nextDrafts = {};
    activeRecipe.ingredients.forEach((ingredient) => {
      const remembered = ingredientPrices[ingredient.key];
      nextDrafts[ingredient.key] = {
        name: ingredient.name,
        unit: ingredient.unit,
        pricingUnit: remembered?.pricingUnit || ingredient.unit,
        pricePerUnit: remembered?.pricePerUnit ?? "",
      };
    });
    setPriceDrafts(nextDrafts);
  }, [activeRecipe, ingredientPrices]);

  const breakdown = useMemo(
    () =>
      calculateCostBreakdown({
        recipe: activeRecipe,
        hiddenCosts: extraCosts,
        priceDrafts,
        yieldCount,
        yieldUnit,
        profitPercent,
        manualSellingPrice: sellingPrice,
      }),
    [activeRecipe, extraCosts, priceDrafts, yieldCount, yieldUnit, profitPercent, sellingPrice],
  );

  const handleSavePrices = async () => {
    if (!activeRecipe) {
      return;
    }

    await Promise.all(
      activeRecipe.ingredients.map((ingredient) =>
        upsertIngredientPrice(user.uid, {
          key: ingredient.key,
          name: ingredient.name,
          unit: ingredient.unit,
          pricingUnit: priceDrafts[ingredient.key]?.pricingUnit || ingredient.unit,
          pricePerUnit: Number(priceDrafts[ingredient.key]?.pricePerUnit || 0),
        }),
      ),
    );

    setStatus("Ingredient prices saved for next time.");
  };

  const handleSaveProfile = async () => {
    if (!activeRecipe) {
      return;
    }

    await saveRecipeProfile(user.uid, {
      recipeId: activeRecipe.id,
      recipeName: activeRecipe.title,
      sourceApp: activeRecipe.sourceApp,
      yield: yieldCount,
      unitLabel: yieldUnit,
      totalCost: breakdown.totalCost,
      costPerUnit: breakdown.costPerUnit,
      sellingPrice: breakdown.sellingPrice,
      sellingPricePerUnit: breakdown.sellingPricePerUnit,
      profitAmount: breakdown.profitAmount,
      profitPerUnit: breakdown.profitPerUnit,
      hiddenCosts: extraCosts,
    });

    setStatus("Selling setup saved. You can now log sales with it.");
  };

  if (!activeRecipe && !loadingRecipe && !recipeError) {
    return (
      <div className="page-stack">
        <section className="page-hero">
          <p className="eyebrow">Pricing</p>
          <h2>Pick a recipe first</h2>
          <p className="muted">
            Open a recipe from your library or come here directly from the Recipe App.
          </p>
        </section>

        <GlassCard
          title="Nothing selected yet"
          subtitle="Imported recipes only land here through the Recipe App redirect."
          action={<Link className="primary-button inline-button" to="/">Open recipes</Link>}
        >
          <p className="muted">
            Use the recipe library to open a saved custom order, or click
            “Calculate Costing” from the Recipe App once we wire the apps together.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <p className="eyebrow">Pricing Workspace</p>
        <h2>{loadingRecipe ? "Opening recipe..." : activeRecipe?.title}</h2>
        <p className="muted">
          {recipeError
            ? recipeError
            : activeRecipe
              ? `This recipe makes ${yieldCount} ${getUnitLabel(yieldUnit)}.`
              : "We are opening your recipe from Firebase."}
        </p>
      </section>

      {activeRecipe ? (
        <>
          <GlassCard
            title="Ingredients and buying prices"
            subtitle="Set the unit you buy each ingredient in, then add the rate in rupees."
            action={<Link className="secondary-button inline-button" to="/">Back to recipes</Link>}
          >
            <IngredientPricingTable
              ingredients={activeRecipe.ingredients}
              priceDrafts={priceDrafts}
              onPriceChange={(key, value) =>
                setPriceDrafts((current) => ({ ...current, [key]: value }))
              }
            />
          </GlassCard>

          <GlassCard
            title="Batch details"
            subtitle="Tell the app how much this batch makes and any extra costs you want to include."
          >
            <div className="form-grid">
              <label className="field">
                <span>Batch yield</span>
                <input
                  type="number"
                  min="1"
                  value={yieldCount}
                  onChange={(event) => setYieldCount(Number(event.target.value || 1))}
                />
              </label>
              <label className="field">
                <span>Yield unit</span>
                <input value={getUnitLabel(yieldUnit)} readOnly />
              </label>
              <label className="field">
                <span>Profit %</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={profitPercent}
                  onChange={(event) => setProfitPercent(Number(event.target.value || 0))}
                />
              </label>
              <label className="field">
                <span>Set your own selling price</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={sellingPrice}
                  onChange={(event) => setSellingPrice(event.target.value)}
                  placeholder="Optional"
                />
              </label>
            </div>

            <div className="stack-gap">
              {extraCosts.map((cost, index) => (
                <div className="form-grid" key={cost.id}>
                  <label className="field">
                    <span>Extra cost name</span>
                    <input
                      value={cost.label}
                      onChange={(event) =>
                        setExtraCosts((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, label: event.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Amount in Rs.</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={cost.amount}
                      onChange={(event) =>
                        setExtraCosts((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, amount: event.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className="button-row">
              <button
                className="secondary-button"
                onClick={() => setExtraCosts((current) => [...current, createHiddenCost()])}
              >
                Add extra cost
              </button>
              <button className="secondary-button" onClick={handleSavePrices}>
                Save ingredient prices
              </button>
              <button className="primary-button" onClick={handleSaveProfile}>
                Save selling setup
              </button>
            </div>

            <span className="status-chip">{status || "Ready to save"}</span>
          </GlassCard>

          <GlassCard title="What this bake earns" subtitle="These numbers update as you type.">
            <div className="metrics-grid">
              <MetricCard label="Ingredient cost" value={breakdown.ingredientCost} />
              <MetricCard label="Extra costs" value={breakdown.hiddenCostTotal} />
              <MetricCard label="Total batch cost" value={breakdown.totalCost} />
              <MetricCard label="Cost per item" value={breakdown.costPerUnit} />
              <MetricCard label="Selling price per item" value={breakdown.sellingPricePerUnit} />
              <MetricCard label="Profit per item" value={breakdown.profitPerUnit} tone="success" />
            </div>
          </GlassCard>
        </>
      ) : null}
    </div>
  );
}
