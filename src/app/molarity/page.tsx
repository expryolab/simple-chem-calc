"use client";
import { Button } from "@/components/ui/Button";
import { formatResult } from "@/utils/chemistry";
import { useMolarityForm } from "./hooks";

import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

const Page = () => {
  const {
    register,
    handleSubmit,
    errors,
    onSubmit,
    molarConcentration,
    calcError,
  } = useMolarityForm();

  return (
    <main className="p-6 space-y-4 w-full">
      <p>質量・分子量・溶液量からモル濃度が計算できます。</p>
      <div>
        <BlockMath math="C = \dfrac{m}{M \times V}" />
      </div>
      <p className="font-semibold text-indigo-700">
        ※ 質量は g、分子量は g/mol、溶液量は mL で入力してください
      </p>
      <form
        className="space-y-3 max-w-xl"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
          <label className="text-lg md:w-48 md:text-right">質量 (g)：</label>
          <div className="flex flex-col">
            <input
              className="w-full h-9 border border-gray-900 border-solid rounded-lg text-lg px-2 md:w-48"
              inputMode="decimal"
              placeholder="例: 5.85"
              {...register("mass")}
            />
            {errors.mass?.message && (
              <p className="text-red-500 text-sm mt-1">{errors.mass.message}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
          <label className="text-lg md:w-48 md:text-right">
            分子量 (g/mol)：
          </label>
          <div className="flex flex-col">
            <input
              className="w-full h-9 border border-gray-900 border-solid rounded-lg text-lg px-2 md:w-48"
              inputMode="decimal"
              placeholder="例: 58.44"
              {...register("molecularWeight")}
            />
            {errors.molecularWeight?.message && (
              <p className="text-red-500 text-sm mt-1">
                {errors.molecularWeight.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
          <label className="text-lg md:w-48 md:text-right">溶液量 (mL)：</label>
          <div className="flex flex-col">
            <input
              className="w-full h-9 border border-gray-900 border-solid rounded-lg text-lg px-2 md:w-48"
              inputMode="decimal"
              placeholder="例: 1000"
              {...register("volume")}
            />
            {errors.volume?.message && (
              <p className="text-red-500 text-sm mt-1">
                {errors.volume.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-row items-center mt-6 gap-3">
          <Button type="submit" variant="outline" size="md" textSize="lg">
            濃度を計算
          </Button>
        </div>
        <div className="font-bold text-lg ml-6">計算結果</div>
        <div className="ml-4 text-lg min-w-50">
          {calcError && <p className="text-red-500 text-sm">{calcError}</p>}
          {!calcError && molarConcentration !== null && (
            <div className="space-y-1">
              <p className="text-gray-700">
                <span className="font-bold">モル濃度:</span>{" "}
                {formatResult(molarConcentration)} mol/L
              </p>
              <p className="text-gray-700">
                <span className="font-bold">モル濃度:</span>{" "}
                {formatResult(molarConcentration * 1000)} mmol/L (mM)
              </p>
            </div>
          )}
          {!calcError && molarConcentration === null && (
            <p className="text-gray-500 text-sm">
              (入力後に計算ボタンを押してください。)
            </p>
          )}
        </div>
      </form>
    </main>
  );
};

export default Page;
