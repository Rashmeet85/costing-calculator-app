import { useEffect, useMemo, useState } from "react";
import GlassCard from "../components/GlassCard";
import MetricCard from "../components/MetricCard";
import { subscribeSales } from "../services/sales";
import {
  buildCalendarDays,
  calculateDateMetrics,
  getTodayKey,
  getMonthLabel,
  moveMonth,
} from "../utils/costing";

export default function CalendarPage({ user }) {
  const [sales, setSales] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(getTodayKey);

  useEffect(() => subscribeSales(user.uid, setSales), [user.uid]);

  const days = useMemo(
    () => buildCalendarDays(currentMonth, sales),
    [currentMonth, sales],
  );
  const selectedMetrics = useMemo(
    () => calculateDateMetrics(selectedDateKey, sales),
    [selectedDateKey, sales],
  );

  return (
    <div className="page-stack">
      <section className="page-hero">
        <p className="eyebrow">Calendar</p>
        <h2>Look at any day</h2>
        <p className="muted">
          Tap a date to see how much came in, what it cost, and what was left as profit.
        </p>
      </section>

      <GlassCard
        title="Daily view"
        subtitle="Your month laid out in a simple grid."
        action={
          <div className="button-row compact">
            <button className="secondary-button" onClick={() => setCurrentMonth((current) => moveMonth(current, -1))}>
              Previous
            </button>
            <button className="secondary-button" onClick={() => setCurrentMonth((current) => moveMonth(current, 1))}>
              Next
            </button>
          </div>
        }
      >
        <div className="calendar-header">
          <h3>{getMonthLabel(currentMonth)}</h3>
        </div>
        <div className="calendar-grid">
          {days.map((day) => (
            <button
              key={day.key}
              className={day.currentMonth ? "calendar-day" : "calendar-day muted-day"}
              onClick={() => setSelectedDateKey(day.dateKey)}
            >
              <span>{day.date.getDate()}</span>
              <small>{day.salesCount} sales</small>
              <strong>{day.profitDisplay}</strong>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard
        title="Selected day"
        subtitle={selectedDateKey ? `Showing ${selectedDateKey}` : "Choose a date"}
      >
        <div className="metrics-grid">
          <MetricCard label="Sales amount" value={selectedMetrics.revenue} />
          <MetricCard label="Cost" value={selectedMetrics.cost} />
          <MetricCard label="Profit" value={selectedMetrics.profit} tone="success" />
        </div>

        <div className="list-stack">
          {selectedMetrics.entries.length ? (
            selectedMetrics.entries.map((entry) => (
              <div className="list-row" key={entry.id}>
                <div>
                  <strong>{entry.recipeName}</strong>
                  <p className="muted">{entry.quantity} sold</p>
                </div>
                <strong>{entry.profitDisplay}</strong>
              </div>
            ))
          ) : (
            <p className="muted">No sales logged for this date yet.</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
