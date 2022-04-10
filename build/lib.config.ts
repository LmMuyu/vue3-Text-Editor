import { defineConfig, LibraryFormats } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import dts from "vite-plugin-dts";
// import vitedts from "vite-dts";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { viteStaticCopy } from "vite-plugin-static-copy";
import dynamicImportVars from "@rollup/plugin-dynamic-import-vars";
import gzip from "vite-plugin-compression";
import { terser } from "rollup-plugin-terser";

const formats: LibraryFormats[] = ["es"];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    dts({
      outputDir: "dist/dts",
    }),
    gzip({}),
    terser({
      format: {
        webkit: true,
      },
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    viteStaticCopy({
      targets: [
        {
          src: path.join(process.cwd(), "/package.json"),
          dest: path.join(process.cwd(), "/dist"),
        },
        {
          src: path.join(process.cwd(), "/README.md"),
          dest: path.join(process.cwd(), "/dist"),
        },
      ],
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
      entry: path.join(__dirname, "..", "/src/components/index.ts"),
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
      external: ["vue", "vue-demi"],
      output: {
        chunkFileNames: "js/[name]-[hash]-[format].js",
        assetFileNames(chunkInfo) {
          if (chunkInfo.name.endsWith(".css")) {
            return "[ext]/index.css";
          } else {
            return "[ext]/[name]-[hash].[ext]";
          }
        },
        entryFileNames: "[name].js",
        // {
        //   quill: ["quill"],
        // }
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id.toString().split("node_modules/")[1].split("/")[0].toString();
          }
        },
      },
      plugins: [
        dynamicImportVars({
          exclude: ["node_modules", "dist", "build"],
        }),
      ],
    },
  },
});
