import path from "path";
import { terser } from "rollup-plugin-terser";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist/src/worker",
    lib: {
      entry: path.join(__dirname, "..", "src/worker/fetchEmoji.js"),
      fileName: "fetchEmoji",
      formats: ["cjs"],
    },
  },
  plugins: [
    terser({
      format: {
        webkit: true,
      },
    }),
  ],
  mode: "production",
});
