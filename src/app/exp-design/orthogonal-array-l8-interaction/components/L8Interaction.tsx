"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  ContributionChart,
  InteractionChart,
  MainEffectsChart,
} from "@/app/exp-design/components/L8Charts";
import { L8 } from "../../orthogonal-array-l8/anova";
import {
  assignColumns,
  COLUMN_COUNT,
  computeL8InteractionAnova,
  interactionColumn,
  type Pair,
} from "../anova";

/**
 * L8(2^7) 直交表 — 交互作用あり版
 * - 因子と「調べたい交互作用」を選ぶと、交絡しないように列を自動で割り当てる
 * - 実験結果を入力して分散分析（ANOVA）を実施
 * - 交互作用は 2×2 の組み合わせ平均でも確認できる
 */

// 入力する因子 (2水準ラベルだけ)
type Factor = { id: string; name: string; level1: string; level2: string };

// 交互作用は因子IDのペアで保持（因子の削除・並び替えに追従させるため）
type Interaction = { a: string; b: string };

// 分散分析表の1行（交互作用は効果を出さないので null）
type EffectRow = {
  name: string;
  col: number;
  ss: number;
  df: number;
  ms: number;
  contribution: number;
  effect: number | null;
};

const newId = () => Math.random().toString(36).slice(2, 9);
const pairKey = (a: string, b: string) => [a, b].sort().join(":");

// 因子IDのペア → インデックスのペア（因子の並び順に揃える）
const toPairs = (factors: Factor[], list: Interaction[]): Pair[] =>
  list
    .map(({ a, b }) => {
      const i = factors.findIndex((f) => f.id === a);
      const j = factors.findIndex((f) => f.id === b);
      return (i < j ? [i, j] : [j, i]) as Pair;
    })
    .sort((p, q) => p[0] - q[0] || p[1] - q[1]);

export default function L8Interaction() {
  // 初期は2因子とその交互作用を用意
  const [factors, setFactors] = useState<Factor[]>([
    { id: "init-a", name: "因子A", level1: "低", level2: "高" },
    { id: "init-b", name: "因子B", level1: "低", level2: "高" },
  ]);
  const [interactions, setInteractions] = useState<Interaction[]>([
    { a: "init-a", b: "init-b" },
  ]);

  // 各実験ランの結果値（応答値）
  const [results, setResults] = useState<(number | null)[]>(
    Array(8).fill(null),
  );

  const pairs = useMemo(
    () => toPairs(factors, interactions),
    [factors, interactions],
  );
  const factorColumns = useMemo(
    () => assignColumns(factors.length, pairs),
    [factors.length, pairs],
  );

  // 選択できる交互作用の候補（全ての因子ペア）と、追加しても割り当て可能か
  const candidates = factors.flatMap((fa, i) =>
    factors.slice(i + 1).map((fb) => {
      const key = pairKey(fa.id, fb.id);
      const selected = interactions.some((x) => pairKey(x.a, x.b) === key);
      const addable =
        selected ||
        assignColumns(
          factors.length,
          toPairs(factors, [...interactions, { a: fa.id, b: fb.id }]),
        ) !== null;
      return { key, a: fa, b: fb, selected, addable };
    }),
  );

  const canAddFactor =
    factors.length < COLUMN_COUNT &&
    assignColumns(factors.length + 1, pairs) !== null;

  // 列ごとの割り当て内容（因子 / 交互作用 / 誤差）
  const columnLayout = useMemo(() => {
    if (!factorColumns) return null;
    const pairName = ([i, j]: Pair) => `${factors[i].name}×${factors[j].name}`;

    return Array.from({ length: COLUMN_COUNT }, (_, idx) => {
      const col = idx + 1;
      const factorIdx = factorColumns.indexOf(col);
      const pair = pairs.find(
        ([i, j]) => interactionColumn(factorColumns[i], factorColumns[j]) === col,
      );

      // 選んでいない交互作用のうち、この列に現れるもの（交絡の注意書き用）
      const aliases: string[] = [];
      for (let i = 0; i < factors.length; i++) {
        for (let j = i + 1; j < factors.length; j++) {
          const isSelected = pairs.some((p) => p[0] === i && p[1] === j);
          if (
            !isSelected &&
            interactionColumn(factorColumns[i], factorColumns[j]) === col
          ) {
            aliases.push(pairName([i, j]));
          }
        }
      }

      if (factorIdx >= 0) {
        return { col, kind: "因子" as const, label: factors[factorIdx].name, aliases };
      }
      if (pair) {
        return { col, kind: "交互作用" as const, label: pairName(pair), aliases };
      }
      return { col, kind: "誤差" as const, label: "（空き列）", aliases };
    });
  }, [factorColumns, pairs, factors]);

  // 表示用テーブル（実験者が設定するのは因子の水準だけなので交互作用列は出さない）
  const table = useMemo(() => {
    const header = ["Run", ...factors.map((f) => f.name)];
    const rows = L8.map((row, i) => {
      const cells: (string | number)[] = [i + 1];
      factors.forEach((f, k) => {
        const level = factorColumns ? row[factorColumns[k] - 1] : null;
        cells.push(level === 1 ? f.level1 : level === 2 ? f.level2 : "-");
      });
      return cells;
    });
    return { header, rows };
  }, [factors, factorColumns]);

  // 分散分析の計算
  const anovaTable = useMemo(() => {
    if (!factorColumns) return null;
    const anova = computeL8InteractionAnova(
      results,
      factors.map((f) => f.name),
      factorColumns,
      pairs,
    );
    if (!anova) return null;

    // 表示用に、交互作用には因子の情報を添え、効果の列は「-」にする
    const interactionEffects = anova.interactionEffects.map((x) => ({
      ...x,
      factorA: factors[x.pair[0]],
      factorB: factors[x.pair[1]],
    }));
    const effects: EffectRow[] = [
      ...anova.factorEffects,
      ...interactionEffects.map((x) => ({ ...x, effect: null })),
    ];
    return { ...anova, interactionEffects, effects };
  }, [results, factors, factorColumns, pairs]);

  // グラフ用：因子の水準ラベルを添える
  const chartEffects = (anovaTable?.factorEffects ?? []).map((f, idx) => ({
    ...f,
    level1: factors[idx].level1,
    level2: factors[idx].level2,
  }));

  // 交互作用図の縦軸は全図で共通にして、線の開き具合を比べられるようにする
  const allCellMeans = (anovaTable?.interactionEffects ?? []).flatMap((x) =>
    x.cellMeans.flat(),
  );
  const interactionYDomain: [number, number] = [
    Math.min(...allCellMeans),
    Math.max(...allCellMeans),
  ];

  // 便利関数
  const addFactor = () => {
    if (!canAddFactor) return;
    const idx = factors.length;
    setFactors((prev) => [
      ...prev,
      {
        id: newId(),
        name: `因子${String.fromCharCode(65 + idx)}`,
        level1: "低",
        level2: "高",
      },
    ]);
  };
  const removeFactor = (id: string) => {
    setFactors((prev) => prev.filter((f) => f.id !== id));
    setInteractions((prev) => prev.filter((x) => x.a !== id && x.b !== id));
  };
  const updateFactor = (id: string, patch: Partial<Factor>) =>
    setFactors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    );
  const toggleInteraction = (a: string, b: string) => {
    const key = pairKey(a, b);
    setInteractions((prev) =>
      prev.some((x) => pairKey(x.a, x.b) === key)
        ? prev.filter((x) => pairKey(x.a, x.b) !== key)
        : [...prev, { a, b }],
    );
  };

  const usedColumns = factors.length + interactions.length;

  return (
    <div className="mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">L8 直交表と分散分析（交互作用あり）</h1>
      <p className="text-sm text-gray-600">
        二水準。因子と調べたい交互作用を選ぶと、交絡しないように列（C1..C7）を自動で割り当てます。
        実験結果を入力すると分散分析（ANOVA）を実施します。
      </p>

      {/* 因子入力 */}
      <section className="bg-white rounded-2xl shadow p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">因子の定義</h2>
          <Button
            variant="solid"
            textSize="sm"
            onClick={addFactor}
            disabled={!canAddFactor}
          >
            因子を追加
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {factors.map((f, i) => (
            <div
              key={f.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center border rounded-xl p-3"
            >
              <div className="md:col-span-3 text-xs text-gray-500">
                {factorColumns ? `C${factorColumns[i]}` : "-"}
              </div>
              <input
                className="md:col-span-3 border rounded-lg px-3 py-2 text-sm"
                value={f.name}
                onChange={(e) => updateFactor(f.id, { name: e.target.value })}
                placeholder="因子名 (例: 温度)"
              />
              <input
                className="md:col-span-3 border rounded-lg px-3 py-2 text-sm"
                value={f.level1}
                onChange={(e) => updateFactor(f.id, { level1: e.target.value })}
                placeholder="水準1 ラベル (例: 低)"
              />
              <input
                className="md:col-span-3 border rounded-lg px-3 py-2 text-sm"
                value={f.level2}
                onChange={(e) => updateFactor(f.id, { level2: e.target.value })}
                placeholder="水準2 ラベル (例: 高)"
              />
              <div className="md:col-span-12 flex justify-end">
                <button
                  onClick={() => removeFactor(f.id)}
                  className="text-xs text-red-600"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
        {!canAddFactor && (
          <p className="mt-2 text-xs text-gray-500">
            これ以上は追加できません（因子と交互作用で使える列は7つまで）。
          </p>
        )}
      </section>

      {/* 交互作用の選択 */}
      <section className="bg-white rounded-2xl shadow p-4">
        <h2 className="font-semibold">調べたい交互作用</h2>
        <p className="text-xs text-gray-500 mt-1">
          使用列: {usedColumns} / {COLUMN_COUNT}（誤差の自由度:{" "}
          {COLUMN_COUNT - usedColumns}）。割り当てられない組み合わせは選べません。
        </p>
        {candidates.length === 0 ? (
          <p className="mt-3 text-sm text-gray-600">
            交互作用を選ぶには因子を2つ以上登録してください。
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {candidates.map(({ key, a, b, selected, addable }) => (
              <label
                key={key}
                className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm ${
                  addable ? "cursor-pointer" : "opacity-40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  disabled={!addable}
                  onChange={() => toggleInteraction(a.id, b.id)}
                />
                {a.name}×{b.name}
              </label>
            ))}
          </div>
        )}
        {usedColumns === COLUMN_COUNT && (
          <p className="mt-3 text-xs text-amber-700">
            空き列がないため誤差の自由度が0になります。分散分析の誤差は求められません。
          </p>
        )}
      </section>

      {/* 列の割り当て */}
      {columnLayout && (
        <section className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
          <h2 className="font-semibold">列の割り当て</h2>
          <table className="min-w-full text-sm mt-3">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-semibold">列</th>
                <th className="text-left py-2 pr-4 font-semibold">種類</th>
                <th className="text-left py-2 pr-4 font-semibold">内容</th>
              </tr>
            </thead>
            <tbody>
              {columnLayout.map(({ col, kind, label, aliases }) => (
                <tr key={col} className="border-b last:border-0">
                  <td className="py-2 pr-4">C{col}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">{kind}</td>
                  <td className="py-2 pr-4">
                    {label}
                    {aliases.length > 0 && (
                      <span className="block text-xs text-gray-500">
                        ※ {aliases.join("、")} もこの列に現れます（無視できると仮定）
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* テーブル */}
      <section className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
        <h2 className="font-semibold">実験計画（L8）</h2>
        <table className="min-w-full text-sm mt-3">
          <thead>
            <tr className="border-b">
              {table.header.map((h, i) => (
                <th key={i} className="text-left py-2 pr-4 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, idx) => (
              <tr key={idx} className="border-b last:border-0">
                {row.map((cell, i) => (
                  <td key={i} className="py-2 pr-4 whitespace-nowrap">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-500 mt-3">
          メモ：交互作用の列は実験で設定する必要はありません（因子の水準の組み合わせで決まります）。
        </p>
      </section>

      {/* 結果入力 */}
      <section className="bg-white rounded-2xl shadow p-4">
        <h2 className="font-semibold">実験結果の入力</h2>
        <p className="text-xs text-gray-500 mt-1">
          各実験ランの結果（応答値）を入力してください。
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          {results.map((result, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <label className="text-sm font-medium w-16 shrink-0">
                Run {idx + 1}:
              </label>
              <input
                type="number"
                step="any"
                className="min-w-0 flex-1 border rounded-lg px-3 py-2 text-sm"
                value={result ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setResults((prev) => {
                    const newResults = [...prev];
                    newResults[idx] = val === "" ? null : parseFloat(val);
                    return newResults;
                  });
                }}
                placeholder="結果値"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 分散分析表 */}
      {anovaTable && (
        <section className="bg-white rounded-2xl shadow p-4">
          <h2 className="font-semibold">分散分析表（ANOVA）</h2>
          <p className="text-xs text-gray-500 mt-1">
            全体平均: {anovaTable.grandMean.toFixed(3)}
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-3 font-semibold">要因</th>
                  <th className="text-left py-2 px-3 font-semibold">列</th>
                  <th className="text-right py-2 px-3 font-semibold">
                    平方和(SS)
                  </th>
                  <th className="text-right py-2 px-3 font-semibold">
                    自由度(df)
                  </th>
                  <th className="text-right py-2 px-3 font-semibold">
                    平均平方(MS)
                  </th>
                  <th className="text-right py-2 px-3 font-semibold">
                    寄与率(%)
                  </th>
                  <th className="text-right py-2 px-3 font-semibold">効果</th>
                </tr>
              </thead>
              <tbody>
                {anovaTable.effects.map((e, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 px-3">{e.name}</td>
                    <td className="py-2 px-3">C{e.col}</td>
                    <td className="text-right py-2 px-3">{e.ss.toFixed(3)}</td>
                    <td className="text-right py-2 px-3">{e.df}</td>
                    <td className="text-right py-2 px-3">{e.ms.toFixed(3)}</td>
                    <td className="text-right py-2 px-3">
                      {e.contribution.toFixed(2)}%
                    </td>
                    <td className="text-right py-2 px-3">
                      {e.effect === null
                        ? "-"
                        : `${e.effect > 0 ? "+" : ""}${e.effect.toFixed(3)}`}
                    </td>
                  </tr>
                ))}
                {anovaTable.errorDf > 0 && (
                  <tr className="border-b">
                    <td className="py-2 px-3">誤差</td>
                    <td className="py-2 px-3">-</td>
                    <td className="text-right py-2 px-3">
                      {anovaTable.errorSS.toFixed(3)}
                    </td>
                    <td className="text-right py-2 px-3">
                      {anovaTable.errorDf}
                    </td>
                    <td className="text-right py-2 px-3">
                      {anovaTable.errorMs.toFixed(3)}
                    </td>
                    <td className="text-right py-2 px-3">
                      {anovaTable.errorContribution.toFixed(2)}%
                    </td>
                    <td className="text-right py-2 px-3">-</td>
                  </tr>
                )}
                <tr className="font-semibold bg-gray-50">
                  <td className="py-2 px-3">合計</td>
                  <td className="py-2 px-3">-</td>
                  <td className="text-right py-2 px-3">
                    {anovaTable.totalSS.toFixed(3)}
                  </td>
                  <td className="text-right py-2 px-3">7</td>
                  <td className="text-right py-2 px-3">-</td>
                  <td className="text-right py-2 px-3">100.00%</td>
                  <td className="text-right py-2 px-3">-</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 水準別平均 */}
          <div className="mt-6">
            <h3 className="font-semibold text-sm mb-3">各因子の水準別平均</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {anovaTable.factorEffects.map((factor, idx) => (
                <div key={idx} className="border rounded-lg p-3">
                  <div className="font-medium text-sm mb-2">{factor.name}</div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        水準1 ({factors[idx].level1}):
                      </span>
                      <span className="font-medium">
                        {factor.mean1.toFixed(3)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        水準2 ({factors[idx].level2}):
                      </span>
                      <span className="font-medium">
                        {factor.mean2.toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 交互作用の組み合わせ平均 */}
          {anovaTable.interactionEffects.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-sm mb-3">
                交互作用の組み合わせ平均（2×2）
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {anovaTable.interactionEffects.map((x, idx) => (
                  <div key={idx} className="border rounded-lg p-3 overflow-x-auto">
                    <div className="font-medium text-sm mb-2">{x.name}</div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-1 pr-2 font-normal text-gray-600">
                            {x.factorA.name} \ {x.factorB.name}
                          </th>
                          <th className="text-right py-1 px-2 font-normal text-gray-600">
                            {x.factorB.level1}
                          </th>
                          <th className="text-right py-1 pl-2 font-normal text-gray-600">
                            {x.factorB.level2}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[x.factorA.level1, x.factorA.level2].map((label, la) => (
                          <tr key={la} className="border-b last:border-0">
                            <td className="py-1 pr-2 text-gray-600">{label}</td>
                            <td className="text-right py-1 px-2 font-medium">
                              {x.cellMeans[la][0].toFixed(3)}
                            </td>
                            <td className="text-right py-1 pl-2 font-medium">
                              {x.cellMeans[la][1].toFixed(3)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* グラフ */}
      {anovaTable && (
        <section className="bg-white rounded-2xl shadow p-4 space-y-6">
          <h2 className="font-semibold">グラフ</h2>
          <div>
            <h3 className="font-semibold text-sm">要因効果図</h3>
            <p className="text-xs text-gray-500 mt-1">
              各因子の水準別平均を結んだ線です。傾きが大きいほど結果への影響が大きい因子です。破線は全体平均。
            </p>
            <div className="mt-3 overflow-x-auto">
              <MainEffectsChart
                effects={chartEffects}
                grandMean={anovaTable.grandMean}
              />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm">寄与率</h3>
            {anovaTable.totalSS > 0 ? (
              <>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm bg-indigo-500 align-middle mr-1" />
                  因子
                  <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-500 align-middle ml-3 mr-1" />
                  交互作用
                  <span className="inline-block w-2.5 h-2.5 rounded-sm bg-gray-300 align-middle ml-3 mr-1" />
                  誤差
                </p>
                <div className="mt-3">
                  <ContributionChart
                    effects={chartEffects}
                    interactions={anovaTable.interactionEffects}
                    errorContribution={
                      anovaTable.errorDf > 0
                        ? Math.max(0, anovaTable.errorContribution)
                        : null
                    }
                  />
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                結果がすべて同じ値のため、寄与率は計算できません。
              </p>
            )}
          </div>
          {anovaTable.interactionEffects.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm">交互作用図</h3>
              <p className="text-xs text-gray-500 mt-1">
                2つの因子の組み合わせ平均です。2本の線が平行なら交互作用は小さく、交差したり開いたりしているほど交互作用が大きいことを示します。縦軸はすべての図で共通です。
              </p>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {anovaTable.interactionEffects.map((x) => (
                  <div key={x.name} className="overflow-x-auto">
                    <InteractionChart
                      factorA={x.factorA}
                      factorB={x.factorB}
                      cellMeans={x.cellMeans}
                      yDomain={interactionYDomain}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <details className="text-sm text-gray-600">
        <summary className="cursor-pointer font-medium">機能説明</summary>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>L8は定数配列。値1/2はそれぞれ水準1/2。</li>
          <li>
            列Ciと列Cjの交互作用は列C(i XOR j)に現れます（例: C1×C2→C3）。
          </li>
          <li>
            因子・選んだ交互作用・誤差の列が重ならないよう、列番号の小さい順に自動で割り当てます。
          </li>
          <li>交互作用の平方和は、その交互作用が現れる列から計算します。</li>
          <li>効果：水準2の平均 - 水準1の平均。交互作用は2×2の組み合わせ平均で確認します。</li>
          <li>交互作用図：線が平行なら交互作用は小さく、交差・開きが大きいほど交互作用が大きいと読みます。</li>
        </ul>
      </details>
    </div>
  );
}
