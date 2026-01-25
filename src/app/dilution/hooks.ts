import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

type FormValues = z.infer<typeof schema>;

type CalcState = {
  requiredStockVolume: number | null;
  requiredDiluentVolume: number | null;
  calcError: string | null;
};

const initialCalcState: CalcState = {
  requiredStockVolume: null,
  requiredDiluentVolume: null,
  calcError: null,
};

const numericString = z
  .string()
  .min(1, "入力は必須です")
  .regex(/^[0-9]+(\.[0-9]+)?$/, "半角数字のみです");

const schema = z.object({
  desiredVolume: numericString,
  desiredConcentration: numericString,
  stockConcentration: numericString,
});

export const useDilutionForm = () => {
  const [calcState, setCalcState] = useState<CalcState>(initialCalcState);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      desiredVolume: "",
      desiredConcentration: "",
      stockConcentration: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const desiredVolumeNum = parseFloat(data.desiredVolume);
    const desiredConcNum = parseFloat(data.desiredConcentration);
    const stockConcNum = parseFloat(data.stockConcentration);

    if (
      !Number.isFinite(desiredVolumeNum) ||
      !Number.isFinite(desiredConcNum) ||
      !Number.isFinite(stockConcNum)
    ) {
      setCalcState({
        ...initialCalcState,
        calcError: "数値を入力してください。",
      });
      return;
    }

    if (stockConcNum === 0) {
      setCalcState({
        ...initialCalcState,
        calcError: "原液の濃度が0のため計算できません。",
      });
      return;
    }

    if (stockConcNum < desiredConcNum) {
      setCalcState({
        ...initialCalcState,
        calcError: "原液の濃度が希釈後より低いため計算できません。",
      });
      return;
    }

    const required = (desiredConcNum * desiredVolumeNum) / stockConcNum;
    const diluent = desiredVolumeNum - required;

    setCalcState({
      requiredStockVolume: required,
      requiredDiluentVolume: diluent >= 0 ? diluent : null,
      calcError: null,
    });
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    requiredStockVolume: calcState.requiredStockVolume,
    requiredDiluentVolume: calcState.requiredDiluentVolume,
    calcError: calcState.calcError,
  };
};
