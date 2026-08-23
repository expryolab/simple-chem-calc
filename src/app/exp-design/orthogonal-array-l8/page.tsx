"use client";

import Link from "next/link";
import L8Simple from "./components/L8Simple";

const Page = () => {
  return (
    <>
      <h3>L8表</h3>
      <div className="mt-2 text-sm">
        このアプリのL8表の使い方は
        <Link
          href="/exp-design/orthogonal-array-l8/guide"
          className="text-indigo-600 underline hover:text-indigo-800"
        >
          こちら
        </Link>
      </div>
      <div className="mt-10">
        <L8Simple />
      </div>
    </>
  );
};

export default Page;
