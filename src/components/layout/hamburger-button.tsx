"use client";
import { useSidebar } from "./sidebar-context";

export const HamburgerButton = () => {
  const { isOpen, toggle } = useSidebar();
  return (
    <button
      className="md:hidden mr-3 p-1 rounded text-zinc-200 hover:text-white hover:bg-gray-600"
      onClick={toggle}
      aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
    >
      <span className="text-2xl leading-none">{isOpen ? "✕" : "☰"}</span>
    </button>
  );
};
