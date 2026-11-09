import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "検量線作成",
  description:
    "標準液の濃度と測定値から最小二乗法で検量線を作成し、試料の濃度を逆算します",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <h3>検量線作成</h3>
      <p>標準液の測定値から検量線を引き、試料の濃度を求めます</p>
      {children}
    </div>
  );
};

export default Layout;
