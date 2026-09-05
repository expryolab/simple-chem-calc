"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdOutlineCancel } from "react-icons/md";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

type ResultItem = {
  title: string;
  phr: number;
  percent: number;
};

type Result = {
  baseTitle: string;
  basePercent: number;
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
    .min(1, "入力フィールドは必須です"),
});

type FormValues = z.infer<typeof schema>;

const Page = () => {
  const [baseTitle, setBaseTitle] = useState<string>("");
  const [baseValue, setBaseValue] = useState<string>("");
  const [result, setResult] = useState<Result>({
    baseTitle: "",
    basePercent: 0,
    items: [],
  });
  const [calcError, setCalcError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      inputs: [
        { inputTitle: "", inputValue: "" },
        { inputTitle: "", inputValue: "" },
      ],
    }, // 初期状態で2つの入力ボックスを設定
  });

  const { fields, append, remove } = useFieldArray<FormValues, "inputs", "id">({
    control, // useFormから取得したcontrolを渡す
    name: "inputs", // 配列の名前
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const baseNumeric = Number(baseValue);

    if (baseTitle.trim() === "" || baseValue.trim() === "") {
      setCalcError("基準の項目名と数量を入力してください。");
      setResult({ baseTitle: "", basePercent: 0, items: [] });
      return;
    }

    if (isNaN(baseNumeric) || baseNumeric === 0) {
      setCalcError("基準の数量には0以外の数値を入力してください。");
      setResult({ baseTitle: "", basePercent: 0, items: [] });
      return;
    }

    setCalcError(null);

    const itemValues = data.inputs.map((item) => Number(item.inputValue));
    const total = baseNumeric + itemValues.reduce((acc, v) => acc + v, 0);

    const items: ResultItem[] = data.inputs.map((item, idx) => ({
      title: item.inputTitle,
      phr: (itemValues[idx] / baseNumeric) * 100,
      percent: (itemValues[idx] / total) * 100,
    }));

    setResult({ baseTitle, basePercent: (baseNumeric / total) * 100, items });
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
      <div className="flex flex-col md:flex-row">
        <div>
          <div className="mb-4">
            <label className="font-bold border-b-[3px] border-black inline-block mb-2 w-46 mr-2">
              基準の項目名
            </label>
            <input
              className="border border-gray-900 border-solid rounded-lg w-46"
              value={baseTitle}
              onChange={(e) => setBaseTitle(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="font-bold border-b-[3px] border-black inline-block mb-2 w-46 mr-2">
              基準の数量(=100)
            </label>
            <input
              className="border border-gray-900 border-solid rounded-lg w-36"
              value={baseValue}
              onChange={(e) => setBaseValue(e.target.value)}
            />
          </div>
          <div className="flex flex-row items-center my-2">
            <label className="font-bold border-b-[3px] border-black inline-block mb-2 mr-2 w-46 ">
              項目
            </label>
            <label className="font-bold border-b-[3px] border-black inline-block mb-2 w-36 ">
              数量
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
              phrを計算
            </button>
          </>
        </div>
        <div>
          {calcError && (
            <p className="text-red-500 mt-6 md:mt-0 md:ml-6">{calcError}</p>
          )}
          {!calcError && result.items.length > 0 && (
            <div className="mt-6 md:mt-0 md:ml-6 bg-indigo-50 rounded-lg p-4">
              <p className="font-bold text-lg">
                基準: {result.baseTitle} = 100
              </p>
              <ul className="mt-2 text-lg space-y-1">
                <li className="flex flex-row space-x-2">
                  <span className="w-20 md:w-32">{result.baseTitle}</span>
                  <span className="w-24 md:w-32">phr: 100.0</span>
                  <span className="w-24 md:w-32">
                    {result.basePercent.toFixed(1)}%
                  </span>
                </li>
                {result.items.map((item, idx) => (
                  <li key={idx} className="flex flex-row space-x-2">
                    <span className="w-20 md:w-32">{item.title}</span>
                    <span className="w-24 md:w-32">
                      phr: {item.phr.toFixed(1)}
                    </span>
                    <span className="w-24 md:w-32">
                      {item.percent.toFixed(1)}%
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
