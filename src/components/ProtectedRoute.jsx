import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function ProtectedRoute() {
  const { user, loading } = useAuth();

  // Tampilkan loading saat sedang cek sesi
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "4rem" }}>
        <p>Memuat...</p>
      </div>
    );
  }

  // Jika belum login, redirect ke /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika sudah login, render halaman yang diminta (Outlet = komponen anak)
  return <Outlet />;
}