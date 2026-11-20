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
// 寄与率の横棒グラフ：大きい順に並べる。交互作用は琥珀色、誤差は灰色。
// ---------------------------------------------------------------------------

const BAR_WIDTH = 480;
const BAR_ROW = 32;
const BAR_PAD = { top: 8, right: 56, bottom: 28, left: 96 };

type ContributionProps = {
  effects: FactorEffect[];
  /** 交互作用（L8交互作用ありページ用）。因子とは色を変えて描く */
  interactions?: { name: string; contribution: number }[];
  /** 誤差の自由度がない場合は null */
  errorContribution: number | null;
};

type BarKind = "factor" | "interaction" | "error";

const BAR_FILL: Record<BarKind, string> = {
  factor: "fill-indigo-500",
  interaction: "fill-amber-500",
  error: "fill-gray-300",
};

export const ContributionChart = ({
  effects,
  interactions = [],
  errorContribution,
}: ContributionProps) => {
  const rows: { name: string; value: number; kind: BarKind }[] = [
    ...effects.map((e) => ({
      name: e.name,
      value: e.contribution,
      kind: "factor" as const,
    })),
    ...interactions.map((x) => ({
      name: x.name,
      value: x.contribution,
      kind: "interaction" as const,
    })),
    ...(errorContribution === null
      ? []
      : [{ name: "誤差", value: errorContribution, kind: "error" as const }]),
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
              className={BAR_FILL[r.kind]}
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

// ---------------------------------------------------------------------------
// 交互作用図：横軸に因子Aの水準、因子Bの水準ごとに線を引く。
// 線が平行なら交互作用は小さく、交差・開きが大きいほど交互作用が大きい。
// ---------------------------------------------------------------------------

const IX_WIDTH = 360;
const IX_HEIGHT = 280;
const IX_PAD = { top: 40, right: 24, bottom: 52, left: 64 };

/** 因子Bの水準1・水準2の線のスタイル（色だけに頼らないよう線種と点の形も変える） */
const IX_SERIES = [
  { stroke: "stroke-indigo-500", fill: "fill-indigo-600", dash: undefined },
  { stroke: "stroke-amber-500", fill: "fill-amber-600", dash: "6 4" },
] as const;

type InteractionFactor = { name: string; level1: string; level2: string };

type InteractionProps = {
  /** 横軸の因子 */
  factorA: InteractionFactor;
  /** 線で分ける因子 */
  factorB: InteractionFactor;
  /** cellMeans[Aの水準-1][Bの水準-1] */
  cellMeans: readonly (readonly number[])[];
  /** 縦軸の範囲。複数の図で揃えるときに渡す（省略時はこの図の値から決める） */
  yDomain?: readonly [number, number];
};

export const InteractionChart = ({
  factorA,
  factorB,
  cellMeans,
  yDomain,
}: InteractionProps) => {
  const plotW = IX_WIDTH - IX_PAD.left - IX_PAD.right;
  const plotH = IX_HEIGHT - IX_PAD.top - IX_PAD.bottom;
  const bottom = IX_PAD.top + plotH;
  const right = IX_WIDTH - IX_PAD.right;

  const values = cellMeans.flat();
  const [lo, hi] = yDomain ?? [Math.min(...values), Math.max(...values)];
  const yAxis = niceAxis(lo, hi);
  const sy = (y: number): number =>
    IX_PAD.top + plotH - ((y - yAxis.min) / (yAxis.max - yAxis.min)) * plotH;

  const xs = [IX_PAD.left + plotW * 0.2, IX_PAD.left + plotW * 0.8];
  const aLabels = [factorA.level1, factorA.level2];
  const bLabels = [factorB.level1, factorB.level2];
  const name = `${factorA.name}×${factorB.name}`;

  return (
    <svg
      viewBox={`0 0 ${IX_WIDTH} ${IX_HEIGHT}`}
      style={{ maxWidth: IX_WIDTH, minWidth: IX_WIDTH * 0.75 }}
      className="w-full h-auto bg-white rounded-lg border border-gray-200"
      role="img"
      aria-label={`交互作用図 ${name}`}
    >
      {/* 凡例：因子Bの水準 */}
      <text x={IX_PAD.left} y={16} className="fill-gray-800 text-[12px]">
        {truncate(factorB.name, 6)}:
      </text>
      {bLabels.map((label, lb) => {
        const x = IX_PAD.left + 88 + lb * 104;
        const s = IX_SERIES[lb];
        return (
          <g key={`legend-${lb}`}>
            <line
              x1={x}
              y1={12}
              x2={x + 24}
              y2={12}
              className={s.stroke}
              strokeWidth={2}
              strokeDasharray={s.dash}
            />
            <IxMarker kind={lb} x={x + 12} y={12} className={s.fill} />
            <text x={x + 30} y={16} className="fill-gray-600 text-[12px]">
              {truncate(label, 5)}
            </text>
          </g>
        );
      })}

      {/* 横グリッドと縦軸目盛り */}
      {yAxis.ticks.map((t) => (
        <g key={`y-${t}`}>
          <line
            x1={IX_PAD.left}
            y1={sy(t)}
            x2={right}
            y2={sy(t)}
            className="stroke-gray-100"
          />
          <text
            x={IX_PAD.left - 8}
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
        x1={IX_PAD.left}
        y1={bottom}
        x2={right}
        y2={bottom}
        className="stroke-gray-500"
      />
      <line
        x1={IX_PAD.left}
        y1={IX_PAD.top}
        x2={IX_PAD.left}
        y2={bottom}
        className="stroke-gray-500"
      />
      <text
        transform={`translate(16 ${IX_PAD.top + plotH / 2}) rotate(-90)`}
        textAnchor="middle"
        className="fill-gray-800 text-[13px]"
      >
        平均値
      </text>

      {/* 横軸：因子Aの水準 */}
      {aLabels.map((label, la) => (
        <text
          key={`a-${la}`}
          x={xs[la]}
          y={bottom + 18}
          textAnchor="middle"
          className="fill-gray-600 text-[12px]"
        >
          {truncate(label, 8)}
        </text>
      ))}
      <text
        x={IX_PAD.left + plotW / 2}
        y={bottom + 40}
        textAnchor="middle"
        className="fill-gray-800 text-[13px] font-medium"
      >
        {truncate(factorA.name, 12)}
      </text>

      {/* 因子Bの水準ごとの線 */}
      {bLabels.map((bLabel, lb) => {
        const s = IX_SERIES[lb];
        return (
          <g key={`b-${lb}`}>
            <line
              x1={xs[0]}
              y1={sy(cellMeans[0][lb])}
              x2={xs[1]}
              y2={sy(cellMeans[1][lb])}
              className={s.stroke}
              strokeWidth={2}
              strokeDasharray={s.dash}
            />
            {[0, 1].map((la) => (
              <IxMarker
                key={la}
                kind={lb}
                x={xs[la]}
                y={sy(cellMeans[la][lb])}
                className={s.fill}
                title={`${factorA.name}=${aLabels[la]}, ${factorB.name}=${bLabel}: ${cellMeans[la][lb].toFixed(3)}`}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
};

/** 水準1は丸、水準2は四角 */
const IxMarker = ({
  kind,
  x,
  y,
  className,
  title,
}: {
  kind: number;
  x: number;
  y: number;
  className: string;
  title?: string;
}) => {
  const tooltip = title ? <title>{title}</title> : null;
  return kind === 0 ? (
    <circle
      cx={x}
      cy={y}
      r={5}
      className={`${className} stroke-white`}
      strokeWidth={1.5}
    >
      {tooltip}
    </circle>
  ) : (
    <rect
      x={x - 5}
      y={y - 5}
      width={10}
      height={10}
      className={`${className} stroke-white`}
      strokeWidth={1.5}
    >
      {tooltip}
    </rect>
  );
};
