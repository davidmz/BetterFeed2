/** @type {import('vite').UserConfig} */
export default {
  publicDir: false,
  build: {
    outDir: "build",
    emptyOutDir: false,
    lib: {
      entry: "./src/js/settings.js",
      name: "settings",
      fileName: "settings",
      formats: ["es"],
    },
  },
};
