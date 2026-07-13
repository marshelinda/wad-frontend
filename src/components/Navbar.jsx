import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const { isConnected, onlineCount } = useSocket();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/tasks">WAD Task Manager</Link>
      </div>
      
      <div className="navbar-menu">
        {/* ── INDIKATOR REAL-TIME ────────────────────────────── */}
        <div className="rt-indicator" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginRight: "1rem" }}>
          <span
            className="rt-dot"
            style={{ 
              display: "inline-block",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: isConnected ? "#4ade80" : "#f87171" 
            }}
            title={isConnected ? "Real-time aktif" : "Tidak terhubung"}
          />
          <span className="rt-label" style={{ fontSize: "0.85rem", color: "#4b5563" }}>
            {isConnected ? `${onlineCount} online` : "Offline"}
          </span>
        </div>

        {/* ── MENU NAVIGASI UTAMA ────────────────────────────── */}
        <Link to="/tasks">Tasks</Link>
        <Link to="/reminders">Reminders</Link> {/* Tautan menu baru */}
        <Link to="/profile">Profil</Link>
        <span className="navbar-user">Halo, {user?.name}</span>
        <button onClick={handleLogout} className="btn-logout">
          Keluar
        </button>
      </div>
    </nav>
  );
}