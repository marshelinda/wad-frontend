import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 1. Izinkan domain HTTPS kamu agar tidak terkena "Blocked request"
    host: true,
    allowedHosts: [
      "task-manager.marshelinda.my.id"
    ],
    // 2. Pertahankan proxy andalanmu
    proxy: {
      // Semua request ke /api/... diteruskan ke backend
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      // Semua request ke /auth/... diteruskan ke backend
      "/auth": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      // Proxy untuk socket.io websockets di lokal
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});