import axios from "axios";
import { TokenStore } from "./tokenStore";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

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

        const { data } = await axios.post("/auth/refresh", { refreshToken });
        const newToken = data.data.accessToken;

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