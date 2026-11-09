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

/**
 * 有効数字で丸めてフォーマット（負の値・指数表記が必要な値にも対応）。
 * 傾き・切片など符号を持ちうる値に使う。
 */
const formatSignificant = (value: number, digits = 4): string => {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e6 || abs < 1e-4) return value.toExponential(digits - 1);
  // toPrecision の結果を Number に戻して末尾の不要な 0 を落とす
  return String(Number(value.toPrecision(digits)));
};

export { unitOptions, toGrams, formatResult, formatSignificant };
export type { Unit };
