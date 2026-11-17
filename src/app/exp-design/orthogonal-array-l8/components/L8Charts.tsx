"use client";

import { formatTick, niceAxis } from "@/utils/chartAxis";

export type FactorEffect = {
  name: string;
  level1: string;
  level2: string;
  mean1: number;
  mean2: number;
  contribution: number;
};

/** 長いラベルが隣の因子と重ならないよう切り詰める */
const truncate = (text: string, max: number): string =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text;

// ---------------------------------------------------------------------------
// 要因効果図：因子ごとに水準1→水準2の平均を結ぶ。縦軸は全因子共通。
// ---------------------------------------------------------------------------

const ME_SLOT = 120;
const ME_HEIGHT = 300;
const ME_PAD = { top: 16, right: 16, bottom: 56, left: 64 };

type MainEffectsProps = {
  effects: FactorEffect[];
  grandMean: number;
};

export const MainEffectsChart = ({ effects, grandMean }: MainEffectsProps) => {
  const width = ME_PAD.left + effects.length * ME_SLOT + ME_PAD.right;
  const plotH = ME_HEIGHT - ME_PAD.top - ME_PAD.bottom;
  const bottom = ME_PAD.top + plotH;
  const right = width - ME_PAD.right;

  const values = [grandMean, ...effects.flatMap((e) => [e.mean1, e.mean2])];
  const yAxis = niceAxis(Math.min(...values), Math.max(...values));
  const sy = (y: number): number =>
    ME_PAD.top + plotH - ((y - yAxis.min) / (yAxis.max - yAxis.min)) * plotH;

  const slotX = (i: number): number => ME_PAD.left + i * ME_SLOT;

  return (
    <svg
      viewBox={`0 0 ${width} ${ME_HEIGHT}`}
      style={{ maxWidth: width, minWidth: width * 0.75 }}
      className="w-full h-auto bg-white rounded-lg border border-gray-200"
      role="img"
      aria-label="要因効果図"
    >
      {/* 横グリッドと縦軸目盛り */}
      {yAxis.ticks.map((t) => (
        <g key={`y-${t}`}>
          <line
            x1={ME_PAD.left}
            y1={sy(t)}
            x2={right}
            y2={sy(t)}
            className="stroke-gray-100"
          />
          <text
            x={ME_PAD.left - 8}
            y={sy(t)}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-gray-600 text-[12px]"
          >
            {formatTick(t)}
          </text>
        </g>
      ))}

      {/* 因子の区切り線 */}
      {effects.slice(1).map((_, i) => (
        <line
          key={`sep-${i}`}
          x1={slotX(i + 1)}
          y1={ME_PAD.top}
          x2={slotX(i + 1)}
          y2={bottom}
          className="stroke-gray-200"
        />
      ))}

      {/* 軸 */}
      <line
        x1={ME_PAD.left}
        y1={bottom}
        x2={right}
        y2={bottom}
        className="stroke-gray-500"
      />
      <line
        x1={ME_PAD.left}
        y1={ME_PAD.top}
        x2={ME_PAD.left}
        y2={bottom}
        className="stroke-gray-500"
      />
      <text
        transform={`translate(16 ${ME_PAD.top + plotH / 2}) rotate(-90)`}
        textAnchor="middle"
        className="fill-gray-800 text-[13px]"
      >
        平均値
      </text>

      {/* 全体平均 */}
      <line
        x1={ME_PAD.left}
        y1={sy(grandMean)}
        x2={right}
        y2={sy(grandMean)}
        className="stroke-gray-400"
        strokeDasharray="4 3"
      >
        <title>{`全体平均: ${grandMean.toFixed(3)}`}</title>
      </line>

      {effects.map((e, i) => {
        const x1 = slotX(i) + ME_SLOT * 0.25;
        const x2 = slotX(i) + ME_SLOT * 0.75;
        const points = [
          { x: x1, y: e.mean1, label: e.level1 },
          { x: x2, y: e.mean2, label: e.level2 },
        ];
        return (
          <g key={`f-${i}`}>
            <line
              x1={x1}
              y1={sy(e.mean1)}
              x2={x2}
              y2={sy(e.mean2)}
              className="stroke-indigo-500"
              strokeWidth={2}
            />
            {points.map((p, j) => (
              <g key={j}>
                <circle
                  cx={p.x}
                  cy={sy(p.y)}
                  r={5}
                  className="fill-indigo-600 stroke-white"
                  strokeWidth={1.5}
                >
                  <title>{`${e.name} 水準${j + 1} (${p.label}): ${p.y.toFixed(3)}`}</title>
                </circle>
                <text
                  x={p.x}
                  y={bottom + 18}
                  textAnchor="middle"
                  className="fill-gray-600 text-[12px]"
                >
                  {truncate(p.label, 5)}
                </text>
              </g>
            ))}
            <text
              x={slotX(i) + ME_SLOT / 2}
              y={bottom + 40}
              textAnchor="middle"
              className="fill-gray-800 text-[13px] font-medium"
            >
              {truncate(e.name, 8)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// 寄与率の横棒グラフ：大きい順に並べる。誤差は灰色。
// ---------------------------------------------------------------------------

const BAR_WIDTH = 480;
const BAR_ROW = 32;
const BAR_PAD = { top: 8, right: 56, bottom: 28, left: 96 };

type ContributionProps = {
  effects: FactorEffect[];
  /** 誤差の自由度がない場合は null */
  errorContribution: number | null;
};

export const ContributionChart = ({
  effects,
  errorContribution,
}: ContributionProps) => {
  const rows = [
    ...effects.map((e) => ({
      name: e.name,
      value: e.contribution,
      isError: false,
    })),
    ...(errorContribution === null
      ? []
      : [{ name: "誤差", value: errorContribution, isError: true }]),
  ].sort((a, b) => b.value - a.value);

  const height = BAR_PAD.top + rows.length * BAR_ROW + BAR_PAD.bottom;
  const plotW = BAR_WIDTH - BAR_PAD.left - BAR_PAD.right;
  const bottom = height - BAR_PAD.bottom;

  const xAxis = niceAxis(0, Math.max(...rows.map((r) => r.value), 1), 4);
  const sx = (v: number): number =>
    BAR_PAD.left + (v / xAxis.max) * plotW;

  return (
    <svg
      viewBox={`0 0 ${BAR_WIDTH} ${height}`}
      style={{ maxWidth: BAR_WIDTH }}
      className="w-full h-auto bg-white rounded-lg border border-gray-200"
      role="img"
      aria-label="寄与率グラフ"
    >
      {/* 縦グリッドと目盛り */}
      {xAxis.ticks.map((t) => (
        <g key={`x-${t}`}>
          <line
            x1={sx(t)}
            y1={BAR_PAD.top}
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
            {`${formatTick(t)}%`}
          </text>
        </g>
      ))}

      {rows.map((r, i) => {
        const y = BAR_PAD.top + i * BAR_ROW;
        return (
          <g key={`${r.name}-${i}`}>
            <text
              x={BAR_PAD.left - 8}
              y={y + BAR_ROW / 2}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-gray-800 text-[13px]"
            >
              {truncate(r.name, 7)}
            </text>
            <rect
              x={BAR_PAD.left}
              y={y + 6}
              width={Math.max(0, sx(r.value) - BAR_PAD.left)}
              height={BAR_ROW - 12}
              rx={3}
              className={r.isError ? "fill-gray-300" : "fill-indigo-500"}
            >
              <title>{`${r.name}: ${r.value.toFixed(2)}%`}</title>
            </rect>
            <text
              x={sx(r.value) + 6}
              y={y + BAR_ROW / 2}
              dominantBaseline="middle"
              className="fill-gray-700 text-[12px]"
            >
              {`${r.value.toFixed(1)}%`}
            </text>
          </g>
        );
      })}

      <line
        x1={BAR_PAD.left}
        y1={BAR_PAD.top}
        x2={BAR_PAD.left}
        y2={bottom}
        className="stroke-gray-500"
      />
    </svg>
  );
};
