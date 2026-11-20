"use client";

//生成AIコード
import React, { useMemo, useState } from "react";
import { computeL8Anova, L8 } from "../anova";
import {
  ContributionChart,
  MainEffectsChart,
} from "@/app/exp-design/components/L8Charts";

/**
 * L8(2^7) 直交表 — 超シンプル版
 * - 主効果のみ、交互作用は考えない
 * - 列の割り当ては「因子の並び順 = 列(C1..C7)」で自動
 * - 実験結果を入力して分散分析（ANOVA）を実施
 * できるだけ“読むコード”にしてあります。
 */

// 入力する因子 (2水準ラベルだけ)
type Factor = { id: string; name: string; level1: string; level2: string };

const newId = () => Math.random().toString(36).slice(2, 9);

export default function L8Simple() {
  // 初期は1因子だけ用意
  const [factors, setFactors] = useState<Factor[]>([
    { id: newId(), name: "因子A", level1: "低", level2: "高" },
  ]);

  // 各実験ランの結果値（応答値）
  const [results, setResults] = useState<(number | null)[]>(
    Array(8).fill(null),
  );

  // 表示用テーブルを計算
  // 並び順 = 列割当 (0番目の因子がC1, 1番目がC2, ...)
  const table = useMemo(() => {
    // ヘッダ: Run + 因子名
    const header = ["Run", ...factors.map((f) => f.name)];

    // 各行の値を作る
    const rows = L8.map((row, i) => {
      const cells: (string | number)[] = [i + 1]; // Run番号
      // 因子の並び順をそのまま L8 の列に対応させる
      for (let col = 0; col < factors.length; col++) {
        const f = factors[col];
        const level = row[col]; // col列目の水準(1|2)
        cells.push(level === 1 ? f.level1 : f.level2);
      }
      return cells;
    });

    return { header, rows };
  }, [factors]);

  // 分散分析の計算
  const anovaTable = useMemo(
    () =>
      computeL8Anova(
        results,
        factors.map((f) => f.name),
      ),
    [results, factors],
  );

  // グラフ用：水準ラベルを効果に添える
  const chartEffects = (anovaTable?.factorEffects ?? []).map((f, idx) => ({
    ...f,
    level1: factors[idx].level1,
    level2: factors[idx].level2,
  }));

  // 便利関数
  const addFactor = () => {
    if (factors.length >= 7) return; // L8 は最大7因子
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
  const removeFactor = (id: string) =>
    setFactors((prev) => prev.filter((f) => f.id !== id));
  const updateFactor = (id: string, patch: Partial<Factor>) =>
    setFactors((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    );

  return (
    <div className="mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">L8 直交表と分散分析</h1>
      <p className="text-sm text-gray-600">
        二水準・主効果のみ。因子の並び順が C1→C2→… に自動対応します。
        実験結果を入力すると分散分析（ANOVA）を実施します。
      </p>

      {/* 因子入力 */}
      <section className="bg-white rounded-2xl shadow p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">因子の定義</h2>
          <button
            onClick={addFactor}
            disabled={factors.length >= 7}
            className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm disabled:opacity-40"
          >
            因子を追加
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {factors.map((f, i) => (
            <div
              key={f.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center border rounded-xl p-3"
            >
              <div className="md:col-span-3 text-xs text-gray-500">
                C{i + 1}
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
        {factors.length >= 7 && (
          <p className="mt-2 text-xs text-gray-500">
            これ以上は追加できません（L8の列は7つまで）。
          </p>
        )}
      </section>

      {/* テーブル */}
      <section className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
        <h2 className="font-semibold">実験計画（L8）</h2>
        <table className="min-w-full text-sm mt-3">
          <thead>
            <tr className="border-b">
              {table.header.map((h) => (
                <th key={h} className="text-left py-2 pr-4 font-semibold">
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
          メモ：因子の並び順を変えると列（C1..C{factors.length}
          )の割当も変わります。
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

          {/* 因子の効果 */}
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-3 font-semibold">要因</th>
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
                {anovaTable.factorEffects.map((factor, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 px-3">{factor.name}</td>
                    <td className="text-right py-2 px-3">
                      {factor.ss.toFixed(3)}
                    </td>
                    <td className="text-right py-2 px-3">{factor.df}</td>
                    <td className="text-right py-2 px-3">
                      {factor.ms.toFixed(3)}
                    </td>
                    <td className="text-right py-2 px-3">
                      {factor.contribution.toFixed(2)}%
                    </td>
                    <td className="text-right py-2 px-3">
                      {factor.effect > 0 ? "+" : ""}
                      {factor.effect.toFixed(3)}
                    </td>
                  </tr>
                ))}
                {anovaTable.errorDf > 0 && (
                  <tr className="border-b">
                    <td className="py-2 px-3">誤差</td>
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
                      {(
                        (anovaTable.errorSS / anovaTable.totalSS) *
                        100
                      ).toFixed(2)}
                      %
                    </td>
                    <td className="text-right py-2 px-3">-</td>
                  </tr>
                )}
                <tr className="font-semibold bg-gray-50">
                  <td className="py-2 px-3">合計</td>
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
              <div className="mt-3">
                <ContributionChart
                  effects={chartEffects}
                  errorContribution={
                    anovaTable.errorDf > 0
                      ? Math.max(
                          0,
                          (anovaTable.errorSS / anovaTable.totalSS) * 100,
                        )
                      : null
                  }
                />
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                結果がすべて同じ値のため、寄与率は計算できません。
              </p>
            )}
          </div>
        </section>
      )}

      <details className="text-sm text-gray-600">
        <summary className="cursor-pointer font-medium">機能説明</summary>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>L8は定数配列。値1/2はそれぞれ水準1/2。</li>
          <li>
            因子の並び順 =
            列番号（C1..C7）。UIで並びを変えれば割当も変わります。
          </li>
          <li>実験結果を全て入力すると分散分析表が自動表示されます。</li>
          <li>平方和(SS)、寄与率、各因子の効果などを確認できます。</li>
          <li>効果：水準2の平均 - 水準1の平均。プラスなら水準2が有利。</li>
          <li>グラフ：要因効果図と寄与率の棒グラフで結果を視覚的に確認できます。</li>
        </ul>
      </details>
    </div>
  );
}
