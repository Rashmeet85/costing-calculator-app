import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import MetricCard from "../components/MetricCard";
import MonthlyTrendChart from "../components/MonthlyTrendChart";
import { subscribeRecipeProfiles } from "../services/profiles";
import { subscribeSales } from "../services/sales";
import {
  buildMonthlyTrend,
  calculateDashboardMetrics,
  getTodayKey,
} from "../utils/costing";

export default function DashboardPage({ user }) {
  const [profiles, setProfiles] = useState([]);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    const unsubscribeProfiles = subscribeRecipeProfiles(user.uid, setProfiles);
    const unsubscribeSales = subscribeSales(user.uid, setSales);

    return () => {
      unsubscribeProfiles();
      unsubscribeSales();
    };
  }, [user.uid]);

  const metrics = useMemo(() => calculateDashboardMetrics(sales), [sales]);
  const trend = useMemo(() => buildMonthlyTrend(sales), [sales]);
  const todaysEntries = useMemo(
    () => sales.filter((sale) => sale.dateKey === getTodayKey()),
    [sales],
  );

  return (
    <div className="page-stack">
      <section className="page-hero">
        <p className="eyebrow">Insights</p>
        <h2>Your bakery at a glance</h2>
        <p className="muted">
          See what came in today, what the month is doing, and which recipes are
          ready for sales logging.
        </p>
      </section>

      <GlassCard title="Today and this month" subtitle="Simple numbers you can trust.">
        <div className="metrics-grid">
          <MetricCard label="Today's sales" value={metrics.todayRevenue} />
          <MetricCard label="Today's profit" value={metrics.todayProfit} tone="success" />
          <MetricCard label="Month sales" value={metrics.monthRevenue} />
          <MetricCard label="Month profit" value={metrics.monthProfit} tone="success" />
        </div>
      </GlassCard>

      <GlassCard title="Monthly trend" subtitle="A quick view of how profit is moving.">
        <MonthlyTrendChart data={trend} />
      </GlassCard>

      <GlassCard
        title="Today's entries"
        subtitle={`${todaysEntries.length} sale${todaysEntries.length === 1 ? "" : "s"} logged today.`}
        action={<Link className="primary-button inline-button" to="/sales">Add sale</Link>}
      >
        <div className="list-stack">
          {todaysEntries.length ? (
            todaysEntries.slice(0, 5).map((entry) => (
              <div className="list-row" key={entry.id}>
                <div>
                  <strong>{entry.recipeName}</strong>
                  <p className="muted">
                    {entry.quantity} {entry.unitLabel}
                  </p>
                </div>
                <strong>{entry.profitDisplay}</strong>
              </div>
            ))
          ) : (
            <p className="muted">No sales added yet today.</p>
          )}
        </div>
      </GlassCard>

      <GlassCard
        title="Saved selling setups"
        subtitle="These are ready to use in the sales page."
        action={<Link className="secondary-button inline-button" to="/">Open recipes</Link>}
      >
        <div className="list-stack">
          {profiles.length ? (
            profiles.slice(0, 5).map((profile) => (
              <div className="list-row" key={profile.id}>
                <div>
                  <strong>{profile.recipeName}</strong>
                  <p className="muted">{profile.sourceApp === "recipe-app" ? "Imported recipe" : "Custom recipe"}</p>
                </div>
                <strong>{profile.sellingPriceDisplay} / {profile.unitLabel}</strong>
              </div>
            ))
          ) : (
            <p className="muted">Save a selling setup from the pricing screen and it will appear here.</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
