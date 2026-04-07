/// <reference types="vitest/config" />
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";
const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  return {
    build: {
      lib: {
        entry: resolve(__dirname, "index.js"),
        name: "threeToAmmo",
        fileName: "three-to-ammo"
      },
      rollupOptions: {
        external: ["three"],
        output: {
          globals: {
            three: "three"
          }
        }
      }
    },
    worker: {
      format: "es",
      rollupOptions: {
        output: {
          entryFileNames: "assets/js/[name]-[hash].js"
        }
      }
    },
    test: {
      globals: true,
      browser: {
        enabled: true,
        provider: playwright(),
        // https://vitest.dev/config/browser/playwright
        instances: [{ browser: "chromium" }]
      }
    }
  };
});
