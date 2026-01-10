import Link from "next/link";
export const Header = () => {
  return (
    <div className="flex flex-row w-full mx-autoflex py-4 items-end bg-gray-500">
      <h1 className="">
        <Link href="/" className="text-orange-400">
          ちょっと便利な計算ができるサイト
        </Link>
      </h1>
      <h3 className=""></h3>
      <div className="ml-auto">
        <Link href="/about" className="text-zinc-200">
          このサイトについて
        </Link>
      </div>
    </div>
  );
};
