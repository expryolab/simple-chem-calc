const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <h3>%実量 → 実量</h3>
      <p>
        配合割合を入力して「実量に変換」ボタンをクリックすると、各材料の実量が計算されます。
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
