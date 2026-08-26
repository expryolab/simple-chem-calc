import Link from "next/link";
import { HamburgerButton } from "@/components/layout/hamburger-button";

export const Header = () => {
  return (
    <div className="flex flex-row w-full px-4 py-3 md:py-4 items-center bg-gray-500">
      <HamburgerButton />
      <h1 className="min-w-0 flex-1">
        <Link
          href="/"
          className="block truncate text-base leading-tight text-orange-400 md:text-4xl md:leading-10 md:whitespace-normal md:overflow-visible"
        >
          ちょっと便利な計算ができるサイト
        </Link>
      </h1>
      <div className="ml-auto shrink-0">
        <Link
          href="/about"
          className="whitespace-nowrap text-xs text-zinc-200 md:text-base"
        >
          このサイトについて
        </Link>
      </div>
    </div>
  );
};
