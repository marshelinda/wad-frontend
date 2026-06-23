export function TaskCard({ task, onEdit, onDelete }) {
  // Mapping status ke label dan warna
  const statusConfig = {
    TODO: { label: "Belum Dimulai", color: "#6b7280" },
    IN_PROGRESS: { label: "Sedang Dikerjakan", color: "#2563eb" },
    DONE: { label: "Selesai", color: "#16a34a" },
  };

  const priorityConfig = {
    LOW: { label: "Rendah", color: "#6b7280" },
    MEDIUM: { label: "Sedang", color: "#d97706" },
    HIGH: { label: "Tinggi", color: "#dc2626" },
  };

  const s = statusConfig[task.status] || statusConfig.TODO;
  const p = priorityConfig[task.priority] || priorityConfig.MEDIUM;

  return (
    <div className="task-card">
      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-actions">
          <button onClick={() => onEdit(task)} className="btn-icon">
            ✏
          </button>
          <button onClick={() => onDelete(task.id)} className="btn-icon">
            🗑
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-card-footer">
        <span className="badge" style={{ backgroundColor: s.color }}>
          {s.label}
        </span>
        
        <span 
          className="badge-outline" 
          style={{ borderColor: p.color, color: p.color }}
        >
          {p.label}
        </span>

        {task.dueDate && (
          <span className="due-date">
            📅 {new Date(task.dueDate).toLocaleDateString("id-ID")}
          </span>
        )}
      </div>
    </div>
  );
}