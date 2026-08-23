"use client";
import { useSidebar } from "./sidebar-context";
import { NaviBar } from "./navi/navibar";

export const Sidebar = () => {
  const { isOpen, close } = useSidebar();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={close}
        />
      )}
      <aside
        className={[
          "fixed top-0 left-0 h-full w-64 bg-zinc-50 z-40 pt-20 overflow-y-auto",
          "transition-transform duration-300 ease-in-out",
          "md:relative md:top-auto md:left-auto md:h-auto md:w-1/5 md:z-auto md:pt-5 md:overflow-visible md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <NaviBar />
      </aside>
    </>
  );
};
