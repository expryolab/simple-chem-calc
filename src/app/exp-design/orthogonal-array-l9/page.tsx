"use client";

import Link from "next/link";
import L9Simple from "./components/L9Simple";

const Page = () => {
  return (
    <>
    <h3>L9表</h3>
      <div className="mt-2 text-sm">
        このアプリのL9表の使い方は
        <Link
          href="/exp-design/orthogonal-array-l9/guide"
          className="text-indigo-600 underline hover:text-indigo-800"
        >
          こちら
        </Link>
      </div>
      <L9Simple />
    </>
  );
};

export default Page;
