import axios from "axios";
import { TokenStore } from "./tokenStore";
// ─── STRATEGI BASE URL UNIVERSAL ────────────────────────────
// Base URL SELALU kosong ("") agar request bersifat relative terhadap origin.
// Penerusan ke backend ditangani oleh:
//   • Lokal/IP  → Vite dev server proxy (vite.config.js)
//   • Domain    → Nginx reverse proxy
// Dengan cara ini, TIDAK ADA hardcoded URL yang bisa menyebabkan
// mixed-content atau salah tujuan di environment manapun.
const API_BASE_URL = "";
// Instance utama untuk semua request API
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});
// ── REQUEST INTERCEPTOR ──────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = TokenStore.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// ── RESPONSE INTERCEPTOR ─────────────────────────────────
let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          orig.headers.Authorization = `Bearer ${token}`;
          return api(orig);
        });
      }
      orig._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = TokenStore.getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token");
        }
        // ✅ FIX: Gunakan `api` instance (bukan global `axios`) agar baseURL konsisten
        const { data } = await api.post("/auth/refresh", { refreshToken });
        // Ekstraksi berlapis untuk kompatibilitas format respons
        const newToken = data?.data?.accessToken || data?.accessToken || data?.data?.token || data?.token;
        if (!newToken) {
          throw new Error("Refresh response missing token");
        }
        // 1. Simpan token baru di local storage/cookie
        TokenStore.setAccessToken(newToken);
        // ── TAMBAHAN DARI HANDBOOK ──────────────────────────────
        // 2. Kirim sinyal global berisi token baru ke SocketContext
        window.dispatchEvent(
          new CustomEvent("token:refreshed", {
            detail: { token: newToken },
          })
        );
        // ────────────────────────────────────────────────────────
        processQueue(null, newToken);
        orig.headers.Authorization = `Bearer ${newToken}`;
        return api(orig);
      } catch (err) {
        processQueue(err, null);
        TokenStore.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
export default api;