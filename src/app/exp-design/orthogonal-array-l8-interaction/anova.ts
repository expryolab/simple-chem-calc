import { L8, type Level } from "../orthogonal-array-l8/anova";

/** L8 の列数 */
export const COLUMN_COUNT = 7;

/**
 * 列番号(1..7)を3ビットで見ると、列iと列jの交互作用は列 (i XOR j) に現れる。
 * 例: C1×C2→C3, C1×C4→C5, C2×C4→C6
 */
export const interactionColumn = (a: number, b: number): number => a ^ b;

/** 交互作用は因子インデックスのペア [i, j] (i < j) で表す */
export type Pair = readonly [number, number];

/**
 * 因子と交互作用が互いに重ならない(交絡しない)列割り当てを探す。
 * 戻り値は因子ごとの列番号(1..7)。割り当てられない場合は null。
 * 列番号の小さい順に探すので、教科書どおり A=C1, B=C2, C=C4 ... の形になりやすい。
 */
export function assignColumns(
  factorCount: number,
  pairs: readonly Pair[],
): number[] | null {
  if (factorCount + pairs.length > COLUMN_COUNT) return null;

  const columns: number[] = [];

  const search = (k: number): boolean => {
    if (k === factorCount) return true;
    for (let c = 1; c <= COLUMN_COUNT; c++) {
      if (columns.includes(c)) continue;
      columns.push(c);
      if (isConsistent(columns, pairs) && search(k + 1)) return true;
      columns.pop();
    }
    return false;
  };

  return search(0) ? [...columns] : null;
}

// 割り当て済みの因子列と、両端が割り当て済みの交互作用列がすべて異なるか
function isConsistent(columns: readonly number[], pairs: readonly Pair[]) {
  const used = new Set(columns);
  for (const [i, j] of pairs) {
    if (i >= columns.length || j >= columns.length) continue;
    const c = interactionColumn(columns[i], columns[j]);
    if (used.has(c)) return false;
    used.add(c);
  }
  return true;
}

export type InteractionFactorAnova = {
  name: string;
  /** 割り当てた列(1..7) */
  col: number;
  ss: number;
  df: number;
  ms: number;
  /** 水準1の平均 */
  mean1: number;
  /** 水準2の平均 */
  mean2: number;
  /** 効果 = 水準2の平均 - 水準1の平均 */
  effect: number;
  /** 寄与率(%)。全体平方和が0のときは 0 */
  contribution: number;
};

export type InteractionAnova = {
  name: string;
  /** 交互作用が現れる列(1..7) */
  col: number;
  /** 因子インデックスのペア */
  pair: Pair;
  ss: number;
  df: number;
  ms: number;
  /** 寄与率(%)。全体平方和が0のときは 0 */
  contribution: number;
  /** 2×2 の組み合わせ平均。cellMeans[因子iの水準-1][因子jの水準-1]（各セル2ラン） */
  cellMeans: [[number, number], [number, number]];
};

export type L8InteractionAnova = {
  factorEffects: InteractionFactorAnova[];
  interactionEffects: InteractionAnova[];
  totalSS: number;
  errorSS: number;
  errorDf: number;
  errorMs: number;
  /** 誤差の寄与率(%)。全体平方和が0のときは 0 */
  errorContribution: number;
  grandMean: number;
};

const mean = (values: readonly number[]): number =>
  values.reduce((sum, v) => sum + v, 0) / values.length;

/**
 * L8直交表（交互作用あり）の分散分析。
 * factorColumns[k] は因子kに割り当てた列番号(1..7)、pairs は調べる交互作用。
 * 結果が8ラン分そろっていない、因子が0個、または列の数が因子と合わないときは null。
 */
export const computeL8InteractionAnova = (
  results: readonly (number | null)[],
  factorNames: readonly string[],
  factorColumns: readonly number[],
  pairs: readonly Pair[],
): L8InteractionAnova | null => {
  if (results.length !== 8 || factorNames.length === 0) return null;
  if (factorColumns.length !== factorNames.length) return null;
  if (results.some((r) => r === null || Number.isNaN(r))) return null;
  const values = results as number[];

  const grandMean = mean(values);
  const totalSS = values.reduce((sum, v) => sum + (v - grandMean) ** 2, 0);
  const contribution = (ss: number): number =>
    totalSS > 0 ? (ss / totalSS) * 100 : 0;

  // 列の水準1/2で結果を分けて平方和を求める（2水準なので自由度は1）
  const columnStats = (col: number) => {
    const level1Runs: number[] = [];
    const level2Runs: number[] = [];
    L8.forEach((row, runIdx) => {
      (row[col - 1] === 1 ? level1Runs : level2Runs).push(values[runIdx]);
    });
    const mean1 = mean(level1Runs);
    const mean2 = mean(level2Runs);
    const ss =
      level1Runs.length * (mean1 - grandMean) ** 2 +
      level2Runs.length * (mean2 - grandMean) ** 2;
    return { ss, mean1, mean2 };
  };

  const factorEffects = factorNames.map(
    (name, k): InteractionFactorAnova => {
      const col = factorColumns[k];
      const { ss, mean1, mean2 } = columnStats(col);
      return {
        name,
        col,
        ss,
        df: 1,
        ms: ss,
        mean1,
        mean2,
        effect: mean2 - mean1,
        contribution: contribution(ss),
      };
    },
  );

  const interactionEffects = pairs.map((pair): InteractionAnova => {
    const [i, j] = pair;
    const col = interactionColumn(factorColumns[i], factorColumns[j]);
    const { ss } = columnStats(col);

    const cellMean = (la: Level, lb: Level): number =>
      mean(
        values.filter(
          (_, runIdx) =>
            L8[runIdx][factorColumns[i] - 1] === la &&
            L8[runIdx][factorColumns[j] - 1] === lb,
        ),
      );

    return {
      name: `${factorNames[i]}×${factorNames[j]}`,
      col,
      pair,
      ss,
      df: 1,
      ms: ss,
      contribution: contribution(ss),
      cellMeans: [
        [cellMean(1, 1), cellMean(1, 2)],
        [cellMean(2, 1), cellMean(2, 2)],
      ],
    };
  });

  // 誤差 = 全体 - 因子と交互作用の合計（全体の自由度は7）
  const modelSS = [...factorEffects, ...interactionEffects].reduce(
    (sum, e) => sum + e.ss,
    0,
  );
  const errorSS = totalSS - modelSS;
  const errorDf = COLUMN_COUNT - factorEffects.length - interactionEffects.length;
  const errorMs = errorDf > 0 ? errorSS / errorDf : 0;

  return {
    factorEffects,
    interactionEffects,
    totalSS,
    errorSS,
    errorDf,
    errorMs,
    errorContribution: contribution(errorSS),
    grandMean,
  };
};
