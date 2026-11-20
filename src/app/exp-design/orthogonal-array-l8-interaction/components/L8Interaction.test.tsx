import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import L8Interaction from "./L8Interaction";

/** anova.test.ts と同じダミーデータ（合成反応の収率%） */
const FACTORS = [
  { name: "温度", level1: "60℃", level2: "80℃" },
  { name: "反応時間", level1: "1h", level2: "3h" },
  { name: "触媒量", level1: "1mol%", level2: "2mol%" },
];
/** パターン1：温度×反応時間に強い交互作用がある */
const RESULTS_INTERACTION = ["59.7", "62.4", "71.1", "75.0", "74.9", "78.9", "67.0", "71.2"];
/** パターン2：交互作用がない */
const RESULTS_NO_INTERACTION = ["62.4", "64.7", "66.8", "70.3", "70.2", "72.6", "75.3", "77.9"];

type User = ReturnType<typeof userEvent.setup>;

const replaceText = async (user: User, input: HTMLElement, text: string) => {
  await user.clear(input);
  await user.type(input, text);
};

/**
 * 因子を3つ定義し（初期表示の2因子 + 追加1つ）、交互作用 温度×触媒量 を追加する。
 * 温度×反応時間 は初期状態で選ばれている。
 */
const setUp = async (user: User) => {
  await user.click(screen.getByRole("button", { name: "因子を追加" }));
  const names = screen.getAllByPlaceholderText("因子名 (例: 温度)");
  const level1s = screen.getAllByPlaceholderText("水準1 ラベル (例: 低)");
  const level2s = screen.getAllByPlaceholderText("水準2 ラベル (例: 高)");
  for (const [i, f] of FACTORS.entries()) {
    await replaceText(user, names[i], f.name);
    await replaceText(user, level1s[i], f.level1);
    await replaceText(user, level2s[i], f.level2);
  }
  await user.click(screen.getByRole("checkbox", { name: "温度×触媒量" }));
};

const enterResults = async (user: User, values: string[]) => {
  const inputs = screen.getAllByPlaceholderText("結果値");
  for (const [i, v] of values.entries()) {
    await user.type(inputs[i], v);
  }
};

const sectionOf = (heading: string): HTMLElement =>
  screen.getByRole("heading", { name: heading }).closest("section")!;

/** 1列目のテキストで行を探す */
const rowIn = (section: HTMLElement, firstCell: string): HTMLElement =>
  within(section)
    .getAllByRole("row")
    .find((r) => r.querySelector("td")?.textContent === firstCell)!;

describe("L8Interaction: 列の割り当て", () => {
  test("3因子 + 温度×反応時間, 温度×触媒量 は C1, C2, C4 と C3, C5 に割り当てられる", async () => {
    const user = userEvent.setup();
    render(<L8Interaction />);
    await setUp(user);

    const layout = sectionOf("列の割り当て");
    expect(rowIn(layout, "C1")).toHaveTextContent("因子温度");
    expect(rowIn(layout, "C2")).toHaveTextContent("因子反応時間");
    expect(rowIn(layout, "C3")).toHaveTextContent("交互作用温度×反応時間");
    expect(rowIn(layout, "C4")).toHaveTextContent("因子触媒量");
    expect(rowIn(layout, "C5")).toHaveTextContent("交互作用温度×触媒量");
    // 選んでいない 反応時間×触媒量 は C6 に現れるので注意書きが出る
    expect(rowIn(layout, "C6")).toHaveTextContent("誤差");
    expect(rowIn(layout, "C6")).toHaveTextContent("反応時間×触媒量 もこの列に現れます");
    expect(rowIn(layout, "C7")).toHaveTextContent("誤差");

    expect(screen.getByText(/使用列: 5 \/ 7/)).toBeInTheDocument();
  });

  test("実験計画の表は割り当てた列の水準になる", async () => {
    const user = userEvent.setup();
    render(<L8Interaction />);
    await setUp(user);

    const plan = sectionOf("実験計画（L8）");
    const cells = (run: string) =>
      Array.from(rowIn(plan, run).querySelectorAll("td")).map(
        (td) => td.textContent,
      );
    expect(cells("1")).toEqual(["1", "60℃", "1h", "1mol%"]);
    expect(cells("4")).toEqual(["4", "60℃", "3h", "2mol%"]);
    expect(cells("7")).toEqual(["7", "80℃", "3h", "1mol%"]);
    expect(cells("8")).toEqual(["8", "80℃", "3h", "2mol%"]);
  });

  test("交絡を避けられない交互作用は選べない", async () => {
    const user = userEvent.setup();
    render(<L8Interaction />);
    // 因子A〜D、交互作用 A×B が選ばれた状態
    await user.click(screen.getByRole("button", { name: "因子を追加" }));
    await user.click(screen.getByRole("button", { name: "因子を追加" }));

    expect(screen.getByRole("checkbox", { name: "因子A×因子B" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "因子A×因子C" })).toBeEnabled();
    expect(screen.getByRole("checkbox", { name: "因子C×因子D" })).toBeDisabled();
  });
});

describe("L8Interaction: 分散分析とグラフ", () => {
  test("結果が8ラン分そろうまで分散分析表とグラフは表示されない", async () => {
    const user = userEvent.setup();
    render(<L8Interaction />);
    await setUp(user);
    await enterResults(user, RESULTS_INTERACTION.slice(0, 7));

    expect(
      screen.queryByRole("heading", { name: "分散分析表（ANOVA）" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  test("パターン1：分散分析表に因子・交互作用・誤差が表示される", async () => {
    const user = userEvent.setup();
    render(<L8Interaction />);
    await setUp(user);
    await enterResults(user, RESULTS_INTERACTION);

    const anova = sectionOf("分散分析表（ANOVA）");
    expect(within(anova).getByText("全体平均: 70.025")).toBeInTheDocument();
    expect(rowIn(anova, "温度")).toHaveTextContent("70.805");
    expect(rowIn(anova, "温度")).toHaveTextContent("+5.950");
    expect(rowIn(anova, "温度×反応時間")).toHaveTextContent("C3");
    expect(rowIn(anova, "温度×反応時間")).toHaveTextContent("196.020");
    expect(rowIn(anova, "温度×反応時間")).toHaveTextContent("64.54%");
    expect(rowIn(anova, "温度×触媒量")).toHaveTextContent("C5");
    expect(rowIn(anova, "誤差")).toHaveTextContent("0.370");
    expect(rowIn(anova, "誤差")).toHaveTextContent("0.185");
    expect(rowIn(anova, "合計")).toHaveTextContent("303.715");

    // 2×2 の組み合わせ平均
    expect(within(anova).getByText("76.900")).toBeInTheDocument();
    expect(within(anova).getByText("69.100")).toBeInTheDocument();
  });

  test("パターン1：要因効果図・寄与率グラフ・交互作用図が表示される", async () => {
    const user = userEvent.setup();
    render(<L8Interaction />);
    await setUp(user);
    await enterResults(user, RESULTS_INTERACTION);

    // 要因効果図：因子だけが描かれる
    const mainEffects = screen.getByRole("img", { name: "要因効果図" });
    for (const label of ["温度", "反応時間", "触媒量", "60℃", "3h", "2mol%"]) {
      expect(within(mainEffects).getByText(label)).toBeInTheDocument();
    }
    expect(
      within(mainEffects).queryByText("温度×反応時間"),
    ).not.toBeInTheDocument();

    // 寄与率グラフ：因子・交互作用・誤差が大きい順に並ぶ
    const contribution = screen.getByRole("img", { name: "寄与率グラフ" });
    const order = within(contribution)
      .getAllByText(/^(温度|反応時間|触媒量|温度×反応時間|温度×触媒量|誤差)$/)
      .map((el) => el.textContent);
    expect(order).toEqual([
      "温度×反応時間",
      "温度",
      "触媒量",
      "反応時間",
      "誤差",
      "温度×触媒量",
    ]);
    expect(within(contribution).getByText("64.5%")).toBeInTheDocument();

    // 交互作用図：選んだ交互作用ごとに1枚
    const tempTime = screen.getByRole("img", {
      name: "交互作用図 温度×反応時間",
    });
    for (const label of ["60℃", "80℃", "温度", "1h", "3h"]) {
      expect(within(tempTime).getByText(label)).toBeInTheDocument();
    }
    expect(
      within(tempTime).getByText("温度=80℃, 反応時間=3h: 69.100"),
    ).toBeInTheDocument();

    const tempCat = screen.getByRole("img", { name: "交互作用図 温度×触媒量" });
    expect(
      within(tempCat).getByText("温度=60℃, 触媒量=1mol%: 65.400"),
    ).toBeInTheDocument();
  });

  test("パターン2：交互作用の寄与率は 0.0% になる", async () => {
    const user = userEvent.setup();
    render(<L8Interaction />);
    await setUp(user);
    await enterResults(user, RESULTS_NO_INTERACTION);

    const anova = sectionOf("分散分析表（ANOVA）");
    expect(rowIn(anova, "温度")).toHaveTextContent("65.33%");
    expect(rowIn(anova, "温度×反応時間")).toHaveTextContent("0.01%");
    expect(rowIn(anova, "温度×触媒量")).toHaveTextContent("0.04%");

    const contribution = screen.getByRole("img", { name: "寄与率グラフ" });
    expect(within(contribution).getAllByText("0.0%")).toHaveLength(2);
    expect(
      screen.getAllByRole("img", { name: /^交互作用図 / }),
    ).toHaveLength(2);
  });

  test("交互作用を選ばないと交互作用図は表示されない", async () => {
    const user = userEvent.setup();
    render(<L8Interaction />);
    await user.click(screen.getByRole("checkbox", { name: "因子A×因子B" }));
    await enterResults(user, RESULTS_INTERACTION);

    expect(screen.getByRole("img", { name: "要因効果図" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "寄与率グラフ" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "交互作用図" }),
    ).not.toBeInTheDocument();
  });

  test("結果がすべて同じ値だと寄与率グラフの代わりに説明を表示する", async () => {
    const user = userEvent.setup();
    render(<L8Interaction />);
    await enterResults(user, Array(8).fill("50"));

    expect(screen.getByRole("img", { name: "要因効果図" })).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "寄与率グラフ" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("結果がすべて同じ値のため、寄与率は計算できません。"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "交互作用図 因子A×因子B" }),
    ).toBeInTheDocument();
  });
});
