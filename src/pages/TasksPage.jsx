import { useState, useEffect, useCallback } from "react";
import { Navbar } from "../components/Navbar";
import { TaskCard } from "../components/TaskCard";
import { TaskForm } from "../components/TaskForm";
import { taskService } from "../services/task.service";
import { useRealTimeTasks } from "../hooks/useRealTimeTasks"; // ← TAMBAH: Impor custom hook real-time
import api from "../lib/axios";
import { TokenStore } from "../lib/tokenStore";
import axios from "axios";

export function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [filter, setFilter] = useState("ALL");

  // ── REAL-TIME: Otomatis mendengarkan perubahan data task dari Socket.IO ──
  useRealTimeTasks(setTasks); // ← TAMBAH

  const getAuthHeader = () => {
    const token = TokenStore.getAccessToken();
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filter !== "ALL" ? { status: filter.toLowerCase() } : {};
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

  // ==========================================
  // [CREATE] FUNGSI TAMBAH TASK
  // ==========================================
  const handleCreate = async (formData) => {
    const cleanPayload = {
      title: formData.title,
      description: formData.description || "",
      status: (formData.status || "todo").toLowerCase(),
      priority: (formData.priority || "medium").toLowerCase(),
    };

    try {
      // Jalur utama: Memanfaatkan implementasi service bawaan lab
      const res = await taskService.create(cleanPayload);
      const newTask = res?.data?.data || res?.data || res;

      // Optimistic update: langsung pasang ke state, penyaringan duplikat diurus hook
      if (newTask && newTask.id) {
        setTasks((prev) => [newTask, ...prev]);
      } else {
        fetchTasks();
      }
      setShowForm(false);
    } catch (err) {
      try {
        // Jalur Fallback: Tembak Axios manual langsung menuju endpoint /api/v1/tasks
        const urlAPI = `${api.defaults.baseURL}/tasks`.replace(/\/+/g, '/').replace('http:/', 'http://');
        const resFallback = await axios.post(urlAPI, cleanPayload, getAuthHeader());
        const newTaskFallback = resFallback?.data?.data || resFallback?.data;

        if (newTaskFallback && newTaskFallback.id) {
          setTasks((prev) => [newTaskFallback, ...prev]);
        } else {
          fetchTasks();
        }
        setShowForm(false);
      } catch (finalErr) {
        const errMsg = finalErr.response?.data?.error?.message || finalErr.response?.data?.message || "Data ditolak server.";
        alert(`Gagal Tambah Task!\nRespon Backend: ${errMsg}`);
      }
    }
  };

  const handleEditClick = (task) => {
    setEditTarget(task);
    setShowForm(true);
  };

  // ==========================================
  // [UPDATE] FUNGSI EDIT TASK
  // ==========================================
  const handleUpdate = async (formData) => {
    const cleanPayload = {
      title: formData.title,
      description: formData.description || "",
      status: formData.status?.toLowerCase(),
      priority: formData.priority?.toLowerCase(),
    };

    try {
      // Jalur utama: Memanfaatkan update bawaan service lab
      await taskService.update(editTarget.id, cleanPayload);
      // Catatan: Array state lokal akan otomatis ter-update via onTaskUpdated di hook real-time
      setShowForm(false);
      setEditTarget(null);
    } catch (err) {
      try {
        // Jalur Fallback: Gunakan PATCH manual ke /api/v1/tasks/:id
        const urlPatch = `${api.defaults.baseURL}/tasks/${editTarget.id}`.replace(/\/+/g, '/').replace('http:/', 'http://');
        await axios.patch(urlPatch, cleanPayload, getAuthHeader());
        
        setShowForm(false);
        setEditTarget(null);
      } catch (finalErr) {
        const errMsg = finalErr.response?.data?.error?.message || finalErr.response?.data?.message || "Gagal mengupdate data.";
        alert(`Gagal Update Task!\nRespon Backend: ${errMsg}`);
      }
    }
  };

  // ==========================================
  // [DELETE] FUNGSI HAPUS TASK
  // ==========================================
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus task ini?")) return;
    
    try {
      await taskService.remove(id);
      // Catatan: Komponen akan terhapus via onTaskDeleted di hook real-time, 
      // namun kita biarkan penyaringan lokal ini berjalan sebagai cadangan instan.
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      try {
        const urlDelete = `${api.defaults.baseURL}/tasks/${id}`.replace(/\/+/g, '/').replace('http:/', 'http://');
        await axios.delete(urlDelete, getAuthHeader());
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } catch (errDirect) {
        alert("Gagal menghapus task.");
      }
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