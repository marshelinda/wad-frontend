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
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      let mappedStatus = initialData.status;
      if (mappedStatus === "Belum Dimulai") mappedStatus = "TODO";
      if (mappedStatus === "Sedang Dikerjakan") mappedStatus = "IN_PROGRESS";
      if (mappedStatus === "Selesai") mappedStatus = "DONE";

      let mappedPriority = initialData.priority;
      if (mappedPriority === "Rendah") mappedPriority = "LOW";
      if (mappedPriority === "Sedang") mappedPriority = "MEDIUM";
      if (mappedPriority === "Tinggi") mappedPriority = "HIGH";

      const formattedDate = initialData.dueDate 
        ? new Date(initialData.dueDate).toISOString().split("T")[0] 
        : "";

      reset({
        title: initialData.title || "",
        description: initialData.description || "",
        status: mappedStatus || "TODO",
        priority: mappedPriority || "MEDIUM",
        dueDate: formattedDate,
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    // Buat payload super aman dengan semua variasi field tanggal
    const payload = {
      title: data.title,
      description: data.description || "",
      status: data.status,     
      priority: data.priority, 
    };

    if (data.dueDate && data.dueDate.trim() !== "") {
      const dateObj = new Date(data.dueDate);
      payload.dueDate = dateObj.toISOString();
      payload.due_date = dateObj.toISOString();
    } else {
      // Jangan set null dulu di sini, biarkan kosong atau nanti dihandle oleh page jika error
      payload.dueDate = "";
      payload.due_date = "";
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
                <option value="TODO">Belum Dimulai</option>
                <option value="IN_PROGRESS">Sedang Dikerjakan</option>
                <option value="DONE">Selesai</option>
              </select>
            </div>

            <div className="form-group">
              <label>Prioritas</label>
              <select {...register("priority")}>
                <option value="LOW">Rendah</option>
                <option value="MEDIUM">Sedang</option>
                <option value="HIGH">Tinggi</option>
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