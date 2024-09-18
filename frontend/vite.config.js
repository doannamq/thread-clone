import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      exclude: [],
    }),
  ],
  resolve: {
    alias: {
      src: "/src",
    },
  },
  // define: {
  //   global: {},
  // },
  server: {
    port: 3000,
    //Get rid of the CORS error
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
