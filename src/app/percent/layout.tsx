const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <h3>溶液の濃度(%)を求める</h3>
      <p>溶液の濃度を求めます</p>
      <div className="my-4">
        <p>溶質：溶かすもの(例: 砂糖、塩)</p>
        <p>溶媒：溶かす側の液体(例: 水)</p>
      </div>
      {children}
    </div>
  );
};

export default Layout;
