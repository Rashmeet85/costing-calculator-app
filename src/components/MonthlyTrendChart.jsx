import { formatCurrency } from "../utils/format";

export default function MonthlyTrendChart({ data }) {
  const maxValue = Math.max(...data.map((item) => item.profit || 0), 1);

  return (
    <div className="trend-chart">
      {data.map((item) => {
        const height = Math.max((item.profit / maxValue) * 100, 6);

        return (
          <div
            className="trend-column"
            key={item.label}
            title={`${item.label}: ${formatCurrency(item.profit)}`}
          >
            <div
              className="trend-bar"
              style={{ height: `${height}%` }}
            />
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
