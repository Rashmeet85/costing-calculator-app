const UNIT_DEFINITIONS = [
  { value: "g", label: "g", group: "weight", baseUnit: "g", multiplier: 1 },
  { value: "kg", label: "kg", group: "weight", baseUnit: "g", multiplier: 1000 },
  { value: "mg", label: "mg", group: "weight", baseUnit: "g", multiplier: 0.001 },
  { value: "ml", label: "ml", group: "volume", baseUnit: "ml", multiplier: 1 },
  { value: "l", label: "L", group: "volume", baseUnit: "ml", multiplier: 1000 },
  { value: "tsp", label: "tsp", group: "volume", baseUnit: "ml", multiplier: 5 },
  { value: "tbsp", label: "tbsp", group: "volume", baseUnit: "ml", multiplier: 15 },
  { value: "cup", label: "cup", group: "volume", baseUnit: "ml", multiplier: 240 },
  { value: "pcs", label: "pcs", group: "count", baseUnit: "pcs", multiplier: 1 },
  { value: "dozen", label: "dozen", group: "count", baseUnit: "pcs", multiplier: 12 },
];

const UNIT_ALIASES = {
  gram: "g",
  grams: "g",
  gm: "g",
  gms: "g",
  kilogram: "kg",
  kilograms: "kg",
  kilo: "kg",
  kilos: "kg",
  milligram: "mg",
  milligrams: "mg",
  milliliter: "ml",
  milliliters: "ml",
  millilitre: "ml",
  millilitres: "ml",
  liter: "l",
  liters: "l",
  litre: "l",
  litres: "l",
  teaspoon: "tsp",
  teaspoons: "tsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  piece: "pcs",
  pieces: "pcs",
  pc: "pcs",
};

export const UNIT_OPTIONS = UNIT_DEFINITIONS.map((unit) => ({
  value: unit.value,
  label: unit.label,
  group: unit.group,
}));

export function normalizeUnit(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return UNIT_ALIASES[normalized] || normalized || "pcs";
}

export function getUnitLabel(value) {
  const normalized = normalizeUnit(value);
  return UNIT_DEFINITIONS.find((unit) => unit.value === normalized)?.label || value || "pcs";
}

export function getUnitOptionsFor(value) {
  const normalized = normalizeUnit(value);
  const current = UNIT_DEFINITIONS.find((unit) => unit.value === normalized);

  if (!current) {
    return UNIT_OPTIONS;
  }

  return UNIT_OPTIONS.filter((unit) => unit.group === current.group);
}

export function convertValue(value, fromUnit, toUnit) {
  const safeValue = Number(value || 0);
  const normalizedFrom = normalizeUnit(fromUnit);
  const normalizedTo = normalizeUnit(toUnit);

  if (!Number.isFinite(safeValue)) {
    return 0;
  }

  if (normalizedFrom === normalizedTo) {
    return safeValue;
  }

  const source = UNIT_DEFINITIONS.find((unit) => unit.value === normalizedFrom);
  const target = UNIT_DEFINITIONS.find((unit) => unit.value === normalizedTo);

  if (!source || !target || source.baseUnit !== target.baseUnit) {
    return Number.NaN;
  }

  const baseValue = safeValue * source.multiplier;
  return baseValue / target.multiplier;
}
