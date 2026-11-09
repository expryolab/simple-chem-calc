"use client";
import { MdOutlineCancel } from "react-icons/md";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

import { Button } from "@/components/ui/Button";
import { formatSignificant } from "@/utils/chemistry";
import type { LinearFit } from "@/utils/regression";
import { CalibrationChart } from "./components/CalibrationChart";
import { useCalibrationForm } from "./hooks";

const inputClass =
  "w-full h-9 border border-gray-900 border-solid rounded-lg text-lg px-2";

/** y = ax + b を KaTeX 用の文字列にする（切片の符号を整える） */
const equationTex = (fit: LinearFit): string => {
  const a = formatSignificant(fit.slope);
  if (fit.throughOrigin) return `y = ${a}x`;
  const sign = fit.intercept < 0 ? "-" : "+";
  return `y = ${a}x ${sign} ${formatSignificant(Math.abs(fit.intercept))}`;
};

const Page = () => {
  const {
    register,
    handleSubmit,
    errors,
    onSubmit,
    standardFields,
    appendStandard,
    removeStandard,
    sampleFields,
    appendSample,
    removeSample,
    result,
    calcError,
  } = useCalibrationForm();

  return (
    <main className="p-6 space-y-6 w-full">
      <p>
        標準液の濃度と測定値（吸光度・ピーク面積など）から最小二乗法で検量線を引き、試料の濃度を求めます。
      </p>

      <form
        className="space-y-6 max-w-2xl"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {/* 軸ラベル・オプション */}
        <section className="space-y-3">
          <h4 className="font-bold text-lg">設定</h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span>横軸（濃度）の名前と単位</span>
              <input className={inputClass} {...register("xLabel")} />
            </label>
            <label className="flex flex-col gap-1">
              <span>縦軸（測定値）の名前</span>
              <input className={inputClass} {...register("yLabel")} />
            </label>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="size-4 accent-indigo-600"
              {...register("throughOrigin")}
            />
            <span>原点を通る直線にする（切片 0）</span>
          </label>
        </section>

        {/* 標準液 */}
        <section className="space-y-2">
          <h4 className="font-bold text-lg">標準液</h4>
          <div className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 items-center font-bold">
            <span />
            <span className="border-b-[3px] border-black">濃度 x</span>
            <span className="border-b-[3px] border-black">測定値 y</span>
            <span />
          </div>
          {standardFields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 items-start"
            >
              <span className="h-9 flex items-center text-gray-500">
                {index + 1}
              </span>
              <div>
                <input
                  className={inputClass}
                  inputMode="decimal"
                  aria-label={`標準液${index + 1}の濃度`}
                  placeholder="例: 0.5"
                  {...register(`standards.${index}.x`)}
                />
                {errors.standards?.[index]?.x?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.standards[index].x.message}
                  </p>
                )}
              </div>
              <div>
                <input
                  className={inputClass}
                  inputMode="decimal"
                  aria-label={`標準液${index + 1}の測定値`}
                  placeholder="例: 0.123"
                  {...register(`standards.${index}.y`)}
                />
                {errors.standards?.[index]?.y?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.standards[index].y.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="h-9 flex items-center text-gray-600 hover:text-red-500"
                aria-label={`標準液${index + 1}を削除`}
                onClick={() => removeStandard(index)}
              >
                <MdOutlineCancel size={25} />
              </button>
            </div>
          ))}
          {errors.standards?.root?.message && (
            <p className="text-red-500 text-sm">
              {errors.standards.root.message}
            </p>
          )}
          <Button type="button" variant="outline" onClick={appendStandard}>
            標準液を追加
          </Button>
        </section>

        {/* 試料 */}
        <section className="space-y-2">
          <h4 className="font-bold text-lg">試料（任意）</h4>
          <div className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 items-center font-bold">
            <span />
            <span className="border-b-[3px] border-black">試料名</span>
            <span className="border-b-[3px] border-black">測定値 y</span>
            <span />
          </div>
          {sampleFields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 items-start"
            >
              <span className="h-9 flex items-center text-gray-500">
                {index + 1}
              </span>
              <input
                className={inputClass}
                aria-label={`試料${index + 1}の名前`}
                placeholder={`試料${index + 1}`}
                {...register(`samples.${index}.name`)}
              />
              <div>
                <input
                  className={inputClass}
                  inputMode="decimal"
                  aria-label={`試料${index + 1}の測定値`}
                  placeholder="例: 0.234"
                  {...register(`samples.${index}.y`)}
                />
                {errors.samples?.[index]?.y?.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.samples[index].y.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="h-9 flex items-center text-gray-600 hover:text-red-500"
                aria-label={`試料${index + 1}を削除`}
                onClick={() => removeSample(index)}
              >
                <MdOutlineCancel size={25} />
              </button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={appendSample}>
            試料を追加
          </Button>
        </section>

        <Button type="submit" variant="solid" textSize="lg">
          検量線を作成
        </Button>
      </form>

      {/* 結果 */}
      <section className="space-y-4">
        <h4 className="font-bold text-lg">計算結果</h4>
        {calcError && <p className="text-red-500">{calcError}</p>}
        {!calcError && !result && (
          <p className="text-gray-500 text-sm">
            (入力後に「検量線を作成」ボタンを押してください。)
          </p>
        )}
        {!calcError && result && (
          <>
            <div className="text-lg">
              <BlockMath math={equationTex(result.fit)} />
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 max-w-md">
              <dt className="font-bold">傾き a</dt>
              <dd>{formatSignificant(result.fit.slope)}</dd>
              {!result.fit.throughOrigin && (
                <>
                  <dt className="font-bold">切片 b</dt>
                  <dd>{formatSignificant(result.fit.intercept)}</dd>
                </>
              )}
              <dt className="font-bold">
                決定係数 <InlineMath math="R^2" />
              </dt>
              <dd>
                {Number.isFinite(result.fit.rSquared)
                  ? result.fit.rSquared.toFixed(5)
                  : "—"}
              </dd>
              <dt className="font-bold">残差標準偏差 σ</dt>
              <dd>{formatSignificant(result.fit.residualSd)}</dd>
              <dt className="font-bold">検出下限 LOD</dt>
              <dd>{formatSignificant(result.lod)}</dd>
              <dt className="font-bold">定量下限 LOQ</dt>
              <dd>{formatSignificant(result.loq)}</dd>
            </dl>
            <p className="text-sm text-gray-600">
              LOD = 3.3σ / a、LOQ = 10σ / a（σ は回帰の残差標準偏差）。単位は横軸と同じです。
            </p>

            {result.samples.length > 0 && (
              <table className="border-collapse max-w-md w-full">
                <thead>
                  <tr className="border-b-[3px] border-black text-left">
                    <th className="py-1 pr-4">試料</th>
                    <th className="py-1 pr-4">測定値 y</th>
                    <th className="py-1">{result.xLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.samples.map((s, i) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="py-1 pr-4">{s.name}</td>
                      <td className="py-1 pr-4">{formatSignificant(s.y)}</td>
                      <td className="py-1">
                        <span className="font-bold">
                          {formatSignificant(s.x)}
                        </span>
                        {s.outOfRange && (
                          <span className="ml-2 text-sm text-amber-600">
                            ※検量線の範囲外
                          </span>
                        )}
                        {!s.outOfRange && s.x < result.loq && (
                          <span className="ml-2 text-sm text-amber-600">
                            ※LOQ未満
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <CalibrationChart result={result} />
            <ul className="flex flex-wrap gap-4 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="inline-block size-3 rounded-full bg-gray-800" />
                標準液
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block w-5 h-0.5 bg-indigo-500" />
                検量線
              </li>
              {result.samples.length > 0 && (
                <li className="flex items-center gap-2">
                  <span className="inline-block size-2.5 rotate-45 bg-amber-500" />
                  試料
                </li>
              )}
            </ul>
          </>
        )}
      </section>
    </main>
  );
};

export default Page;
