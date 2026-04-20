import { formatCurrency, getDateKeyFromValue } from "./format";
import { convertValue, getUnitLabel, normalizeUnit } from "./units";

export function createBlankIngredient() {
  return {
    key: crypto.randomUUID(),
    name: "",
    quantity: 0,
    unit: "g",
  };
}

export function createHiddenCost() {
  return {
    id: crypto.randomUUID(),
    label: "Box / packaging",
    amount: 0,
  };
}

export function calculateCostBreakdown({
  recipe,
  hiddenCosts,
  priceDrafts,
  yieldCount,
  yieldUnit,
  profitPercent,
  manualSellingPrice,
}) {
  if (!recipe) {
    return {
      ingredientCost: 0,
      hiddenCostTotal: 0,
      totalCost: 0,
      costPerUnit: 0,
      sellingPrice: 0,
      profitAmount: 0,
      yieldUnit: getUnitLabel(yieldUnit),
    };
  }

  const ingredientCost = recipe.ingredients.reduce((sum, ingredient) => {
    const draft = priceDrafts[ingredient.key] || {};
    const recipeUnit = normalizeUnit(ingredient.unit);
    const pricingUnit = normalizeUnit(draft.pricingUnit || recipeUnit);
    const convertedQuantity = convertValue(ingredient.quantity, recipeUnit, pricingUnit);

    if (!Number.isFinite(convertedQuantity)) {
      return sum;
    }

    return sum + convertedQuantity * Number(draft.pricePerUnit || 0);
  }, 0);

  const hiddenCostTotal = hiddenCosts.reduce(
    (sum, cost) => sum + Number(cost.amount || 0),
    0,
  );
  const totalCost = ingredientCost + hiddenCostTotal;
  const suggestedSellingPrice = totalCost * (1 + Number(profitPercent || 0) / 100);
  const sellingPrice = Number(manualSellingPrice || 0) || suggestedSellingPrice;
  const profitAmount = sellingPrice - totalCost;
  const safeYield = Math.max(Number(yieldCount || recipe.yield || 1), 1);

  return {
    ingredientCost,
    hiddenCostTotal,
    totalCost,
    costPerUnit: totalCost / safeYield,
    sellingPricePerUnit: sellingPrice / safeYield,
    profitPerUnit: profitAmount / safeYield,
    sellingPrice,
    profitAmount,
    yieldUnit: getUnitLabel(yieldUnit),
  };
}

export function calculateSalePreview(profile, quantity, extraCost) {
  if (!profile) {
    return { revenue: 0, cost: 0, profit: 0 };
  }

  const safeQuantity = Math.max(Number(quantity || 0), 0);
  const revenue = safeQuantity * Number(profile.sellingPricePerUnit || 0);
  const cost = safeQuantity * Number(profile.costPerUnit || 0) + Number(extraCost || 0);

  return {
    revenue,
    cost,
    profit: revenue - cost,
  };
}

export function calculateDashboardMetrics(sales) {
  const todayKey = getTodayKey();
  const monthKey = todayKey.slice(0, 7);

  return sales.reduce(
    (metrics, sale) => {
      if (sale.dateKey === todayKey) {
        metrics.todayRevenue += Number(sale.revenue || 0);
        metrics.todayProfit += Number(sale.profit || 0);
      }

      if ((sale.dateKey || "").startsWith(monthKey)) {
        metrics.monthRevenue += Number(sale.revenue || 0);
        metrics.monthProfit += Number(sale.profit || 0);
      }

      return metrics;
    },
    {
      todayRevenue: 0,
      todayProfit: 0,
      monthRevenue: 0,
      monthProfit: 0,
    },
  );
}

export function buildMonthlyTrend(sales) {
  const now = new Date();
  const items = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const month = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const prefix = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
    const profit = sales
      .filter((sale) => (sale.dateKey || "").startsWith(prefix))
      .reduce((sum, sale) => sum + Number(sale.profit || 0), 0);

    items.push({
      label: month.toLocaleDateString(undefined, { month: "short" }),
      profit,
    });
  }

  return items;
}

export function getTodayKey() {
  return getDateKeyFromValue(new Date());
}

export function moveMonth(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function getMonthLabel(date) {
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function buildCalendarDays(currentMonth, sales) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const first = new Date(year, month, 1);
  const firstDayOffset = first.getDay();
  const start = new Date(year, month, 1 - firstDayOffset);
  const items = [];

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    const dateKey = getDateKeyFromValue(date);
    const daySales = sales.filter((sale) => sale.dateKey === dateKey);
    const profit = daySales.reduce((sum, sale) => sum + Number(sale.profit || 0), 0);

    items.push({
      key: `${dateKey}-${index}`,
      date,
      dateKey,
      currentMonth: date.getMonth() === month,
      salesCount: daySales.length,
      profitDisplay: formatCurrency(profit),
    });
  }

  return items;
}

export function calculateDateMetrics(dateKey, sales) {
  const entries = sales.filter((sale) => sale.dateKey === dateKey);

  return {
    revenue: entries.reduce((sum, sale) => sum + Number(sale.revenue || 0), 0),
    cost: entries.reduce((sum, sale) => sum + Number(sale.cost || 0), 0),
    profit: entries.reduce((sum, sale) => sum + Number(sale.profit || 0), 0),
    entries,
  };
}
