const unitOptions = ["g", "mg"] as const;
type Unit = (typeof unitOptions)[number];

/** mg → g に変換 */
const toGrams = (value: number, unit: Unit): number =>
  unit === "mg" ? value / 1000 : value;

/** 値の大きさに応じて有効桁数を調整してフォーマット */
const formatResult = (value: number): string => {
  if (value >= 1) return value.toFixed(1);
  if (value === 0) return "0";
  // 小数点以下の有効数字が見えるよう桁数を増やす（最大6桁）
  const digits = Math.min(6, Math.max(1, -Math.floor(Math.log10(value)) + 2));
  return value.toFixed(digits);
};

export { unitOptions, toGrams, formatResult };
export type { Unit };
