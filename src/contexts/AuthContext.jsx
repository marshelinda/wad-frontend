import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { TokenStore } from "../lib/tokenStore";

// Mengatur base URL ke API Express Backend secara akurat
axios.defaults.baseURL = "http://localhost:3000"; 
// Memastikan cookies/headers kredensial dikirim dengan benar jika backend membutuhkannya
axios.defaults.withCredentials = false; 

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Memulihkan sesi pengguna saat aplikasi dimuat pertama kali
  useEffect(() => {
    const restore = async () => {
      if (!TokenStore.isLoggedIn()) {
        setLoading(false);
        return;
      }

      try {
        const rfToken = TokenStore.getRefreshToken();
        const { data } = await axios.post("/auth/refresh", { refreshToken: rfToken });
        
        const token = data?.data?.accessToken || data?.accessToken || data?.data?.token || data?.token;
        
        if (token) {
          TokenStore.setAccessToken(token);
          const { data: me } = await axios.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const finalUser = me?.data || me?.user || me;
          setUser(finalUser);
        } else {
          TokenStore.clear();
        }
      } catch (err) {
        console.error("Gagal memulihkan sesi:", err);
        TokenStore.clear();
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, []);

  // ─── FUNGSI LOGIN UTAMA (FINAL & ULTRA-KEBAL) ───────────────────
  const login = useCallback(async (email, password) => {
    // 1. Kirim data login ke backend dengan header eksplisit untuk menghindari preflight murni yang ketat
    const response = await axios.post("/auth/login", 
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );
    
    const responseData = response.data;

    // 2. Ekstraksi berlapis (Mencakup berbagai format respons backend)
    const accessToken = responseData?.data?.accessToken || responseData?.accessToken || responseData?.data?.token || responseData?.token;
    const refreshToken = responseData?.data?.refreshToken || responseData?.refreshToken;
    const userData = responseData?.data?.user || responseData?.data || responseData?.user || responseData?.data?.userData || responseData?.userData;

    // 3. Validasi kebenaran token
    if (!accessToken) {
      console.error("Struktur respons backend tidak cocok:", responseData);
      throw new Error("Token tidak ditemukan dalam respons server.");
    }

    // 4. Simpan ke TokenStore dan nyalakan State User aktif
    TokenStore.setAccessToken(accessToken);
    if (refreshToken) {
      TokenStore.setRefreshToken(refreshToken);
    }
    
    // Fallback jika objek user kosong dari backend agar state tidak bernilai null
    setUser(userData || { email, role: "USER" }); 
  }, []);

  const register = useCallback(async (name, email, password) => {
    await axios.post("/auth/register", { name, email, password });
  }, []);

  const logout = useCallback(async () => {
    try {
      const rfToken = TokenStore.getRefreshToken();
      await axios.post(
        "/auth/logout",
        { refreshToken: rfToken },
        {
          headers: { Authorization: `Bearer ${TokenStore.getAccessToken()}` },
        }
      );
    } catch {
      /* abaikan error logout */
    }
    
    TokenStore.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return ctx;
}