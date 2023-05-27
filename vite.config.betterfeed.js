import packInfo from "./package.json";

/** @type {import('vite').UserConfig} */
export default {
  publicDir: false,
  define: {
    "process.env.BF2_VERSION": JSON.stringify("v" + packInfo.version),
  },
  build: {
    outDir: "build",
    emptyOutDir: false,
    lib: {
      entry: "./src/js/better-feed.js",
      name: "betterfeed",
      fileName: "betterfeed",
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        entryFileNames: "better-feed.min.js",
      },
    },
  },
};
