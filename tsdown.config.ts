import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./index.ts"],
  sourcemap: true,
  minify: true,
  // inputOptions: {
  //   external: ["@hubs/ammo.js"],
  // },
  // outputOptions: {
  //   globals: {
  //     "@hubs/ammo.js": "Ammo",
  //   },
  // },
});
