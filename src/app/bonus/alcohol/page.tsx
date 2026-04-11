"use client";
import { Button } from "@/components/ui/Button";
import { formatResult } from "@/utils/chemistry";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

/** エタノールの密度 (g/ml) */
const ETHANOL_DENSITY = 0.789;

const numericString = z
  .string()
  .min(1, "入力は必須です")
  .regex(/^[0-9]+(\.[0-9]+)?$/, "半角数字のみです");

const schema = z.object({
  name: z.string().min(1, "お酒の種類を入力してください"),
  volume: numericString,
  percentage: numericString.refine(
    (v) => {
      const n = parseFloat(v);
      return n > 0 && n <= 100;
    },
    { message: "0より大きく100以下で入力してください" },
  ),
});

type FormValues = z.infer<typeof schema>;

type AlcoholEntry = {
  id: number;
  name: string;
  volumeMl: number;
  percentage: number;
  ethanolMl: number;
  ethanolGram: number;
};

let idCounter = 0;

const Page = () => {
  const [entries, setEntries] = useState<AlcoholEntry[]>([]);
  const [calcError, setCalcError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", volume: "", percentage: "" },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const vol = parseFloat(data.volume);
    const pct = parseFloat(data.percentage);

    if (!Number.isFinite(vol) || !Number.isFinite(pct)) {
      setCalcError("数値を入力してください。");
      return;
    }

    const ethanolMl = vol * (pct / 100);
    const ethanolGram = ethanolMl * ETHANOL_DENSITY;

    const entry: AlcoholEntry = {
      id: ++idCounter,
      name: data.name,
      volumeMl: vol,
      percentage: pct,
      ethanolMl,
      ethanolGram,
    };

    setEntries((prev) => [...prev, entry]);
    setCalcError(null);
    reset();
  };

  const removeEntry = (id: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const clearAll = () => {
    setEntries([]);
  };

  const totalEthanolMl = entries.reduce((sum, e) => sum + e.ethanolMl, 0);

  return (
    <main className="p-6 space-y-4 w-full">
      <form
        className="space-y-3 max-w-xl"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="flex items-center gap-3">
          <label className="w-48 text-lg text-right">お酒の種類：</label>
          <div className="flex flex-col">
            <input
              className="w-48 h-9 border border-gray-900 border-solid rounded-lg text-lg px-2"
              placeholder="例: ビール"
              {...register("name")}
            />
            {errors.name?.message && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="w-48 text-lg text-right">お酒の量 (ml)：</label>
          <div className="flex flex-col">
            <input
              className="w-48 h-9 border border-gray-900 border-solid rounded-lg text-lg px-2"
              inputMode="decimal"
              placeholder="例: 350"
              {...register("volume")}
            />
            {errors.volume?.message && (
              <p className="text-red-500 text-sm mt-1">
                {errors.volume.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="w-48 text-lg text-right">度数 (%)：</label>
          <div className="flex flex-col">
            <input
              className="w-48 h-9 border border-gray-900 border-solid rounded-lg text-lg px-2"
              inputMode="decimal"
              placeholder="例: 5"
              {...register("percentage")}
            />
            {errors.percentage?.message && (
              <p className="text-red-500 text-sm mt-1">
                {errors.percentage.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-row items-center mt-6 gap-3">
          <Button type="submit" variant="outline" size="md" textSize="lg">
            追加する
          </Button>
        </div>

        {calcError && <p className="text-red-500 text-sm ml-4">{calcError}</p>}
      </form>

      {/* 結果一覧 */}
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-lg">計算結果一覧</h4>
          {entries.length > 0 && (
            <button
              type="button"
              className="text-sm text-red-500 hover:text-red-700 underline"
              onClick={clearAll}
            >
              すべてクリア
            </button>
          )}
        </div>

        {entries.length === 0 ? (
          <p className="text-gray-500 text-sm ml-2">
            (お酒を追加すると一覧に表示されます。)
          </p>
        ) : (
          <>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="py-2 px-2 text-sm">種類</th>
                  <th className="py-2 px-2 text-sm text-right">量 (ml)</th>
                  <th className="py-2 px-2 text-sm text-right">度数 (%)</th>
                  <th className="py-2 px-2 text-sm text-right">
                    エタノール (ml)
                  </th>
                  <th className="py-2 px-2 text-sm"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-200">
                    <td className="py-2 px-2">{entry.name}</td>
                    <td className="py-2 px-2 text-right">{entry.volumeMl}</td>
                    <td className="py-2 px-2 text-right">{entry.percentage}</td>
                    <td className="py-2 px-2 text-right">
                      {formatResult(entry.ethanolMl)}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        className="text-red-400 hover:text-red-600 text-sm"
                        onClick={() => removeEntry(entry.id)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-400 font-bold">
                  <td className="py-2 px-2" colSpan={3}>
                    合計
                  </td>
                  <td className="py-2 px-2 text-right">
                    {formatResult(totalEthanolMl)} ml
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </>
        )}
      </div>
    </main>
  );
};

export default Page;
