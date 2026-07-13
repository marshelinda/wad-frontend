import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { TokenStore } from "../lib/tokenStore";
// 🔥 Ambil useNotif dari context asli proyekmu
import { useNotif } from "./NotifContext"; 

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  
  // 🔥 SEKARANG AMAN: Mengambil fungsi addToast langsung dari NotifContext
  const notifContext = useNotif();
  const addToast = notifContext ? notifContext.addToast : null;

  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  // ── LISTENER REFRESH TOKEN ───────────────────────────────
  useEffect(() => {
    const handleTokenRefresh = (e) => {
      if (socketRef.current) {
        socketRef.current.auth = { token: e.detail.token };
        socketRef.current.disconnect().connect();
      }
    };

    window.addEventListener("token:refreshed", handleTokenRefresh);
    return () => {
      window.removeEventListener("token:refreshed", handleTokenRefresh);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

    const socket = io(serverUrl, {
      auth: { token: TokenStore.getAccessToken() },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] Terhubung:", socket.id);
      setIsConnected(true);
    });

    // ── LISTENER PUSH NOTIFICATION (SUDAH SINKRON) ───────────
    socket.on("push-notification", (data) => {
      console.log("[Socket] Menerima Notifikasi Push Terjadwal:", data);
      
      // ✅ EKSEKUSI TOAST: Panggil langsung fungsi addToast bawaan proyekmu
      if (typeof addToast === "function") {
        addToast({
          type: "info",
          title: data.title,
          text: data.message,    // Mengirim properti text sesuai standar template
          message: data.message  // Cadangan jika komponenmu membaca properti 'message'
        });
      }
      
      // Memicu refresh otomatis daftar kartu pengingat di halaman web kamu
      window.dispatchEvent(new CustomEvent("reminder:triggered"));
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Terputus:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Error koneksi:", err.message);
      setIsConnected(false);
    });

    socket.on("users:online", ({ count }) => {
      setOnlineCount(count);
    });

    return () => {
      socket.off("push-notification"); 
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, addToast]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, onlineCount }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocket harus digunakan di dalam SocketProvider");
  }
  return ctx;
}