import axiosInstance from '../lib/axios';

export const reminderService = {
  // Mengambil jadwal pengingat mendatang
  getUpcoming: async () => {
    const response = await axiosInstance.get('/reminders/upcoming');
    return response.data.data; 
  },

  // Menyimpan data pengingat baru
  create: async (reminderData) => {
    const response = await axiosInstance.post('/reminders', reminderData);
    return response.data.data;
  }
};