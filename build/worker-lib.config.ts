import path from "path";
import { defineConfig } from "vite";
import movedtsfile from "./plugin/vite-plugin-dts-file";

export default defineConfig({
  plugins: [
    {
      name: "vite-buildend",
      closeBundle() {
        movedtsfile(path.join(__dirname, "../", "/dist/dts"), path.join(__dirname, "../", "/dist"));
      },
    },
  ],
  build: {
    outDir: "dist/src/worker",
    lib: {
      entry: path.join(__dirname, "..", "src/worker/fetchEmoji.js"),
      fileName: "fetchEmoji",
      formats: ["cjs"],
    },
  },
  mode: "production",
});
