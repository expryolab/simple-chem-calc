/** 水準(1/2) */
export type Level = 1 | 2;

// 行: 8 ラン、列: C1..C7。値は水準(1/2)
export const L8: readonly (readonly Level[])[] = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 2, 2, 2, 2],
  [1, 2, 2, 1, 1, 2, 2],
  [1, 2, 2, 2, 2, 1, 1],
  [2, 1, 2, 1, 2, 1, 2],
  [2, 1, 2, 2, 1, 2, 1],
  [2, 2, 1, 1, 2, 2, 1],
  [2, 2, 1, 2, 1, 1, 2],
] as const;

export type FactorAnova = {
  name: string;
  /** 平方和 */
  ss: number;
  /** 自由度（2水準なので常に1） */
  df: number;
  /** 平均平方 */
  ms: number;
  /** 水準1の平均 */
  mean1: number;
  /** 水準2の平均 */
  mean2: number;
  /** 効果 = 水準2の平均 - 水準1の平均 */
  effect: number;
  /** 寄与率(%)。全体平方和が0のときは NaN */
  contribution: number;
};

export type L8Anova = {
  factorEffects: FactorAnova[];
  totalSS: number;
  errorSS: number;
  errorDf: number;
  errorMs: number;
  grandMean: number;
};

/**
 * L8直交表（主効果のみ）の分散分析。
 * 因子の並び順がそのまま列 C1, C2, ... に対応する。
 * 結果が8ラン分そろっていない、または因子が0個のときは null。
 */
export const computeL8Anova = (
  results: readonly (number | null)[],
  factorNames: readonly string[],
): L8Anova | null => {
  if (results.length !== 8 || factorNames.length === 0) return null;
  if (results.some((r) => r === null || Number.isNaN(r))) return null;
  const values = results as number[];

  // 全体平均・全体平方和
  const grandMean = values.reduce((a, b) => a + b, 0) / 8;
  const totalSS = values.reduce((sum, v) => sum + (v - grandMean) ** 2, 0);

  const factorEffects = factorNames.map((name, colIdx): FactorAnova => {
    // この列で水準1・水準2になるランの結果を振り分ける
    const level1Runs: number[] = [];
    const level2Runs: number[] = [];
    L8.forEach((row, runIdx) => {
      (row[colIdx] === 1 ? level1Runs : level2Runs).push(values[runIdx]);
    });

    const mean1 = level1Runs.reduce((a, b) => a + b, 0) / level1Runs.length;
    const mean2 = level2Runs.reduce((a, b) => a + b, 0) / level2Runs.length;
    const ss =
      level1Runs.length * (mean1 - grandMean) ** 2 +
      level2Runs.length * (mean2 - grandMean) ** 2;
    const df = 1;

    return {
      name,
      ss,
      df,
      ms: ss / df,
      mean1,
      mean2,
      effect: mean2 - mean1,
      contribution: (ss / totalSS) * 100,
    };
  });

  // 誤差 = 全体 - 因子の合計（全体の自由度は7）
  const factorSS = factorEffects.reduce((sum, f) => sum + f.ss, 0);
  const errorSS = totalSS - factorSS;
  const errorDf = 7 - factorNames.length;
  const errorMs = errorDf > 0 ? errorSS / errorDf : 0;

  return { factorEffects, totalSS, errorSS, errorDf, errorMs, grandMean };
};
