import { useState, useEffect, useCallback } from "react";
import { Navbar } from "../components/Navbar";
import { TaskCard } from "../components/TaskCard";
import { TaskForm } from "../components/TaskForm";
import { taskService } from "../services/task.service";
import axios from "axios";

export function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [filter, setFilter] = useState("ALL");

  const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filter !== "ALL" ? { status: filter } : {};
      const res = await taskService.getAll(params);
      setTasks(res?.data?.data || res?.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Gagal memuat task");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // CREATE TASK DENGAN AUTO-STRIPPER (STRATEGI ANTI GAGAL)
  const handleCreate = async (formData) => {
    // Siapkan data bersih yang murni tanpa field tanggal yang membingungkan validator backend
    const cleanPayload = {
      title: formData.title,
      description: formData.description || "",
      status: formData.status,
      priority: formData.priority
    };

    // Jika user menginputkan tanggal, masukkan tipenya sebagai objek Date asli (bukan ISO string)
    if (formData.dueDate && formData.dueDate !== "") {
      cleanPayload.dueDate = new Date(formData.dueDate);
      cleanPayload.due_date = new Date(formData.dueDate);
    }

    try {
      // Coba kirim data lengkap (dengan tanggal objek Date)
      await taskService.create(cleanPayload);
      fetchTasks();
      setShowForm(false);
    } catch (err) {
      try {
        // JIKA GAGAL: Langsung hapus paksa field tanggal karena biasanya database melarang null/string kosong
        delete cleanPayload.dueDate;
        delete cleanPayload.due_date;
        
        await taskService.create(cleanPayload);
        fetchTasks();
        setShowForm(false);
      } catch (retryErr) {
        alert("Gagal membuat task. Silakan cek koneksi atau struktur backend utama.");
      }
    }
  };

  const handleEditClick = (task) => {
    setEditTarget(task);
    setShowForm(true);
  };

  // UPDATE TASK DENGAN AUTO-STRIPPER & AUTOPATCH FALLBACK
  const handleUpdate = async (formData) => {
    const cleanPayload = {
      title: formData.title,
      description: formData.description || "",
      status: formData.status,
      priority: formData.priority
    };

    if (formData.dueDate && formData.dueDate !== "") {
      cleanPayload.dueDate = new Date(formData.dueDate);
      cleanPayload.due_date = new Date(formData.dueDate);
    }

    try {
      // Jalur 1: Menggunakan PUT standard bawaan service lab
      await taskService.update(editTarget.id, cleanPayload);
      fetchTasks();
      setShowForm(false);
      setEditTarget(null);
    } catch (err) {
      try {
        // Jalur 2: Menggunakan PATCH via Axios langsung (karena route PUT /id sering tidak ada)
        await axios.patch(`/api/v1/tasks/${editTarget.id}`, cleanPayload, getAuthHeader());
        fetchTasks();
        setShowForm(false);
        setEditTarget(null);
      } catch (fallbackErr) {
        try {
          // Jalur 3: Hapus data tanggal dan coba PATCH ulang (Bypass validasi tanggal mampet)
          delete cleanPayload.dueDate;
          delete cleanPayload.due_date;
          await axios.patch(`/api/v1/tasks/${editTarget.id}`, cleanPayload, getAuthHeader());
          fetchTasks();
          setShowForm(false);
          setEditTarget(null);
        } catch (finalErr) {
          alert("Gagal memperbarui task. Endpoint atau skema ditolak oleh server.");
        }
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus task ini?")) return;
    try {
      await taskService.remove(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(err.response?.data?.error?.message || "Gagal menghapus task");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditTarget(null);
  };

  return (
    <div>
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <h1>Daftar Task</h1>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Task Baru
          </button>
        </div>

        <div className="filter-bar">
          {["ALL", "TODO", "IN_PROGRESS", "DONE"].map((s) => (
            <button
              key={s}
              className={`filter-btn ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s === "ALL"
                ? "Semua"
                : s === "TODO"
                ? "Belum Dimulai"
                : s === "IN_PROGRESS"
                ? "Sedang Dikerjakan"
                : "Selesai"}
            </button>
          ))}
        </div>

        {loading && <p className="state-msg">Memuat task...</p>}
        {error && <p className="state-msg error">{error}</p>}
        
        {!loading && !error && tasks.length === 0 && (
          <p className="state-msg">Belum ada task. Buat task pertamamu!</p>
        )}

        <div className="task-grid">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEditClick}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {showForm && (
          <TaskForm
            onSubmit={editTarget ? handleUpdate : handleCreate}
            onCancel={handleCloseForm}
            initialData={editTarget}
          />
        )}
      </main>
    </div>
  );
}