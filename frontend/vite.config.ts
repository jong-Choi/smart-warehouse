import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    visualizer({
      open: true, // 빌드 후 자동으로 브라우저 열기
      filename: "dist/stats.html",
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  css: {
    postcss: "./postcss.config.js",
  },
});
