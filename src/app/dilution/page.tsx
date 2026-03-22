"use client";
import { Button } from "@/components/ui/Button";
import { useDilutionForm } from "./hooks";

import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

const Page = () => {
  const {
    register,
    handleSubmit,
    errors,
    onSubmit,
    requiredStockVolume,
    requiredDiluentVolume,
    calcError,
  } = useDilutionForm();

  return (
    <main className="p-6 space-y-4 w-full">
      <p>希釈に必要な原液の量が計算できます。</p>
      <div>
        <BlockMath math="C_1 V_1 = C_2 V_2" />
      </div>
      <p className="font-semibold text-indigo-700">
        ※ 単位は自由です（入力と結果は同じ単位になります）
      </p>
      <form
        className="space-y-3 max-w-xl"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="flex items-center gap-3">
          <label className="w-56 text-lg text-right">希望する溶液の量：</label>
          <div className="flex flex-col">
            <input
              className="w-48 h-9 border border-gray-900 border-solid rounded-lg text-lg px-2"
              {...register("desiredVolume")}
            />
            {errors.desiredVolume?.message && (
              <p className="text-red-500 text-sm mt-1">
                {errors.desiredVolume.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="w-56 text-lg text-right">
            希望する溶液の濃度(%)：
          </label>
          <div className="flex flex-col">
            <input
              className="w-48 h-9 border border-gray-900 border-solid rounded-lg text-lg px-2"
              {...register("desiredConcentration")}
            />
            {errors.desiredConcentration?.message && (
              <p className="text-red-500 text-sm mt-1">
                {errors.desiredConcentration.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="w-56 text-lg text-right">原液の濃度(%)：</label>
          <div className="flex flex-col">
            <input
              className="w-48 h-9 border border-gray-900 border-solid rounded-lg text-lg px-2"
              {...register("stockConcentration")}
            />
            {errors.stockConcentration?.message && (
              <p className="text-red-500 text-sm mt-1">
                {errors.stockConcentration.message}
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
          {!calcError && requiredStockVolume !== null && (
            <p className="text-gray-700">
              必要な原液量: {requiredStockVolume.toFixed(1)}
            </p>
          )}
          {!calcError && requiredDiluentVolume !== null && (
            <p className="text-gray-700">
              必要な希釈液量: {requiredDiluentVolume.toFixed(1)}
            </p>
          )}
          {!calcError && requiredStockVolume === null && (
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
