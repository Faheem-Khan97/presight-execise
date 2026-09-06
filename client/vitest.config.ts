import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    // @testing-library/react's automatic between-test DOM cleanup only registers itself when it
    // detects a global `afterEach` — without this, unmounted components' markup leaks across
    // tests in the same file.
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
