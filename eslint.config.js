// Flat config (ESLint 9+/10). Two profiles: browser React code under src/,
// and Node server code everywhere else (server.ts, middleware.ts,
// firebaseAdmin.ts, resources.ts, services/**, vite.config.ts).

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "build/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    files: [
      "server.ts",
      "middleware.ts",
      "firebaseAdmin.ts",
      "resources.ts",
      "server-only.ts",
      "vite.config.ts",
      "services/**/*.ts",
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    rules: {
      // Service-layer boundary code intentionally casts loosely-typed
      // Firestore SDK reads at the module boundary (see services/*.ts) --
      // downstream code stays strictly typed. Not a blanket allowance.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  }
);
