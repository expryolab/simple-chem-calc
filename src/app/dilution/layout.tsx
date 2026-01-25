const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <h3>希釈計算</h3>
      <p>溶液を希釈したい時その必要量が求められます</p>
      {children}
    </div>
  );
};

export default Layout;
