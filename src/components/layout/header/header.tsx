import Link from "next/link";
import { HamburgerButton } from "@/components/layout/hamburger-button";

export const Header = () => {
  return (
    <div className="flex flex-row w-full px-4 py-4 items-center bg-gray-500">
      <HamburgerButton />
      <h1 className="">
        <Link href="/" className="text-orange-400">
          ちょっと便利な計算ができるサイト
        </Link>
      </h1>
      <div className="ml-auto">
        <Link href="/about" className="text-zinc-200">
          このサイトについて
        </Link>
      </div>
    </div>
  );
};
