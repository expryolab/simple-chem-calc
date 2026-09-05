const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <h3>モル濃度計算</h3>
      <p>質量・分子量・溶液量からモル濃度(mol/L)を求めます</p>
      {children}
    </div>
  );
};

export default Layout;
