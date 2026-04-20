import { useEffect, useMemo, useState } from "react";
import GlassCard from "../components/GlassCard";
import MetricCard from "../components/MetricCard";
import { createSale, subscribeSales } from "../services/sales";
import { subscribeRecipeProfiles } from "../services/profiles";
import { calculateDashboardMetrics, calculateSalePreview } from "../utils/costing";

export default function SalesPage({ user }) {
  const [profiles, setProfiles] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [extraCost, setExtraCost] = useState(0);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const unsubscribeProfiles = subscribeRecipeProfiles(user.uid, setProfiles);
    const unsubscribeSales = subscribeSales(user.uid, setSales);

    return () => {
      unsubscribeProfiles();
      unsubscribeSales();
    };
  }, [user.uid]);

  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId);
  const preview = useMemo(
    () => calculateSalePreview(selectedProfile, quantity, extraCost),
    [selectedProfile, quantity, extraCost],
  );
  const metrics = useMemo(() => calculateDashboardMetrics(sales), [sales]);

  const handleSave = async () => {
    if (!selectedProfile) {
      return;
    }

    await createSale(user.uid, {
      profileId: selectedProfile.id,
      recipeId: selectedProfile.recipeId,
      recipeName: selectedProfile.recipeName,
      quantity,
      unitLabel: selectedProfile.unitLabel,
      extraCost,
      revenue: preview.revenue,
      cost: preview.cost,
      profit: preview.profit,
    });

    setStatus("Sale added for today.");
    setQuantity(1);
    setExtraCost(0);
  };

  return (
    <div className="page-stack">
      <section className="page-hero">
        <p className="eyebrow">Sales Today</p>
        <h2>Log what sold</h2>
        <p className="muted">
          Choose a saved selling setup, enter how many sold, and the app works
          out the money for you.
        </p>
      </section>

      <GlassCard title="Add today's sale" subtitle="Quick entry, clear profit.">
        <div className="form-grid">
          <label className="field">
            <span>Recipe</span>
            <select value={selectedProfileId} onChange={(event) => setSelectedProfileId(event.target.value)}>
              <option value="">Select a saved setup</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.recipeName}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>How many sold?</span>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value || 1))}
            />
          </label>
          <label className="field">
            <span>Extra cost today</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={extraCost}
              onChange={(event) => setExtraCost(Number(event.target.value || 0))}
            />
          </label>
        </div>

        <div className="metrics-grid">
          <MetricCard label="Sales amount" value={preview.revenue} />
          <MetricCard label="Cost" value={preview.cost} />
          <MetricCard label="Profit" value={preview.profit} tone="success" />
        </div>

        <div className="button-row">
          <button className="primary-button" onClick={handleSave}>
            Save today's sale
          </button>
          <span className="status-chip">{status || "Pick a recipe setup to begin"}</span>
        </div>
      </GlassCard>

      <GlassCard title="Today so far" subtitle="Updates as soon as you save a sale.">
        <div className="metrics-grid">
          <MetricCard label="Today's sales" value={metrics.todayRevenue} />
          <MetricCard label="Today's profit" value={metrics.todayProfit} tone="success" />
          <MetricCard label="Month sales" value={metrics.monthRevenue} />
          <MetricCard label="Month profit" value={metrics.monthProfit} tone="success" />
        </div>
      </GlassCard>

      <GlassCard title="Recent sales" subtitle="Your latest entries in one list.">
        <div className="list-stack">
          {sales.length ? (
            sales.slice(0, 10).map((sale) => (
              <div className="list-row" key={sale.id}>
                <div>
                  <strong>{sale.recipeName}</strong>
                  <p className="muted">{sale.readableDate}</p>
                </div>
                <strong>{sale.profitDisplay}</strong>
              </div>
            ))
          ) : (
            <p className="muted">No sales saved yet.</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
