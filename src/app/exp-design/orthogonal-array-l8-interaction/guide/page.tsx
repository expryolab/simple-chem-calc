import Link from "next/link";

const Page = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/exp-design/orthogonal-array-l8-interaction"
          className="text-indigo-600 underline hover:text-indigo-800 text-sm"
        >
          ← L8表（交互作用あり）に戻る
        </Link>
      </div>

      <h1 className="text-2xl font-bold">L8表（交互作用あり）の使い方</h1>
      <p className="text-sm text-gray-600">
        このページでは、交互作用を考慮したL8直交表ツールの使い方を順番に説明します。
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">交互作用とは</h2>
        <p className="text-sm text-gray-700">
          交互作用とは、ある因子の効果が別の因子の水準によって変わることです。
          例えば「温度を上げると収率が上がるが、それは時間が長いときだけ」という場合、温度と時間の間に交互作用があります。
        </p>
        <p className="text-sm text-gray-700">
          L8直交表では、2つの列の交互作用は決まった別の列に現れます（例: C1とC2の交互作用はC3）。
          そのため、交互作用を調べたい場合は、その列に他の因子を割り当てないようにする必要があります。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">1. 因子を定義する</h2>
        <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
          <li>「因子を追加」ボタンで因子を増やせます。</li>
          <li>因子名、水準1のラベル（例：低）、水準2のラベル（例：高）を入力します。</li>
          <li>因子の列（C1, C2, ...）は、選んだ交互作用に合わせて自動で決まります。</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">2. 調べたい交互作用を選ぶ</h2>
        <p className="text-sm text-gray-700">
          「調べたい交互作用」で、評価したい因子の組み合わせにチェックを入れます。
        </p>
        <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
          <li>因子と交互作用は合わせて7列まで使えます。</li>
          <li>割り当てられない組み合わせは選べない（グレー表示）ようになっています。</li>
          <li>
            7列すべてを使うと誤差の自由度が0になり、誤差を求められません。可能なら1列以上空けておくのがおすすめです。
          </li>
          <li>例: 3因子とすべての交互作用（A, B, C, A×B, A×C, B×C）は6列を使い、残り1列が誤差になります。</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">3. 列の割り当てと実験計画を確認する</h2>
        <p className="text-sm text-gray-700">
          「列の割り当て」に、各列（C1〜C7）が因子・交互作用・誤差のどれに使われているかが表示されます。
          選んでいない交互作用が因子と同じ列に現れる場合は注意書きが出ます（その交互作用は無視できると仮定しています）。
        </p>
        <p className="text-sm text-gray-700">
          「実験計画（L8）」の表の通りに8回の実験を行ってください。交互作用の列は実験で設定する必要はありません。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">4. 実験結果を入力して分散分析表を見る</h2>
        <p className="text-sm text-gray-700">
          Run 1〜8の結果を全て入力すると、分散分析（ANOVA）が自動的に計算されます。
        </p>
        <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
          <li>分散分析表には、因子に加えて交互作用（例: A×B）の行が表示されます。</li>
          <li>寄与率が大きい交互作用ほど、結果への影響が大きいことを意味します。</li>
          <li>
            「交互作用の組み合わせ平均（2×2）」では、2つの因子の水準の組み合わせごとの平均値を確認できます。
            交互作用が大きい場合は、因子単独の水準別平均ではなく、この組み合わせ平均から最適な条件を選んでください。
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">注意点</h2>
        <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
          <li>3因子以上の交互作用（A×B×Cなど）は扱いません。</li>
          <li>
            主効果のみを調べたい場合は
            <Link
              href="/exp-design/orthogonal-array-l8"
              className="text-indigo-600 underline hover:text-indigo-800"
            >
              L8表（主効果のみ）
            </Link>
            を使ってください。
          </li>
        </ul>
      </section>

      <div>
        <Link
          href="/exp-design/orthogonal-array-l8-interaction"
          className="text-indigo-600 underline hover:text-indigo-800 text-sm"
        >
          ← L8表（交互作用あり）に戻る
        </Link>
      </div>
    </div>
  );
};

export default Page;
