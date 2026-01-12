const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <h3>このサイトについて</h3>
      {children}
    </div>
  );
};

export default Layout;
