import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// globals: false のため自動クリーンアップが効かない。テストごとに DOM を片付ける
afterEach(() => {
  cleanup();
});
