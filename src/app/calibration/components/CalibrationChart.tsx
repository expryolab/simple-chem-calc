"use client";

import { formatSignificant } from "@/utils/chemistry";
import type { CalibrationResult } from "../hooks";

type Props = {
  result: CalibrationResult;
};

type Axis = {
  min: number;
  max: number;
  ticks: number[];
};

const WIDTH = 560;
const HEIGHT = 380;
const PAD = { top: 16, right: 20, bottom: 52, left: 72 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;

/** 1, 2, 5 × 10^n の「きりのいい」目盛り間隔で軸範囲と目盛りを決める */
const niceAxis = (lo: number, hi: number, targetCount = 5): Axis => {
  if (lo === hi) {
    const delta = lo === 0 ? 1 : Math.abs(lo) * 0.1;
    lo -= delta;
    hi += delta;
  }
  const rawStep = (hi - lo) / targetCount;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const step =
    (normalized < 1.5 ? 1 : normalized < 3 ? 2 : normalized < 7 ? 5 : 10) *
    magnitude;

  const min = Math.floor(lo / step) * step;
  const max = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let i = 0; min + i * step <= max + step * 1e-9; i++) {
    // 浮動小数点の誤差（0.30000000000000004 など）を落とす
    ticks.push(Number((min + i * step).toPrecision(12)));
  }
  return { min, max, ticks };
};

const formatTick = (value: number): string =>
  Math.abs(value) >= 1e5 || (value !== 0 && Math.abs(value) < 1e-3)
    ? value.toExponential(1)
    : String(value);

export const CalibrationChart = ({ result }: Props) => {
  const { fit, standards, samples, xLabel, yLabel } = result;

  // 原点・標準液・試料すべてが収まる範囲
  const allX = [0, ...standards.map((p) => p.x), ...samples.map((s) => s.x)];
  const xAxis = niceAxis(Math.min(...allX), Math.max(...allX));

  const lineY = (x: number): number => fit.slope * x + fit.intercept;
  const allY = [
    0,
    ...standards.map((p) => p.y),
    ...samples.map((s) => s.y),
    lineY(xAxis.min),
    lineY(xAxis.max),
  ];
  const yAxis = niceAxis(Math.min(...allY), Math.max(...allY));

  // データ値 → SVG 座標
  const sx = (x: number): number =>
    PAD.left + ((x - xAxis.min) / (xAxis.max - xAxis.min)) * PLOT_W;
  const sy = (y: number): number =>
    PAD.top + PLOT_H - ((y - yAxis.min) / (yAxis.max - yAxis.min)) * PLOT_H;

  const bottom = PAD.top + PLOT_H;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="w-full h-auto max-w-2xl bg-white rounded-lg border border-gray-200"
      role="img"
      aria-label={`検量線グラフ: y = ${formatSignificant(fit.slope)}x + ${formatSignificant(fit.intercept)}`}
    >
      {/* プロット領域外にはみ出す線を切る */}
      <defs>
        <clipPath id="plot-area">
          <rect x={PAD.left} y={PAD.top} width={PLOT_W} height={PLOT_H} />
        </clipPath>
      </defs>

      {/* グリッドと目盛り */}
      {xAxis.ticks.map((t) => (
        <g key={`x-${t}`}>
          <line
            x1={sx(t)}
            y1={PAD.top}
            x2={sx(t)}
            y2={bottom}
            className="stroke-gray-100"
          />
          <text
            x={sx(t)}
            y={bottom + 18}
            textAnchor="middle"
            className="fill-gray-600 text-[12px]"
          >
            {formatTick(t)}
          </text>
        </g>
      ))}
      {yAxis.ticks.map((t) => (
        <g key={`y-${t}`}>
          <line
            x1={PAD.left}
            y1={sy(t)}
            x2={PAD.left + PLOT_W}
            y2={sy(t)}
            className="stroke-gray-100"
          />
          <text
            x={PAD.left - 8}
            y={sy(t)}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-gray-600 text-[12px]"
          >
            {formatTick(t)}
          </text>
        </g>
      ))}

      {/* 軸 */}
      <line
        x1={PAD.left}
        y1={bottom}
        x2={PAD.left + PLOT_W}
        y2={bottom}
        className="stroke-gray-500"
      />
      <line
        x1={PAD.left}
        y1={PAD.top}
        x2={PAD.left}
        y2={bottom}
        className="stroke-gray-500"
      />

      {/* 軸タイトル */}
      <text
        x={PAD.left + PLOT_W / 2}
        y={HEIGHT - 10}
        textAnchor="middle"
        className="fill-gray-800 text-[13px]"
      >
        {xLabel}
      </text>
      <text
        transform={`translate(16 ${PAD.top + PLOT_H / 2}) rotate(-90)`}
        textAnchor="middle"
        className="fill-gray-800 text-[13px]"
      >
        {yLabel}
      </text>

      <g clipPath="url(#plot-area)">
        {/* 回帰直線：軸範囲の両端を結ぶ */}
        <line
          x1={sx(xAxis.min)}
          y1={sy(lineY(xAxis.min))}
          x2={sx(xAxis.max)}
          y2={sy(lineY(xAxis.max))}
          className="stroke-indigo-500"
          strokeWidth={2}
        />

        {/* 試料：応答値から直線に当て、濃度軸へ下ろす破線 */}
        {samples.map((s, i) => (
          <g key={`s-${i}`}>
            <polyline
              points={`${PAD.left},${sy(s.y)} ${sx(s.x)},${sy(s.y)} ${sx(s.x)},${bottom}`}
              fill="none"
              className="stroke-amber-500"
              strokeDasharray="4 3"
            />
            <rect
              x={sx(s.x) - 5}
              y={sy(s.y) - 5}
              width={10}
              height={10}
              transform={`rotate(45 ${sx(s.x)} ${sy(s.y)})`}
              className="fill-amber-500 stroke-white"
            >
              <title>
                {`${s.name}: ${yLabel} ${formatSignificant(s.y)} → ${xLabel} ${formatSignificant(s.x)}`}
              </title>
            </rect>
          </g>
        ))}

        {/* 標準液 */}
        {standards.map((p, i) => (
          <circle
            key={`p-${i}`}
            cx={sx(p.x)}
            cy={sy(p.y)}
            r={5}
            className="fill-gray-800 stroke-white"
            strokeWidth={1.5}
          >
            <title>{`標準液${i + 1}: (${formatSignificant(p.x)}, ${formatSignificant(p.y)})`}</title>
          </circle>
        ))}
      </g>
    </svg>
  );
};
