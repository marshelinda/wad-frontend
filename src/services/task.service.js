import api from "../lib/axios";

export const taskService = {
  // Ambil semua task (dengan pagination & filter)
  getAll: async (params = {}) => {
    const { data } = await api.get("/tasks", { params });
    return data; // { data: Task[], meta: { total, page, limit } }
  },

  // Ambil satu task berdasarkan ID
  getById: async (id) => {
    const { data } = await api.get(`/tasks/${id}`);
    return data.data;
  },

  // Buat task baru
  create: async (taskData) => {
    const { data } = await api.post("/tasks", taskData);
    return data.data;
  },

  // ─── KEMBALIKAN KE PATCH (KARENA ROUTE BACKEND KAMU ADALAH PATCH) ───
  update: async (id, taskData) => {
    const { data } = await api.patch(`/tasks/${id}`, taskData);
    return data.data;
  },

  // Hapus task
  remove: async (id) => {
    await api.delete(`/tasks/${id}`);
  },
};