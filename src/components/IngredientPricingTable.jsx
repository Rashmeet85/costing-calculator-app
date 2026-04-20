import { formatCurrency } from "../utils/format";
import { convertValue, getUnitLabel, getUnitOptionsFor, normalizeUnit } from "../utils/units";

export default function IngredientPricingTable({
  ingredients,
  priceDrafts,
  onPriceChange,
}) {
  return (
    <div className="pricing-list">
      {ingredients.map((ingredient) => {
        const draft = priceDrafts[ingredient.key] || {};
        const pricingUnit = normalizeUnit(draft.pricingUnit || ingredient.unit);
        const convertedQuantity = convertValue(
          ingredient.quantity,
          ingredient.unit,
          pricingUnit,
        );
        const lineCost = Number.isFinite(convertedQuantity)
          ? convertedQuantity * Number(draft.pricePerUnit || 0)
          : 0;

        return (
          <div className="pricing-item" key={ingredient.key}>
            <div className="pricing-item-copy">
              <strong>{ingredient.name}</strong>
              <p className="muted">
                Recipe uses {ingredient.quantity} {getUnitLabel(ingredient.unit)}
              </p>
            </div>

            <div className="pricing-item-fields">
              <label className="field">
                <span>Price unit</span>
                <select
                  value={pricingUnit}
                  onChange={(event) =>
                    onPriceChange(ingredient.key, {
                      ...draft,
                      name: ingredient.name,
                      unit: ingredient.unit,
                      pricingUnit: event.target.value,
                      pricePerUnit: draft.pricePerUnit ?? "",
                    })
                  }
                >
                  {getUnitOptionsFor(ingredient.unit).map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Rate in Rs.</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.pricePerUnit ?? ""}
                  onChange={(event) =>
                    onPriceChange(ingredient.key, {
                      ...draft,
                      name: ingredient.name,
                      unit: ingredient.unit,
                      pricingUnit,
                      pricePerUnit: event.target.value,
                    })
                  }
                />
              </label>
            </div>

            <div className="pricing-item-summary">
              <span className="muted">
                {Number.isFinite(convertedQuantity)
                  ? `${convertedQuantity.toFixed(2)} ${getUnitLabel(pricingUnit)} used`
                  : "Use the same unit to price this ingredient"}
              </span>
              <strong>{formatCurrency(lineCost)}</strong>
            </div>
          </div>
        );
      })}
    </div>
  );
}
