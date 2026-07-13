import api from "../lib/axios";

export const taskService = {
  // Ambil semua task (dengan pagination & filter)
  getAll: async (params = {}) => {
    const { data } = await api.get("/api/v1/tasks", { params });
    return data; // { data: Task[], meta: { total, page, limit } }
  },

  // Ambil satu task berdasarkan ID
  getById: async (id) => {
    const { data } = await api.get(`/api/v1/tasks/${id}`);
    return data.data;
  },

  // Buat task baru
  create: async (taskData) => {
    const { data } = await api.post("/api/v1/tasks", taskData);
    return data.data;
  },

  // ─── KEMBALIKAN KE PATCH (KARENA ROUTE BACKEND KAMU ADALAH PATCH) ───
  update: async (id, taskData) => {
    const { data } = await api.patch(`/api/v1/tasks/${id}`, taskData);
    return data.data;
  },

  // Hapus task
  remove: async (id) => {
    await api.delete(`/api/v1/tasks/${id}`);
  },
};