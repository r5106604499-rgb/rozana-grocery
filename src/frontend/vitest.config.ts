import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Test-only config. The app's own `vite.config.js` is excluded from the
// TypeScript project and carries dev-server plugins (environment injection)
// that are irrelevant to a jsdom run, so the suite gets its own minimal config
// with the same `@` alias the application code relies on.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,
    // The container sets thread-count env vars that conflict with Vitest's
    // defaults; pin the fork pool explicitly so the run is deterministic.
    pool: "forks",
    poolOptions: {
      forks: { minForks: 1, maxForks: 1 },
    },
  },
});
