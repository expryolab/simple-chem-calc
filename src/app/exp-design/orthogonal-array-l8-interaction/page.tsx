"use client";

import Link from "next/link";
import L8Interaction from "./components/L8Interaction";

const Page = () => {
  return (
    <>
      <h3>L8表（交互作用あり）</h3>
      <div className="mt-2 text-sm">
        このアプリのL8表（交互作用あり）の使い方は
        <Link
          href="/exp-design/orthogonal-array-l8-interaction/guide"
          className="text-indigo-600 underline hover:text-indigo-800"
        >
          こちら
        </Link>
      </div>
      <div className="mt-10">
        <L8Interaction />
      </div>
    </>
  );
};

export default Page;
