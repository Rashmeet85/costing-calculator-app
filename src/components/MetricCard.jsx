import { formatCurrency, formatNumber } from "../utils/format";

export default function MetricCard({
  label,
  value,
  tone = "default",
  currency = true,
}) {
  return (
    <div className={`metric-card metric-${tone}`}>
      <span>{label}</span>
      <strong>{currency ? formatCurrency(value) : formatNumber(value)}</strong>
    </div>
  );
}
