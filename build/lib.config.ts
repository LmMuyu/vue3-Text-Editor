import { defineConfig, LibraryFormats } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import dts from "vite-plugin-dts";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import ts from "typescript";

const formats: LibraryFormats[] = ["es"];

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: false,
  base: "/dist/",
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    dts({
      outputDir: "dist",
      tsConfigFilePath: path.join(process.cwd(), "/tsconfig.json"),
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    // typescript({
    //   clean: true,
    //   cwd: path.join(process.cwd(), "./dist"),
    //   typescript: ts,
    //   tsconfig: path.join(process.cwd(), "./tsconfig.json"),
    //   verbosity: 3,
    // }),
    terser({
      format: {
        webkit: true,
      },
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
      external: ["vue"],
      output: {
        chunkFileNames: "js/[name]-[hash].js",
        assetFileNames(chunkInfo) {
          if (chunkInfo.name && chunkInfo.name.endsWith(".css")) {
            return "[ext]/[name]_index.css";
          } else {
            return "[ext]/[name]-[hash].[ext]";
          }
        },
        entryFileNames: "[name].js",
        manualChunks(id) {
          if (id.includes("node_modules")) {
            const chunk = id.toString().split("node_modules/")[1].split("/")[0].toString();
            return chunk;
          }
        },
      },
    },
  },
});
