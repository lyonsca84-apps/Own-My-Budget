import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // feature-gates.test.ts uses Jest-style global describe/it/expect
    // rather than importing them from "vitest" explicitly.
    globals: true,
    environment: "node",
  },
});
