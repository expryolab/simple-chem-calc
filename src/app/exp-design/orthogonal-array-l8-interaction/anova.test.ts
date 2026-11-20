import { describe, expect, test } from "vitest";
import { computeL8Anova } from "../orthogonal-array-l8/anova";
import {
  assignColumns,
  computeL8InteractionAnova,
  interactionColumn,
  type Pair,
} from "./anova";

/**
 * ダミーデータ：合成反応の収率(%)を上げる条件探し
 * 温度(60℃/80℃), 反応時間(1h/3h), 触媒量(1mol%/2mol%) の3因子と
 * 交互作用 温度×反応時間, 温度×触媒量 を調べる。
 * 列は 温度=C1, 反応時間=C2, 触媒量=C4, 温度×反応時間=C3, 温度×触媒量=C5、
 * 空き列 C6・C7 が誤差（自由度2）。
 * 期待値は手計算（水準別平均・2×2の組み合わせ平均・平方和）で確認済み。
 */
const FACTORS = ["温度", "反応時間", "触媒量"];
const COLUMNS = [1, 2, 4];
const PAIRS: Pair[] = [
  [0, 1],
  [0, 2],
];

/**
 * パターン1：温度×反応時間に強い交互作用がある
 * （60℃なら長時間ほど良いが、80℃では長時間だと分解して下がる）
 */
const RESULTS_INTERACTION = [59.7, 62.4, 71.1, 75.0, 74.9, 78.9, 67.0, 71.2];

/** パターン2：交互作用がなく、主効果だけが効いている */
const RESULTS_NO_INTERACTION = [62.4, 64.7, 66.8, 70.3, 70.2, 72.6, 75.3, 77.9];

/** 浮動小数点の誤差を許容して比較する桁数 */
const DIGITS = 6;

describe("interactionColumn", () => {
  test.each([
    [1, 2, 3],
    [1, 4, 5],
    [2, 4, 6],
    [3, 4, 7],
    [1, 6, 7],
    // 列番号のビットが重なる場合（単純な和や OR では求まらない）
    [1, 3, 2],
    [3, 5, 6],
    [6, 7, 1],
  ])("C%i × C%i の交互作用は C%i に現れる", (a, b, expected) => {
    expect(interactionColumn(a, b)).toBe(expected);
    expect(interactionColumn(b, a)).toBe(expected);
  });
});

describe("assignColumns", () => {
  test.each<[string, number, Pair[], number[]]>([
    ["1因子", 1, [], [1]],
    ["2因子 + A×B", 2, [[0, 1]], [1, 2]],
    ["3因子 + A×B, A×C", 3, [[0, 1], [0, 2]], [1, 2, 4]],
    ["3因子 + 全ての交互作用", 3, [[0, 1], [0, 2], [1, 2]], [1, 2, 4]],
    ["4因子 + A×B（Dは空いている最小の列 C5）", 4, [[0, 1]], [1, 2, 4, 5]],
    ["4因子 + A×B, A×C, B×C（7列すべて使用）", 4, [[0, 1], [0, 2], [1, 2]], [1, 2, 4, 7]],
    ["7因子・交互作用なし", 7, [], [1, 2, 3, 4, 5, 6, 7]],
  ])("%s", (_, factorCount, pairs, expected) => {
    expect(assignColumns(factorCount, pairs)).toEqual(expected);
  });

  test("割り当てた因子・交互作用の列はすべて異なる（交絡しない）", () => {
    const pairs: Pair[] = [
      [0, 1],
      [0, 2],
      [1, 2],
    ];
    const columns = assignColumns(4, pairs)!;
    const used = [
      ...columns,
      ...pairs.map(([i, j]) => interactionColumn(columns[i], columns[j])),
    ];
    expect(new Set(used).size).toBe(used.length);
  });

  test("因子と交互作用の合計が7列を超えると null", () => {
    const allPairs: Pair[] = [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 2],
      [1, 3],
      [2, 3],
    ];
    expect(assignColumns(4, allPairs)).toBeNull();
    expect(assignColumns(8, [])).toBeNull();
  });

  test("列数が足りていても交絡を避けられない組み合わせは null", () => {
    // A×B と C×D は、どう割り当てても他の因子・交互作用と同じ列に現れる
    expect(
      assignColumns(4, [
        [0, 1],
        [2, 3],
      ]),
    ).toBeNull();
    // 4因子 + A×B, A×C, A×D, B×C は8列分になるので割り当てられない
    expect(
      assignColumns(4, [
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 2],
      ]),
    ).toBeNull();
  });
});

describe("computeL8InteractionAnova: 交互作用があるダミーデータ（パターン1）", () => {
  const anova = computeL8InteractionAnova(
    RESULTS_INTERACTION,
    FACTORS,
    COLUMNS,
    PAIRS,
  )!;
  const factorOf = (name: string) =>
    anova.factorEffects.find((f) => f.name === name)!;
  const interactionOf = (name: string) =>
    anova.interactionEffects.find((x) => x.name === name)!;

  test("結果が返る", () => {
    expect(anova).not.toBeNull();
    expect(anova.factorEffects.map((f) => f.name)).toEqual(FACTORS);
    expect(anova.interactionEffects.map((x) => x.name)).toEqual([
      "温度×反応時間",
      "温度×触媒量",
    ]);
  });

  test("全体平均と全体平方和", () => {
    expect(anova.grandMean).toBeCloseTo(70.025, DIGITS);
    expect(anova.totalSS).toBeCloseTo(303.715, DIGITS);
  });

  test.each([
    // [因子, 列, 水準1の平均, 水準2の平均, 効果, 平方和]
    ["温度", 1, 67.05, 73.0, 5.95, 70.805],
    ["反応時間", 2, 68.975, 71.075, 2.1, 8.82],
    ["触媒量", 4, 68.175, 71.875, 3.7, 27.38],
  ] as const)(
    "%s（C%i）の水準別平均・効果・平方和",
    (name, col, m1, m2, effect, ss) => {
      const f = factorOf(name);
      expect(f.col).toBe(col);
      expect(f.mean1).toBeCloseTo(m1, DIGITS);
      expect(f.mean2).toBeCloseTo(m2, DIGITS);
      expect(f.effect).toBeCloseTo(effect, DIGITS);
      expect(f.ss).toBeCloseTo(ss, DIGITS);
      expect(f.df).toBe(1);
      expect(f.ms).toBeCloseTo(ss, DIGITS);
    },
  );

  test.each([
    // [交互作用, 列, 平方和, 2×2の組み合わせ平均]
    ["温度×反応時間", 3, 196.02, [[61.05, 73.05], [76.9, 69.1]]],
    ["温度×触媒量", 5, 0.32, [[65.4, 68.7], [70.95, 75.05]]],
  ] as const)(
    "%s（C%i）の平方和と2×2の組み合わせ平均",
    (name, col, ss, cells) => {
      const x = interactionOf(name);
      expect(x.col).toBe(col);
      expect(x.ss).toBeCloseTo(ss, DIGITS);
      expect(x.df).toBe(1);
      expect(x.ms).toBeCloseTo(ss, DIGITS);
      x.cellMeans.forEach((row, la) =>
        row.forEach((v, lb) => expect(v).toBeCloseTo(cells[la][lb], DIGITS)),
      );
    },
  );

  test("交互作用の平方和は、2×2の組み合わせ平均から求めた値と一致する", () => {
    // SS(A×B) = Σ セル数(2) × (セル平均 - Aの水準平均 - Bの水準平均 + 全体平均)^2
    for (const x of anova.interactionEffects) {
      const a = anova.factorEffects[x.pair[0]];
      const b = anova.factorEffects[x.pair[1]];
      const aMeans = [a.mean1, a.mean2];
      const bMeans = [b.mean1, b.mean2];
      let ss = 0;
      x.cellMeans.forEach((row, la) =>
        row.forEach((v, lb) => {
          ss += 2 * (v - aMeans[la] - bMeans[lb] + anova.grandMean) ** 2;
        }),
      );
      expect(x.ss).toBeCloseTo(ss, DIGITS);
    }
  });

  test("寄与率は 温度×反応時間 > 温度 > 触媒量 > 反応時間 > 温度×触媒量", () => {
    const order = [...anova.factorEffects, ...anova.interactionEffects]
      .sort((a, b) => b.contribution - a.contribution)
      .map((e) => e.name);
    expect(order).toEqual([
      "温度×反応時間",
      "温度",
      "触媒量",
      "反応時間",
      "温度×触媒量",
    ]);
    expect(interactionOf("温度×反応時間").contribution).toBeCloseTo(
      (196.02 / 303.715) * 100,
      DIGITS,
    );
  });

  test("温度×反応時間は線が交差する（60℃では3hが高く、80℃では1hが高い）", () => {
    const [[low1h, low3h], [high1h, high3h]] =
      interactionOf("温度×反応時間").cellMeans;
    expect(low3h).toBeGreaterThan(low1h);
    expect(high1h).toBeGreaterThan(high3h);
  });

  test("誤差：自由度2、平方和 = 全体 - 因子と交互作用の合計", () => {
    expect(anova.errorDf).toBe(2);
    expect(anova.errorSS).toBeCloseTo(0.37, DIGITS);
    expect(anova.errorMs).toBeCloseTo(0.185, DIGITS);
    expect(anova.errorContribution).toBeCloseTo((0.37 / 303.715) * 100, DIGITS);
  });

  test("因子・交互作用・誤差の寄与率を足すと100%", () => {
    const sum =
      anova.factorEffects.reduce((s, f) => s + f.contribution, 0) +
      anova.interactionEffects.reduce((s, x) => s + x.contribution, 0) +
      anova.errorContribution;
    expect(sum).toBeCloseTo(100, DIGITS);
  });
});

describe("computeL8InteractionAnova: 交互作用がないダミーデータ（パターン2）", () => {
  const anova = computeL8InteractionAnova(
    RESULTS_NO_INTERACTION,
    FACTORS,
    COLUMNS,
    PAIRS,
  )!;

  test("全体平均と全体平方和", () => {
    expect(anova.grandMean).toBeCloseTo(70.025, DIGITS);
    expect(anova.totalSS).toBeCloseTo(193.475, DIGITS);
  });

  test.each([
    ["温度", 7.95, 126.405],
    ["反応時間", 5.1, 52.02],
    ["触媒量", 2.7, 14.58],
  ] as const)("%s の効果と平方和", (name, effect, ss) => {
    const f = anova.factorEffects.find((e) => e.name === name)!;
    expect(f.effect).toBeCloseTo(effect, DIGITS);
    expect(f.ss).toBeCloseTo(ss, DIGITS);
  });

  test("交互作用の平方和はほぼ0（寄与率0.1%未満）", () => {
    const [ab, ac] = anova.interactionEffects;
    expect(ab.ss).toBeCloseTo(0.02, DIGITS);
    expect(ac.ss).toBeCloseTo(0.08, DIGITS);
    for (const x of anova.interactionEffects) {
      expect(x.contribution).toBeLessThan(0.1);
    }
  });

  test("組み合わせ平均の線はほぼ平行（水準による差の違いが小さい）", () => {
    for (const x of anova.interactionEffects) {
      const [[c11, c12], [c21, c22]] = x.cellMeans;
      expect(Math.abs(c12 - c11 - (c22 - c21))).toBeLessThan(0.5);
    }
  });
});

describe("computeL8InteractionAnova: 入力が不完全・特殊なケース", () => {
  test("結果が1つでも未入力なら null", () => {
    const partial = [...RESULTS_INTERACTION.slice(0, 7), null];
    expect(
      computeL8InteractionAnova(partial, FACTORS, COLUMNS, PAIRS),
    ).toBeNull();
  });

  test("因子が0個なら null", () => {
    expect(computeL8InteractionAnova(RESULTS_INTERACTION, [], [], [])).toBeNull();
  });

  test("因子と列の数が合わないなら null", () => {
    expect(
      computeL8InteractionAnova(RESULTS_INTERACTION, FACTORS, [1, 2], PAIRS),
    ).toBeNull();
  });

  test("交互作用を選ばず C1.. に順に割り当てると、L8（主効果のみ）と同じ結果になる", () => {
    const names = ["A", "B", "C", "D", "E"];
    const withInteraction = computeL8InteractionAnova(
      RESULTS_INTERACTION,
      names,
      [1, 2, 3, 4, 5],
      [],
    )!;
    const simple = computeL8Anova(RESULTS_INTERACTION, names)!;

    withInteraction.factorEffects.forEach((f, i) => {
      expect(f.mean1).toBeCloseTo(simple.factorEffects[i].mean1, DIGITS);
      expect(f.mean2).toBeCloseTo(simple.factorEffects[i].mean2, DIGITS);
      expect(f.ss).toBeCloseTo(simple.factorEffects[i].ss, DIGITS);
    });
    expect(withInteraction.errorSS).toBeCloseTo(simple.errorSS, DIGITS);
    expect(withInteraction.errorDf).toBe(simple.errorDf);
  });

  test("7列すべて使うと誤差の自由度は0、誤差平方和もほぼ0", () => {
    const pairs: Pair[] = [
      [0, 1],
      [0, 2],
      [1, 2],
    ];
    const anova = computeL8InteractionAnova(
      RESULTS_INTERACTION,
      ["A", "B", "C", "D"],
      assignColumns(4, pairs)!,
      pairs,
    )!;
    expect(anova.errorDf).toBe(0);
    expect(anova.errorMs).toBe(0);
    expect(anova.errorSS).toBeCloseTo(0, DIGITS);
  });

  test("結果がすべて同じ値なら平方和は0、寄与率は0", () => {
    const anova = computeL8InteractionAnova(
      Array(8).fill(50),
      FACTORS,
      COLUMNS,
      PAIRS,
    )!;
    expect(anova.totalSS).toBe(0);
    expect(anova.factorEffects.every((f) => f.effect === 0)).toBe(true);
    expect(anova.factorEffects.every((f) => f.contribution === 0)).toBe(true);
    expect(anova.interactionEffects.every((x) => x.contribution === 0)).toBe(
      true,
    );
    expect(anova.errorContribution).toBe(0);
  });
});
