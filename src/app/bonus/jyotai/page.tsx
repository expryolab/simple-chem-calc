"use client";

import { useAtom } from "jotai";
import { countAtom } from "@/atoms/countAtom";

export default function Counter() {
  const [count, setCount] = useAtom(countAtom);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </div>
  );
}
