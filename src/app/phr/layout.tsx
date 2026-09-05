const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <h3>重量部(PHR)計算</h3>
      <p>
        基準となる項目の数量を100として、追加した項目の重量部(phr)を計算します。
      </p>
      <div className="my-4">
        <p>基準：基準となる項目名と数量（=100になる基準値）</p>
        <p>項目：追加する材料名</p>
        <p>値：追加する材料の数量</p>
      </div>
      {children}
    </div>
  );
};

export default Layout;
