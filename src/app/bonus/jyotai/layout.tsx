const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <h3>jyotaiライブラリのテスト</h3>

      <div className="my-4">
        <p>入力１</p>
        <p>入力２</p>
      </div>
      {children}
    </div>
  );
};

export default Layout;
