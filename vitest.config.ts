/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default getViteConfig({
  plugins: [],
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    reporters: ["default", "junit", "json"],
    outputFile: {
      json: "test-results/junit-report.json",
      junit: "test-results/junit-report.xml",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
