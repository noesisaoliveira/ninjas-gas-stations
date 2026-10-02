import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: () => "ninjas-gas-stations-card.js",
    },
    rollupOptions: { external: [] },
    target: "es2022",
    outDir: "dist",
    emptyOutDir: true,
  },
  test: { environment: "jsdom" },
});
