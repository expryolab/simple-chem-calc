import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import L8Simple from "./L8Simple";

/** anova.test.ts と同じダミーデータ（合成反応の収率%） */
const FACTORS = [
  { name: "温度", level1: "60℃", level2: "80℃" },
  { name: "反応時間", level1: "1h", level2: "3h" },
  { name: "触媒量", level1: "1mol%", level2: "2mol%" },
  { name: "溶媒", level1: "トルエン", level2: "THF" },
  { name: "攪拌速度", level1: "200rpm", level2: "500rpm" },
];
const RESULTS = ["49.7", "48.3", "59.9", "58.1", "65.5", "64.5", "68.9", "65.1"];

type User = ReturnType<typeof userEvent.setup>;

const replaceText = async (user: User, input: HTMLElement, text: string) => {
  await user.clear(input);
  await user.type(input, text);
};

/** 因子を5つ定義する（初期表示の1因子 + 追加4つ） */
const defineFactors = async (user: User) => {
  for (let i = 1; i < FACTORS.length; i++) {
    await user.click(screen.getByRole("button", { name: "因子を追加" }));
  }
  const names = screen.getAllByPlaceholderText("因子名 (例: 温度)");
  const level1s = screen.getAllByPlaceholderText("水準1 ラベル (例: 低)");
  const level2s = screen.getAllByPlaceholderText("水準2 ラベル (例: 高)");
  for (const [i, f] of FACTORS.entries()) {
    await replaceText(user, names[i], f.name);
    await replaceText(user, level1s[i], f.level1);
    await replaceText(user, level2s[i], f.level2);
  }
};

const enterResults = async (user: User, values: string[]) => {
  const inputs = screen.getAllByPlaceholderText("結果値");
  for (const [i, v] of values.entries()) {
    await user.type(inputs[i], v);
  }
};

const sectionOf = (heading: string): HTMLElement =>
  screen.getByRole("heading", { name: heading }).closest("section")!;

describe("L8Simple", () => {
  test("結果が8ラン分そろうまで分散分析表とグラフは表示されない", async () => {
    const user = userEvent.setup();
    render(<L8Simple />);
    await defineFactors(user);
    await enterResults(user, RESULTS.slice(0, 7));

    expect(
      screen.queryByRole("heading", { name: "分散分析表（ANOVA）" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  test("ダミーデータを入力すると分散分析表とグラフが表示される", async () => {
    const user = userEvent.setup();
    render(<L8Simple />);
    await defineFactors(user);
    await enterResults(user, RESULTS);

    // 分散分析表
    const anova = sectionOf("分散分析表（ANOVA）");
    expect(within(anova).getByText("全体平均: 60.000")).toBeInTheDocument();

    const rowOf = (name: string) =>
      within(anova)
        .getAllByRole("row")
        .find((r) => r.querySelector("td")?.textContent === name)!;
    expect(rowOf("温度")).toHaveTextContent("288.000");
    expect(rowOf("温度")).toHaveTextContent("71.58%");
    expect(rowOf("温度")).toHaveTextContent("+12.000");
    expect(rowOf("溶媒")).toHaveTextContent("-2.000");
    expect(rowOf("誤差")).toHaveTextContent("0.50%");
    expect(rowOf("合計")).toHaveTextContent("402.320");

    // 要因効果図：因子名と水準ラベルが描かれている
    const mainEffects = screen.getByRole("img", { name: "要因効果図" });
    for (const label of ["温度", "溶媒", "60℃", "80℃", "THF"]) {
      expect(within(mainEffects).getByText(label)).toBeInTheDocument();
    }

    // 寄与率グラフ：大きい順（誤差を含む）に並ぶ
    const contribution = screen.getByRole("img", { name: "寄与率グラフ" });
    const order = within(contribution)
      .getAllByText(/^(温度|反応時間|触媒量|溶媒|攪拌速度|誤差)$/)
      .map((el) => el.textContent);
    expect(order).toEqual([
      "温度",
      "反応時間",
      "触媒量",
      "溶媒",
      "誤差",
      "攪拌速度",
    ]);
    expect(within(contribution).getByText("71.6%")).toBeInTheDocument();
  });

  test("結果がすべて同じ値だと寄与率グラフの代わりに説明を表示する", async () => {
    const user = userEvent.setup();
    render(<L8Simple />);
    await enterResults(user, Array(8).fill("50"));

    expect(screen.getByRole("img", { name: "要因効果図" })).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "寄与率グラフ" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("結果がすべて同じ値のため、寄与率は計算できません。"),
    ).toBeInTheDocument();
  });
});
