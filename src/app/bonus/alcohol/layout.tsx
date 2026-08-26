import Image from "next/image";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <h3>お酒に含まれるエタノール量</h3>
      <p>エタノール：エチルアルコール。一般的にアルコールといえばこれ！</p>
      <div className="flex flex-col gap-6 mt-4 max-w-4xl md:flex-row">
        <div className="min-w-0 flex-1">{children}</div>
        <div className="shrink-0">
          <Image
            src="/alcohol-1.png"
            alt="お酒のイラスト"
            width={200}
            height={200}
            className="h-auto w-32 md:w-[200px]"
          />
        </div>
      </div>
    </div>
  );
};

export default Layout;
