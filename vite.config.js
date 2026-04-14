/// <reference types="vitest/config" />
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";
const __dirname = dirname(fileURLToPath(import.meta.url));
import { dts } from "rolldown-plugin-dts";

export default defineConfig(({ mode }) => {
  return {
    build: {
      sourcemap: true,
      lib: {
        entry: resolve(__dirname, "index.js"),
        name: "threeToAmmo",
        fileName: "three-to-ammo",
        formats: ["es"]
      },
      rolldownOptions: {
        external: ["three", "@hubs/ammo.js"],
        plugins: [
          dts({
            entry: ["./index.ts"]
          })
        ],
        output: {
          format: "esm",
          globals: {
            three: "three",
            ammo: "@hubs/ammo.js"
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
      browser: {
        enabled: true,
        provider: playwright(),
        // https://vitest.dev/config/browser/playwright
        instances: [{ browser: "chromium" }]
      }
    }
  };
});
