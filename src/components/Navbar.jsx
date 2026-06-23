import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
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
        <Link to="/tasks">Tasks</Link>
        <Link to="/profile">Profil</Link>
        <span className="navbar-user">Halo, {user?.name}</span>
        <button onClick={handleLogout} className="btn-logout">
          Keluar
        </button>
      </div>
    </nav>
  );
}