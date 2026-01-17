"use client";
import { Button } from "@/components/ui/Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { solute: "", solvent: "" },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const soluteNum = Number(data.solute);
    const solventNum = Number(data.solvent);

    if (solventNum === 0) {
      setResult(null);
      return;
    }

    setResult((soluteNum / solventNum) * 100);
  };

  return (
    <main className="p-6 space-y-4">
      <p className="text-gray-700">溶液の質量パーセント濃度を計算します。</p>

      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-lg mr-2 ">溶質の量 (g)：</label>
          <input
            className="border border-gray-900 border-solid rounded-lg w-36 h-8 text-lg"
            {...register("solute")}
          />
          {errors.solute?.message && (
            <p className="text-red-500 text-sm">{errors.solute.message}</p>
          )}
        </div>

        <div>
          <label className="text-lg mr-2">溶媒の量 (g)：</label>
          <input
            className="border border-gray-900 border-solid rounded-lg w-36 h-8 text-lg"
            {...register("solvent")}
          />
          {errors.solvent?.message && (
            <p className="text-red-500 text-sm">{errors.solvent.message}</p>
          )}
        </div>

        <div className="flex flex-row items-center mt-6 ">
          <Button type="submit" variant="outline" size="md" textSize="lg">
            濃度を計算
          </Button>
          <div className="font-bold text-lg ml-6">計算結果</div>
          <div className="ml-4 text-lg">
            {result === null ? (
              <p className=" text-gray-500">
                (入力後に計算ボタンを押してください。)
              </p>
            ) : (
              <p className="text-gray-700">濃度: {result.toFixed(1)}%</p>
            )}
          </div>
        </div>
      </form>
    </main>
  );
};

export default Page;
