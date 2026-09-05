import Link from "next/link";

export default function Home() {
  return (
    <>
      <h1 className="text-4xl font-bold leading-10 tracking-tight text-black ">
        実験室で使えるちょっと便利な計算ができるサイト
      </h1>
      <div>
        とりあえず実験計画法試してみたいという方は
        <Link
          href="/exp-design/orthogonal-array-l8"
          className="whitespace-nowrap text-indigo-600 underline hover:text-indigo-800"
        >
          こちら
        </Link>
        からどうぞ
      </div>
      <div className="mt-6">
        <p className="text-lg font-medium">このサイトでできること</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            実量から%濃度を計算する（実量 → %）
            <Link
              href="/proportion"
              className="ml-2 whitespace-nowrap text-indigo-600 underline hover:text-indigo-800"
            >
              こちら
            </Link>
          </li>
          <li>
            %濃度から実量を計算する（% → 実量）
            <Link
              href="/prorate"
              className="ml-2 whitespace-nowrap text-indigo-600 underline hover:text-indigo-800"
            >
              こちら
            </Link>
          </li>
          <li>
            重量部(phr)を計算する
            <Link
              href="/phr"
              className="ml-2 whitespace-nowrap text-indigo-600 underline hover:text-indigo-800"
            >
              こちら
            </Link>
          </li>
          <li>
            溶液の濃度を計算する
            <Link
              href="/percent"
              className="ml-2 whitespace-nowrap text-indigo-600 underline hover:text-indigo-800"
            >
              こちら
            </Link>
          </li>
          <li>
            溶液の希釈計算をする
            <Link
              href="/dilution"
              className="ml-2 whitespace-nowrap text-indigo-600 underline hover:text-indigo-800"
            >
              こちら
            </Link>
          </li>
          <li>
            モル濃度を計算する
            <Link
              href="/molarity"
              className="ml-2 whitespace-nowrap text-indigo-600 underline hover:text-indigo-800"
            >
              こちら
            </Link>
          </li>
          <li>
            実験計画法の直交表（L8表・L9表）を確認する
            <Link
              href="/exp-design/orthogonal-array-l8"
              className="ml-2 whitespace-nowrap text-indigo-600 underline hover:text-indigo-800"
            >
              こちら
            </Link>
          </li>
          <li>
            料理を作るときの分量を調整する
            <Link
              href="/bonus/serving-scale"
              className="ml-2 whitespace-nowrap text-indigo-600 underline hover:text-indigo-800"
            >
              こちら
            </Link>
          </li>
          <li>
            お酒に含まれるアルコール量を計算する
            <Link
              href="/bonus/alcohol"
              className="ml-2 whitespace-nowrap text-indigo-600 underline hover:text-indigo-800"
            >
              こちら
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
