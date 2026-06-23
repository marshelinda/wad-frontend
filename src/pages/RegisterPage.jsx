import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function RegisterPage() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  // Pantau nilai password untuk validasi konfirmasi
  const password = watch("password");

  const onSubmit = async ({ name, email, password }) => {
    setApiError(null);
    try {
      await authRegister(name, email, password);
      navigate("/login", { state: { message: "Registrasi berhasil! Silakan login." } });
    } catch (err) {
      const msg = err.response?.data?.error?.message || "Registrasi gagal";
      setApiError(msg);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Buat Akun Baru</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input {...register("name", { required: "Nama wajib diisi" })} />
            {errors.name && <span className="error">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" {...register("email", { required: "Email wajib diisi" })} />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              {...register("password", {
                required: "Password wajib diisi",
                minLength: { value: 8, message: "Minimal 8 karakter" },
              })}
            />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label>Konfirmasi Password</label>
            <input
              type="password"
              {...register("confirm", {
                required: "Konfirmasi password wajib diisi",
                validate: (v) => v === password || "Password tidak cocok",
              })}
            />
            {errors.confirm && <span className="error">{errors.confirm.message}</span>}
          </div>

          {apiError && <div className="alert-error">{apiError}</div>}

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Mendaftar..." : "Daftar"}
          </button>
        </form>

        <p className="auth-link">
          Sudah punya akun? <Link to="/login">Masuk</Link>
        </p>
      </div>
    </div>
  );
}