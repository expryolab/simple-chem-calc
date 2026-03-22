"use client";
import { Button } from "@/components/ui/Button";
import { unitOptions, toGrams, formatResult } from "@/utils/chemistry";
import type { Unit } from "@/utils/chemistry";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

type FormUnits = {
  soluteUnit: Unit;
  solventUnit: Unit;
};

const schema = z.object({
  solute: z
    .string()
    .min(1, "入力は必須です")
    .regex(/^[0-9]+(\.[0-9]+)?$/, "半角数字のみです"),
  solvent: z
    .string()
    .min(1, "入力は必須です")
    .regex(/^[0-9]+(\.[0-9]+)?$/, "半角数字のみです"),
});

type FormValues = z.infer<typeof schema>;

const Page = () => {
  const [result, setResult] = useState<number | null>(null);
  const [unit, setUnit] = useState<FormUnits>({
    soluteUnit: "g",
    solventUnit: "g",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { solute: "", solvent: "" },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const soluteG = toGrams(Number(data.solute), unit.soluteUnit);
    const solventG = toGrams(Number(data.solvent), unit.solventUnit);

    if (solventG === 0) {
      setResult(null);
      return;
    }

    setResult((soluteG / solventG) * 100);
  };

  return (
    <main className="p-6 space-y-4">
      <p className="text-gray-700">溶液の質量パーセント濃度を計算します。</p>

      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-lg mr-2">溶質の量：</label>
          <input
            className="border border-gray-900 border-solid rounded-lg w-36 h-8 text-lg"
            {...register("solute")}
          />
          <select
            className="border border-gray-900 border-solid rounded-lg h-8 text-lg ml-2"
            value={unit.soluteUnit}
            onChange={(e) =>
              setUnit({ ...unit, soluteUnit: e.target.value as Unit })
            }
          >
            {unitOptions.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          {errors.solute?.message && (
            <p className="text-red-500 text-sm">{errors.solute.message}</p>
          )}
        </div>

        <div>
          <label className="text-lg mr-2">溶媒の量：</label>
          <input
            className="border border-gray-900 border-solid rounded-lg w-36 h-8 text-lg"
            {...register("solvent")}
          />
          <select
            className="border border-gray-900 border-solid rounded-lg h-8 text-lg ml-2"
            value={unit.solventUnit}
            onChange={(e) =>
              setUnit({ ...unit, solventUnit: e.target.value as Unit })
            }
          >
            {unitOptions.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          {errors.solvent?.message && (
            <p className="text-red-500 text-sm">{errors.solvent.message}</p>
          )}
        </div>

        <div className="flex flex-row items-center mt-6 ">
          <Button type="submit" variant="outline" size="md" textSize="lg">
            濃度を計算
          </Button>
          <div className="ml-6 text-lg">
            {result === null ? (
              <p className="text-gray-500">
                (入力後に計算ボタンを押してください。)
              </p>
            ) : (
              <div className="space-y-1">
                <p className="text-gray-700">
                  <span className="font-bold">濃度:</span>{" "}
                  {formatResult(result)}%
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">ppm:</span>{" "}
                  {formatResult(result * 10000)} ppm
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </main>
  );
};

export default Page;
