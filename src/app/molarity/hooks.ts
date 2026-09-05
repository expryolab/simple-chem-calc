import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

type FormValues = z.infer<typeof schema>;

type CalcState = {
  molarConcentration: number | null;
  calcError: string | null;
};

const initialCalcState: CalcState = {
  molarConcentration: null,
  calcError: null,
};

const numericString = z
  .string()
  .min(1, "入力は必須です")
  .regex(/^[0-9]+(\.[0-9]+)?$/, "半角数字のみです");

const schema = z.object({
  mass: numericString,
  molecularWeight: numericString,
  volume: numericString,
});

export const useMolarityForm = () => {
  const [calcState, setCalcState] = useState<CalcState>(initialCalcState);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mass: "",
      molecularWeight: "",
      volume: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const massNum = parseFloat(data.mass);
    const mwNum = parseFloat(data.molecularWeight);
    const volumeNum = parseFloat(data.volume);

    if (
      !Number.isFinite(massNum) ||
      !Number.isFinite(mwNum) ||
      !Number.isFinite(volumeNum)
    ) {
      setCalcState({
        ...initialCalcState,
        calcError: "数値を入力してください。",
      });
      return;
    }

    if (mwNum === 0) {
      setCalcState({
        ...initialCalcState,
        calcError: "分子量が0のため計算できません。",
      });
      return;
    }

    if (volumeNum === 0) {
      setCalcState({
        ...initialCalcState,
        calcError: "溶液量が0のため計算できません。",
      });
      return;
    }

    const molarConcentration = massNum / mwNum / (volumeNum / 1000);

    setCalcState({
      molarConcentration,
      calcError: null,
    });
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    molarConcentration: calcState.molarConcentration,
    calcError: calcState.calcError,
  };
};
