const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <h3>ちょうど良い量にする</h3>
      <p>
        料理サイトに記載されている分量を入力して、その割合をそのままに、希望する合計量に調整します。
      </p>
      <div className="my-4">
        <p>項目：材料名</p>
        <p>値：使用量</p>
      </div>
      {children}
    </div>
  );
};

export default Layout;
