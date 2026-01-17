import { FaTwitter } from "react-icons/fa";

const Page = () => {
  return (
    <div className="w-315 mx-auto mt-2">
      <p className="text-lg font-medium">サイトの説明</p>
      <p className="">このサイトは、実験で使いそうな計算を行うサイトです。</p>
      <p className="">
        計算は全てjavascriptで行なっているため、サーバーへの保存はありません。
      </p>
      <p className="">サイト運営者の学習がメインです。ご利用は自由です。</p>
      <p className="">
        もしお役に立ちそうなことがあれば、ぜひ一声お願いします。
      </p>
      <p className="">日々カイゼンして、よりよりサイトを目指します。</p>
      <p className="flex flex-row items-center">
        X
        <a
          href="https://twitter.com/ryo_exp_adv"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaTwitter className="text-indigo-500" />
        </a>
      </p>
    </div>
  );
};

export default Page;
