import { useNotif } from "../contexts/NotifContext";

// Warna per tipe notifikasi
const typeColor = {
  SUCCESS: "#16a34a",
  ERROR: "#dc2626",
  WARNING: "#d97706",
  INFO: "#2563eb",
};

export function ToastContainer() {
  const { toasts, removeToast } = useNotif();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        zIndex: 9999,
        maxWidth: "360px",
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            background: "white",
            borderLeft: `4px solid ${typeColor[toast.type] || "#6b7280"}`,
            borderRadius: "8px",
            padding: "0.875rem 1rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            animation: "slideIn 0.3s ease",
          }}
        >
          <div>
            <p
              style={{
                fontWeight: 600,
                fontSize: "0.875rem",
                marginBottom: "0.2rem",
              }}
            >
              {toast.title}
            </p>
            <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              marginLeft: "0.5rem",
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}