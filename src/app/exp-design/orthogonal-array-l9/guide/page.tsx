import Link from "next/link";

const Page = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/exp-design/orthogonal-array-l9"
          className="text-indigo-600 underline hover:text-indigo-800 text-sm"
        >
          ← L9表の割り当てに戻る
        </Link>
      </div>

      <h1 className="text-2xl font-bold">L9表の使い方</h1>
      <p className="text-sm text-gray-600">
        このページでは、L9直交表ツールの使い方を順番に説明します。
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">L9直交表とは</h2>
        <p className="text-sm text-gray-700">
          L9直交表は、3水準の因子を最大4つまで、9回の実験（ラン）で効率よく評価できる実験計画法の表です。
          全ての因子の組み合わせを試す（総当たり）よりも少ない実験回数で、各因子が結果に与える影響を調べることができます。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">1. 因子を定義する</h2>
        <p className="text-sm text-gray-700">
          「因子の定義」セクションで、評価したい因子（例：温度、時間、濃度など）を登録します。
        </p>
        <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
          <li>「因子を追加」ボタンで因子を増やせます（最大4つまで）。</li>
          <li>因子名、水準1・水準2・水準3のラベルを入力します。</li>
          <li>不要な因子は「削除」で取り除けます。</li>
          <li>因子を登録した順番が、そのまま表の列（C1, C2, ...）に割り当てられます。</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">2. 実験計画（L9）を確認する</h2>
        <p className="text-sm text-gray-700">
          因子を登録すると、9回分の実験条件（各因子をどの水準で組み合わせて実験するか）が自動的に表示されます。
          この表の通りに9回の実験を行ってください。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">3. 実験結果を入力する</h2>
        <p className="text-sm text-gray-700">
          「実験結果の入力」セクションに、Run 1〜9それぞれで得られた結果（応答値）を数値で入力します。
          9つ全ての結果を入力すると、分散分析（ANOVA）が自動的に計算されます。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">4. 分散分析表（ANOVA）を見る</h2>
        <p className="text-sm text-gray-700">
          分散分析表では、各因子が結果にどれくらい影響しているかを確認できます。
        </p>
        <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
          <li>平方和（SS）・自由度（df）・平均平方（MS）：統計的なばらつきの大きさを表す値です。各因子の自由度は2（3水準−1）です。</li>
          <li>寄与率：全体のばらつきのうち、その因子がどれくらいの割合を占めるかを示します。数値が大きいほど結果への影響が大きい因子です。</li>
        </ul>
        <p className="text-sm text-gray-700">
          さらに下の「各因子の水準別平均」では、因子ごとに水準1・水準2・水準3それぞれの平均値を確認できます。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">注意点</h2>
        <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
          <li>このツールは主効果のみを扱い、因子同士の交互作用は考慮していません。</li>
          <li>因子の並び順を変えると、割り当てられる列（C1, C2, ...）も変わるため、実験計画表も変わります。</li>
        </ul>
      </section>

      <div>
        <Link
          href="/exp-design/orthogonal-array-l9"
          className="text-indigo-600 underline hover:text-indigo-800 text-sm"
        >
          ← L9表の割り当てに戻る
        </Link>
      </div>
    </div>
  );
};

export default Page;
