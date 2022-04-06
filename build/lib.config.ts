import { defineConfig, LibraryFormats } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import dts from "vite-plugin-dts";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

const formats: LibraryFormats[] = ["es", "cjs"];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    dts({
      outputDir: "dist/dts",
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  mode: "production",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "/src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: path.join(__dirname, "..", "/src/components/textEditor/index.ts"),
      name: "vueComps",
      fileName(format) {
        return "[ext]/[name]-[format].js";
      },
      formats,
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      output: {
        comments: true,
      },
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        chunkFileNames: "js/[name]-[hash]-[format].js",
        assetFileNames: "[ext]/[name]-[hash].[ext]",
        entryFileNames: "[name]-[format].js",
        // {
        //   quill: ["quill"],
        // }
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id.toString().split("node_modules/")[1].split("/")[0].toString();
          }
        },
      },
    },
  },
});
