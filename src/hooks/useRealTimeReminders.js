import { useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';

export const useRealTimeReminders = (setReminders, showToast) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listener saat ada reminder baru dibuat (Live Update)
    socket.on('reminder:created', (data) => {
      setReminders((prev) => [data.reminder, ...prev]);
    });

    // Listener push notification saat jatuh tempo
    socket.on('notification', (data) => {
      if (data.type === 'reminder') {
        // Tampilkan toast ke UI (sesuai spesifikasi Bagian D & E Week 9)
        showToast(data.message);
        
        // Opsional: Hapus dari daftar "mendatang" karena sudah lewat/jatuh tempo
        setReminders((prev) => prev.filter((r) => r.id !== data.data.id));
      }
    });

    // Cleanup listener demi menghindari memory leak
    return () => {
      socket.off('reminder:created');
      socket.off('notification');
    };
  }, [socket, setReminders, showToast]);
};