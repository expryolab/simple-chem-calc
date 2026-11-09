import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  inverseEstimate,
  limitOfDetection,
  limitOfQuantitation,
  linearRegression,
  type LinearFit,
  type Point,
} from "@/utils/regression";

/** 濃度は 0 以上の半角数字 */
const concentrationString = z
  .string()
  .min(1, "入力は必須です")
  .regex(/^[0-9]+(\.[0-9]+)?$/, "半角数字のみです");

/** 応答値はブランク補正で負になりうるのでマイナスを許可 */
const responseString = z
  .string()
  .min(1, "入力は必須です")
  .regex(/^-?[0-9]+(\.[0-9]+)?$/, "半角数字のみです");

const schema = z.object({
  xLabel: z.string(),
  yLabel: z.string(),
  throughOrigin: z.boolean(),
  standards: z
    .array(z.object({ x: concentrationString, y: responseString }))
    .min(2, "標準液は2点以上入力してください"),
  samples: z.array(z.object({ name: z.string(), y: responseString })),
});

type FormValues = z.infer<typeof schema>;

type SampleResult = {
  name: string;
  y: number;
  x: number;
  /** 標準液の濃度範囲外（外挿） */
  outOfRange: boolean;
};

type CalibrationResult = {
  fit: LinearFit;
  standards: Point[];
  samples: SampleResult[];
  lod: number;
  loq: number;
  xLabel: string;
  yLabel: string;
};

type CalcState = {
  result: CalibrationResult | null;
  calcError: string | null;
};

const emptyStandard = { x: "", y: "" };
const emptySample = { name: "", y: "" };

export const useCalibrationForm = () => {
  const [calcState, setCalcState] = useState<CalcState>({
    result: null,
    calcError: null,
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      xLabel: "濃度 (mg/L)",
      yLabel: "吸光度",
      throughOrigin: false,
      standards: Array.from({ length: 5 }, () => ({ ...emptyStandard })),
      samples: [{ ...emptySample }],
    },
  });

  const standardFields = useFieldArray({ control, name: "standards" });
  const sampleFields = useFieldArray({ control, name: "samples" });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const standards: Point[] = data.standards.map((s) => ({
      x: parseFloat(s.x),
      y: parseFloat(s.y),
    }));

    const fitResult = linearRegression(standards, data.throughOrigin);
    if (!fitResult.ok) {
      setCalcState({ result: null, calcError: fitResult.error });
      return;
    }
    const { fit } = fitResult;

    const xs = standards.map((s) => s.x);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);

    const samples: SampleResult[] = data.samples.map((s, i) => {
      const y = parseFloat(s.y);
      const x = inverseEstimate(fit, y);
      return {
        name: s.name.trim() || `試料${i + 1}`,
        y,
        x,
        outOfRange: x < xMin || x > xMax,
      };
    });

    setCalcState({
      result: {
        fit,
        standards,
        samples,
        lod: limitOfDetection(fit),
        loq: limitOfQuantitation(fit),
        xLabel: data.xLabel.trim() || "濃度",
        yLabel: data.yLabel.trim() || "応答",
      },
      calcError: null,
    });
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    standardFields: standardFields.fields,
    appendStandard: () => standardFields.append({ ...emptyStandard }),
    removeStandard: standardFields.remove,
    sampleFields: sampleFields.fields,
    appendSample: () => sampleFields.append({ ...emptySample }),
    removeSample: sampleFields.remove,
    result: calcState.result,
    calcError: calcState.calcError,
  };
};

export type { CalibrationResult, SampleResult };
