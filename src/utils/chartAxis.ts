export type Axis = {
  min: number;
  max: number;
  ticks: number[];
};

/** 1, 2, 5 × 10^n の「きりのいい」目盛り間隔で軸範囲と目盛りを決める */
export const niceAxis = (lo: number, hi: number, targetCount = 5): Axis => {
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

export const formatTick = (value: number): string =>
  Math.abs(value) >= 1e5 || (value !== 0 && Math.abs(value) < 1e-3)
    ? value.toExponential(1)
    : String(value);
