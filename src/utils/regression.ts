type Point = { x: number; y: number };

type LinearFit = {
  /** 傾き a（y = ax + b） */
  slope: number;
  /** 切片 b（原点通過の場合は 0） */
  intercept: number;
  /** 決定係数 R² */
  rSquared: number;
  /** 残差標準偏差 σ（自由度で割った不偏推定） */
  residualSd: number;
  /** 点数 */
  n: number;
  throughOrigin: boolean;
};

type FitResult = { ok: true; fit: LinearFit } | { ok: false; error: string };

const sum = (values: number[]): number => values.reduce((acc, v) => acc + v, 0);

/**
 * 最小二乗法による一次回帰。
 *
 * - 通常: y = ax + b、R² = 1 - SSres / Σ(y - ȳ)²、σ = √(SSres / (n - 2))
 * - 原点通過: y = ax、R² = 1 - SSres / Σy²（Excel の LINEST(定数=FALSE) と同じ定義）、
 *   σ = √(SSres / (n - 1))
 */
const linearRegression = (
  points: Point[],
  throughOrigin: boolean
): FitResult => {
  const n = points.length;
  const dof = throughOrigin ? n - 1 : n - 2;
  if (dof < 1) {
    return {
      ok: false,
      error: `標準液は${throughOrigin ? 2 : 3}点以上入力してください。`,
    };
  }

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  let slope: number;
  let intercept: number;

  if (throughOrigin) {
    const sxx = sum(xs.map((x) => x * x));
    if (sxx === 0) {
      return { ok: false, error: "濃度がすべて0のため計算できません。" };
    }
    slope = sum(points.map((p) => p.x * p.y)) / sxx;
    intercept = 0;
  } else {
    const xMean = sum(xs) / n;
    const yMean = sum(ys) / n;
    const sxx = sum(xs.map((x) => (x - xMean) ** 2));
    if (sxx === 0) {
      return {
        ok: false,
        error: "濃度がすべて同じ値のため計算できません。",
      };
    }
    const sxy = sum(points.map((p) => (p.x - xMean) * (p.y - yMean)));
    slope = sxy / sxx;
    intercept = yMean - slope * xMean;
  }

  if (slope === 0) {
    return {
      ok: false,
      error: "傾きが0のため濃度を逆算できません。応答値を確認してください。",
    };
  }

  const ssRes = sum(points.map((p) => (p.y - (slope * p.x + intercept)) ** 2));
  const yMean = sum(ys) / n;
  const ssTot = throughOrigin
    ? sum(ys.map((y) => y * y))
    : sum(ys.map((y) => (y - yMean) ** 2));
  const rSquared = ssTot === 0 ? Number.NaN : 1 - ssRes / ssTot;
  const residualSd = Math.sqrt(ssRes / dof);

  return {
    ok: true,
    fit: { slope, intercept, rSquared, residualSd, n, throughOrigin },
  };
};

/** 応答値 y から濃度 x を逆算する */
const inverseEstimate = (fit: LinearFit, y: number): number =>
  (y - fit.intercept) / fit.slope;

/** 検出下限 LOD = 3.3σ / a（ICH Q2 の残差標準偏差法） */
const limitOfDetection = (fit: LinearFit): number =>
  (3.3 * fit.residualSd) / Math.abs(fit.slope);

/** 定量下限 LOQ = 10σ / a（ICH Q2 の残差標準偏差法） */
const limitOfQuantitation = (fit: LinearFit): number =>
  (10 * fit.residualSd) / Math.abs(fit.slope);

export {
  linearRegression,
  inverseEstimate,
  limitOfDetection,
  limitOfQuantitation,
};
export type { Point, LinearFit, FitResult };
