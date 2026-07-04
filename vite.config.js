import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Semua request ke /api/... diteruskan ke backend
      "/api": {
        target: "http://103.93.135.78:3000",
        changeOrigin: true,
      },
      // Semua request ke /auth/... diteruskan ke backend
      "/auth": {
        target: "http://103.93.135.78:3000",
        changeOrigin: true,
      },
    },
  },
});