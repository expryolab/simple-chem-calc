const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <h3>実量 → %</h3>
      <p>
        使用量を入力して「%に変換」ボタンをクリックすると、各材料の割合が計算されます。
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
