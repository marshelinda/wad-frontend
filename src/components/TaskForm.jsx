import { useForm } from "react-hook-form";
import { useEffect } from "react";

export function TaskForm({ onSubmit, onCancel, initialData = null }) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      let mappedStatus = initialData.status;
      if (typeof mappedStatus === "string") {
        mappedStatus = mappedStatus.toLowerCase();
        if (mappedStatus === "belum dimulai") mappedStatus = "todo";
        if (mappedStatus === "sedang dikerjakan") mappedStatus = "in_progress";
        if (mappedStatus === "selesai") mappedStatus = "done";
      }

      let mappedPriority = initialData.priority;
      if (typeof mappedPriority === "string") {
        mappedPriority = mappedPriority.toLowerCase();
        if (mappedPriority === "rendah") mappedPriority = "low";
        if (mappedPriority === "sedang") mappedPriority = "medium";
        if (mappedPriority === "tinggi") mappedPriority = "high";
      }

      const formattedDate = initialData.dueDate 
        ? new Date(initialData.dueDate).toISOString().split("T")[0] 
        : "";

      reset({
        title: initialData.title || "",
        description: initialData.description || "",
        status: mappedStatus || "todo",
        priority: mappedPriority || "medium",
        dueDate: formattedDate,
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    const payload = {
      title: data.title,
      description: data.description || "",
      status: data.status,
      priority: data.priority,
    };

    if (data.dueDate && data.dueDate.trim() !== "") {
      const dateObj = new Date(data.dueDate);
      payload.dueDate = dateObj.toISOString();
    }

    onSubmit(payload);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>{isEdit ? "Edit Task" : "Buat Task Baru"}</h2>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="form-group">
            <label>Judul *</label>
            <input {...register("title", { required: "Judul wajib diisi" })} />
            {errors.title && <span className="error">{errors.title.message}</span>}
          </div>

          <div className="form-group">
            <label>Deskripsi</label>
            <textarea rows={3} {...register("description")} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select {...register("status")}>
                <option value="todo">Belum Dimulai</option>
                <option value="in_progress">Sedang Dikerjakan</option>
                <option value="done">Selesai</option>
              </select>
            </div>

            <div className="form-group">
              <label>Prioritas</label>
              <select {...register("priority")}>
                <option value="low">Rendah</option>
                <option value="medium">Sedang</option>
                <option value="high">Tinggi</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Tenggat Waktu</label>
            <input type="date" {...register("dueDate")} />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}