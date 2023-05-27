import fs from "fs";
import banner from "vite-plugin-banner";
import packInfo from "./package.json";

const head = fs
  .readFileSync("./src/js/user-js-headers.txt", "utf8")
  .replace("<VERSION>", packInfo.version);

/** @type {import('vite').UserConfig} */
export default {
  plugins: [
    banner({
      outDir: "build",
      content: head,
      verify: false,
    }),
  ],
  publicDir: false,
  build: {
    outDir: "build",
    emptyOutDir: false,
    lib: {
      entry: "./src/js/user-js-loader.js",
      name: "userscript",
      fileName: "userscript",
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        entryFileNames: "better-feed.user.js",
      },
    },
  },
};
