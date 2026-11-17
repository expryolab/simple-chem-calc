import { describe, expect, test } from "vitest";
import { computeL8Anova, L8 } from "./anova";

/**
 * ダミーデータ：合成反応の収率(%)を上げる条件探し
 * C1 温度(60℃/80℃), C2 反応時間(1h/3h), C3 触媒量(1mol%/2mol%),
 * C4 溶媒(トルエン/THF), C5 攪拌速度(200rpm/500rpm)
 * 期待値は手計算（水準別平均・平方和）で確認済み。
 */
const FACTORS = ["温度", "反応時間", "触媒量", "溶媒", "攪拌速度"];
const RESULTS = [49.7, 48.3, 59.9, 58.1, 65.5, 64.5, 68.9, 65.1];

/** 浮動小数点の誤差を許容して比較する桁数 */
const DIGITS = 6;

describe("L8直交表", () => {
  test("各列は水準1と水準2が4回ずつ現れる", () => {
    for (let col = 0; col < 7; col++) {
      const ones = L8.filter((row) => row[col] === 1).length;
      expect(ones).toBe(4);
    }
  });

  test("任意の2列で水準の組み合わせ(1,1)(1,2)(2,1)(2,2)が2回ずつ現れる（直交性）", () => {
    for (let a = 0; a < 7; a++) {
      for (let b = a + 1; b < 7; b++) {
        const counts = new Map<string, number>();
        for (const row of L8) {
          const key = `${row[a]}${row[b]}`;
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        expect([...counts.values()]).toEqual([2, 2, 2, 2]);
      }
    }
  });
});

describe("computeL8Anova: 収率のダミーデータ", () => {
  const anova = computeL8Anova(RESULTS, FACTORS)!;
  const byName = (name: string) =>
    anova.factorEffects.find((f) => f.name === name)!;

  test("結果が返る", () => {
    expect(anova).not.toBeNull();
    expect(anova.factorEffects.map((f) => f.name)).toEqual(FACTORS);
  });

  test("全体平均と全体平方和", () => {
    expect(anova.grandMean).toBeCloseTo(60, DIGITS);
    expect(anova.totalSS).toBeCloseTo(402.32, DIGITS);
  });

  test.each([
    // [因子, 水準1の平均, 水準2の平均, 効果, 平方和]
    ["温度", 54.0, 66.0, 12.0, 288.0],
    ["反応時間", 57.0, 63.0, 6.0, 72.0],
    ["触媒量", 58.0, 62.0, 4.0, 32.0],
    ["溶媒", 61.0, 59.0, -2.0, 8.0],
    ["攪拌速度", 59.8, 60.2, 0.4, 0.32],
  ] as const)("%s の水準別平均・効果・平方和", (name, m1, m2, effect, ss) => {
    const f = byName(name);
    expect(f.mean1).toBeCloseTo(m1, DIGITS);
    expect(f.mean2).toBeCloseTo(m2, DIGITS);
    expect(f.effect).toBeCloseTo(effect, DIGITS);
    expect(f.ss).toBeCloseTo(ss, DIGITS);
    expect(f.df).toBe(1);
    expect(f.ms).toBeCloseTo(ss, DIGITS);
  });

  test("寄与率は温度 > 反応時間 > 触媒量 > 溶媒 > 攪拌速度", () => {
    const order = [...anova.factorEffects]
      .sort((a, b) => b.contribution - a.contribution)
      .map((f) => f.name);
    expect(order).toEqual(["温度", "反応時間", "触媒量", "溶媒", "攪拌速度"]);
    expect(byName("温度").contribution).toBeCloseTo((288 / 402.32) * 100, DIGITS);
  });

  test("溶媒だけ効果がマイナス（水準2のTHFで収率が下がる）", () => {
    const negatives = anova.factorEffects
      .filter((f) => f.effect < 0)
      .map((f) => f.name);
    expect(negatives).toEqual(["溶媒"]);
  });

  test("誤差：自由度2、平方和 = 全体 - 因子合計", () => {
    expect(anova.errorDf).toBe(2);
    expect(anova.errorSS).toBeCloseTo(2.0, DIGITS);
    expect(anova.errorMs).toBeCloseTo(1.0, DIGITS);
  });

  test("因子と誤差の寄与率を足すと100%", () => {
    const sum =
      anova.factorEffects.reduce((s, f) => s + f.contribution, 0) +
      (anova.errorSS / anova.totalSS) * 100;
    expect(sum).toBeCloseTo(100, DIGITS);
  });
});

describe("computeL8Anova: 入力が不完全・特殊なケース", () => {
  test("結果が1つでも未入力なら null", () => {
    const partial = [...RESULTS.slice(0, 7), null];
    expect(computeL8Anova(partial, FACTORS)).toBeNull();
  });

  test("因子が0個なら null", () => {
    expect(computeL8Anova(RESULTS, [])).toBeNull();
  });

  test("7因子（全列使用）なら誤差の自由度は0、誤差平方和もほぼ0", () => {
    const names = ["A", "B", "C", "D", "E", "F", "G"];
    const anova = computeL8Anova(RESULTS, names)!;
    expect(anova.errorDf).toBe(0);
    expect(anova.errorMs).toBe(0);
    expect(anova.errorSS).toBeCloseTo(0, DIGITS);
  });

  test("結果がすべて同じ値なら平方和は0、寄与率は計算できない(NaN)", () => {
    const anova = computeL8Anova(Array(8).fill(50), FACTORS)!;
    expect(anova.totalSS).toBe(0);
    expect(anova.factorEffects.every((f) => f.effect === 0)).toBe(true);
    expect(anova.factorEffects.every((f) => Number.isNaN(f.contribution))).toBe(
      true,
    );
  });
});
