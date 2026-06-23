import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ email, password }) => {
    setApiError(null);
    try {
      await login(email, password);
      navigate("/tasks");
    } catch (err) {
      const msg = err.response?.data?.error?.message || "Login gagal";
      setApiError(msg);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Masuk ke Akun</h1>
        <p>Web Advanced Development — Task Manager</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="email@contoh.com"
              {...register("email", {
                required: "Email wajib diisi",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Format email tidak valid",
                },
              })}
            />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Minimal 8 karakter"
              {...register("password", {
                required: "Password wajib diisi",
                minLength: { value: 8, message: "Minimal 8 karakter" },
              })}
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          {apiError && <div className="alert-error">{apiError}</div>}

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Masuk..." : "Masuk"}
          </button>
        </form>

        <p className="auth-link">
          Belum punya akun? <Link to="/register">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
}