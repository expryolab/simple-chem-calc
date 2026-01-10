"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdOutlineCancel } from "react-icons/md";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

type ResultItem = {
  title: string;
  value: number;
  percent: number;
};

type Result = {
  total: number;
  items: ResultItem[];
};

export const schema = z.object({
  inputs: z
    .array(
      z.object({
        inputTitle: z.string(),
        inputValue: z
          .string()
          .min(1, "入力は必須です")
          .regex(/^[0-9]+(\.[0-9]+)?$/, "半角数字のみを入力してください"),
      })
    )
    .min(1, "入力フィールドは必須です"), // Yup.array().required 相当（空配列も弾く）
});

type FormValues = z.infer<typeof schema>;

const Page = () => {
  const [result, setResult] = useState<Result>({ total: 0, items: [] });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { inputs: [{ inputTitle: "", inputValue: "" }] }, // 初期状態で2つの入力ボックスを設定
  });

  const { fields, append, remove } = useFieldArray<FormValues, "inputs", "id">({
    control, // useFormから取得したcontrolを渡す
    name: "inputs", // 配列の名前
  });
  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const items: ResultItem[] = data.inputs.map((item) => ({
      title: item.inputTitle,
      value: Number(item.inputValue),
      percent: 0,
    }));

    const total = items.reduce((acc, cur) => acc + cur.value, 0);
    const itemsWithPercent = items.map((item) => ({
      ...item,
      percent: total === 0 ? 0 : (item.value / total) * 100,
    }));

    setResult({ total, items: itemsWithPercent });
  };

  const addInput = () => {
    // 新しい入力ボックスを追加
    append({ inputTitle: "", inputValue: "" });
  };

  const removeInput = (index: number) => {
    //指定した入力ボックスを削除
    remove(index);
  };

  return (
    <>
      <div className="flex flex-row">
        <div>
          <div className="flex flex-row items-center my-2">
            <label className="font-bold border-b-[3px] border-black inline-block mb-2 mr-2 w-46 ">
              タイトル
            </label>
            <label className="font-bold border-b-[3px] border-black inline-block mb-2 w-36 ">
              値
            </label>
          </div>
          <>
            {fields.map((x, index) => (
              <div key={index} className="flex flex-row items-center my-2">
                <div className="mr-2">
                  <input
                    className="border border-gray-900 border-solid rounded-lg w-46"
                    {...register(`inputs.${index}.inputTitle`)}
                  />
                </div>
                <div>
                  <input
                    className="border border-gray-900 border-solid rounded-lg w-36"
                    {...register(`inputs.${index}.inputValue`)}
                  />
                  {errors.inputs?.[index]?.inputValue?.message && (
                    <p className="text-red-500">半角数字のみです。</p>
                  )}
                </div>
                <button className="ml-2" onClick={() => removeInput(index)}>
                  <MdOutlineCancel size={25} />
                </button>
              </div>
            ))}
            <button
              className="border-2 border-solid border-indigo-500 rounded-lg px-4 mr-2 w-46"
              type="button"
              onClick={addInput}
            >
              入力ボックスを追加
            </button>
            <button
              className="border-2 border-solid border-indigo-500 rounded-lg px-4 w-36"
              type="submit"
              onClick={handleSubmit(onSubmit)} // ここでhandleSubmitを適用
            >
              %に変換
            </button>
          </>
        </div>
        <div>
          {result.items.length > 0 && (
            <div className="ml-6">
              <p className="font-bold">合計: {result.total}</p>
              <ul className="mt-2">
                {result.items.map((item, idx) => (
                  <li key={idx} className="flex flex-row space-x-2">
                    <span className="w-32">{item.title}</span>

                    <span className="w-32">
                      割合: {item.percent.toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;
