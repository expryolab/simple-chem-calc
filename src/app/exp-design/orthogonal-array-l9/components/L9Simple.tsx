"use client";

import React, { useMemo, useState } from "react";

// L9(3^4) 直交表 — 9ラン × 4列。値は水準(1/2/3)
const L9: readonly (1 | 2 | 3)[][] = [
  [1, 1, 1, 1],
  [1, 2, 2, 2],
  [1, 3, 3, 3],
  [2, 1, 2, 3],
  [2, 2, 3, 1],
  [2, 3, 1, 2],
  [3, 1, 3, 2],
  [3, 2, 1, 3],
  [3, 3, 2, 1],
] as const;

type Factor = {
  id: string;
  name: string;
  level1: string;
  level2: string;
  level3: string;
};

const newId = () => Math.random().toString(36).slice(2, 9);

export default function L9Simple() {
  const [factors, setFactors] = useState<Factor[]>([
    { id: newId(), name: "因子A", level1: "水準1", level2: "水準2", level3: "水準3" },
  ]);

  const [results, setResults] = useState<(number | null)[]>(Array(9).fill(null));

  const table = useMemo(() => {
    const header = ["Run", ...factors.map((f) => f.name)];
    const rows = L9.map((row, i) => {
      const cells: (string | number)[] = [i + 1];
      for (let col = 0; col < factors.length; col++) {
        const f = factors[col];
        const level = row[col];
        cells.push(level === 1 ? f.level1 : level === 2 ? f.level2 : f.level3);
      }
      return cells;
    });
    return { header, rows };
  }, [factors]);

  const anovaTable = useMemo(() => {
    const validResults = results.filter((r) => r !== null) as number[];
    if (validResults.length !== 9 || factors.length === 0) return null;

    const grandMean = validResults.reduce((a, b) => a + b, 0) / 9;
    const totalSS = validResults.reduce(
      (sum, val) => sum + Math.pow(val - grandMean, 2),
      0,
    );

    const factorEffects = factors.map((factor, colIdx) => {
      const byLevel: Record<1 | 2 | 3, number[]> = { 1: [], 2: [], 3: [] };
      L9.forEach((row, runIdx) => {
        byLevel[row[colIdx]].push(validResults[runIdx]);
      });

      const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
      const mean1 = mean(byLevel[1]);
      const mean2 = mean(byLevel[2]);
      const mean3 = mean(byLevel[3]);

      const ss =
        byLevel[1].length * Math.pow(mean1 - grandMean, 2) +
        byLevel[2].length * Math.pow(mean2 - grandMean, 2) +
        byLevel[3].length * Math.pow(mean3 - grandMean, 2);

      const df = 2; // 3水準 - 1
      const ms = ss / df;

      return { name: factor.name, ss, df, ms, mean1, mean2, mean3 };
    });

    const factorSS = factorEffects.reduce((sum, f) => sum + f.ss, 0);
    const errorSS = totalSS - factorSS;
    const errorDf = 8 - 2 * factors.length; // 全体df=8, 各因子df=2
    const errorMs = errorDf > 0 ? errorSS / errorDf : 0;

    const contributions = factorEffects.map((f) => ({
      ...f,
      contribution: (f.ss / totalSS) * 100,
    }));

    return { factorEffects: contributions, totalSS, errorSS, errorDf, errorMs, grandMean };
  }, [results, factors]);

  const addFactor = () => {
    if (factors.length >= 4) return;
    const idx = factors.length;
    setFactors((prev) => [
      ...prev,
      {
        id: newId(),
        name: `因子${String.fromCharCode(65 + idx)}`,
        level1: "水準1",
        level2: "水準2",
        level3: "水準3",
      },
    ]);
  };
  const removeFactor = (id: string) =>
    setFactors((prev) => prev.filter((f) => f.id !== id));
  const updateFactor = (id: string, patch: Partial<Factor>) =>
    setFactors((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  return (
    <div className="mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">L9 直交表と分散分析</h1>
      <p className="text-sm text-gray-600">
        三水準・主効果のみ。因子の並び順が C1→C2→… に自動対応します。
        実験結果を入力すると分散分析（ANOVA）を実施します。
      </p>

      {/* 因子入力 */}
      <section className="bg-white rounded-2xl shadow p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">因子の定義</h2>
          <button
            onClick={addFactor}
            disabled={factors.length >= 4}
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
              <div className="md:col-span-1 text-xs text-gray-500">C{i + 1}</div>
              <input
                className="md:col-span-3 border rounded-lg px-2 py-2 text-sm"
                value={f.name}
                onChange={(e) => updateFactor(f.id, { name: e.target.value })}
                placeholder="因子名 (例: 温度)"
              />
              <input
                className="md:col-span-2 border rounded-lg px-2 py-2 text-sm"
                value={f.level1}
                onChange={(e) => updateFactor(f.id, { level1: e.target.value })}
                placeholder="水準1"
              />
              <input
                className="md:col-span-2 border rounded-lg px-2 py-2 text-sm"
                value={f.level2}
                onChange={(e) => updateFactor(f.id, { level2: e.target.value })}
                placeholder="水準2"
              />
              <input
                className="md:col-span-2 border rounded-lg px-2 py-2 text-sm"
                value={f.level3}
                onChange={(e) => updateFactor(f.id, { level3: e.target.value })}
                placeholder="水準3"
              />
              <div className="md:col-span-2 flex justify-end">
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
        {factors.length >= 4 && (
          <p className="mt-2 text-xs text-gray-500">
            これ以上は追加できません（L9の列は4つまで）。
          </p>
        )}
      </section>

      {/* テーブル */}
      <section className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
        <h2 className="font-semibold">実験計画（L9）</h2>
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
          メモ：因子の並び順を変えると列（C1..C{factors.length}）の割当も変わります。
        </p>
      </section>

      {/* 結果入力 */}
      <section className="bg-white rounded-2xl shadow p-4">
        <h2 className="font-semibold">実験結果の入力</h2>
        <p className="text-xs text-gray-500 mt-1">
          各実験ランの結果（応答値）を入力してください。
        </p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {results.map((result, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <label className="text-sm font-medium w-16 shrink-0">
                Run {idx + 1}:
              </label>
              <input
                type="number"
                step="any"
                className="border rounded-lg px-3 py-2 text-sm flex-1"
                value={result ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setResults((prev) => {
                    const next = [...prev];
                    next[idx] = val === "" ? null : parseFloat(val);
                    return next;
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
                  <th className="text-right py-2 px-3 font-semibold">平方和(SS)</th>
                  <th className="text-right py-2 px-3 font-semibold">自由度(df)</th>
                  <th className="text-right py-2 px-3 font-semibold">平均平方(MS)</th>
                  <th className="text-right py-2 px-3 font-semibold">寄与率(%)</th>
                </tr>
              </thead>
              <tbody>
                {anovaTable.factorEffects.map((factor, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 px-3">{factor.name}</td>
                    <td className="text-right py-2 px-3">{factor.ss.toFixed(3)}</td>
                    <td className="text-right py-2 px-3">{factor.df}</td>
                    <td className="text-right py-2 px-3">{factor.ms.toFixed(3)}</td>
                    <td className="text-right py-2 px-3">
                      {factor.contribution.toFixed(2)}%
                    </td>
                  </tr>
                ))}
                {anovaTable.errorDf > 0 && (
                  <tr className="border-b">
                    <td className="py-2 px-3">誤差</td>
                    <td className="text-right py-2 px-3">
                      {anovaTable.errorSS.toFixed(3)}
                    </td>
                    <td className="text-right py-2 px-3">{anovaTable.errorDf}</td>
                    <td className="text-right py-2 px-3">
                      {anovaTable.errorMs.toFixed(3)}
                    </td>
                    <td className="text-right py-2 px-3">
                      {((anovaTable.errorSS / anovaTable.totalSS) * 100).toFixed(2)}%
                    </td>
                  </tr>
                )}
                <tr className="font-semibold bg-gray-50">
                  <td className="py-2 px-3">合計</td>
                  <td className="text-right py-2 px-3">
                    {anovaTable.totalSS.toFixed(3)}
                  </td>
                  <td className="text-right py-2 px-3">8</td>
                  <td className="text-right py-2 px-3">-</td>
                  <td className="text-right py-2 px-3">100.00%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 水準別平均 */}
          <div className="mt-6">
            <h3 className="font-semibold text-sm mb-3">各因子の水準別平均</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {anovaTable.factorEffects.map((factor, idx) => (
                <div key={idx} className="border rounded-lg p-3">
                  <div className="font-medium text-sm mb-2">{factor.name}</div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        水準1 ({factors[idx].level1}):
                      </span>
                      <span className="font-medium">{factor.mean1.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        水準2 ({factors[idx].level2}):
                      </span>
                      <span className="font-medium">{factor.mean2.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        水準3 ({factors[idx].level3}):
                      </span>
                      <span className="font-medium">{factor.mean3.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <details className="text-sm text-gray-600">
        <summary className="cursor-pointer font-medium">機能説明</summary>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>L9は定数配列。値1/2/3はそれぞれ水準1/2/3。</li>
          <li>
            因子の並び順 = 列番号（C1..C4）。UIで並びを変えれば割当も変わります。
          </li>
          <li>実験結果を全て入力すると分散分析表が自動表示されます。</li>
          <li>平方和(SS)、寄与率を確認できます。</li>
          <li>各因子の自由度は2（3水準 - 1）。</li>
        </ul>
      </details>
    </div>
  );
}
