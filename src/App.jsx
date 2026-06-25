import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { NotifProvider } from "./contexts/NotifContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ToastContainer } from "./components/ToastContainer";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { TasksPage } from "./pages/TasksPage";
import { ProfilePage } from "./pages/ProfilePage";

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotifProvider>
          <BrowserRouter>
            <Routes>
              {/* Halaman Publik */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Halaman Terproteksi (Wajib Login) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Navigate to="/tasks" replace />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Fallback Rute Tidak Dikenal */}
              <Route path="*" element={<Navigate to="/tasks" replace />} />
            </Routes>

            {/* Toast selalu tampil melayang di semua halaman */}
            <ToastContainer />
          </BrowserRouter>
        </NotifProvider>
      </SocketProvider>
    </AuthProvider>
  );
}