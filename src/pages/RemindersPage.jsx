import React, { useState, useEffect } from 'react';
import axiosInstance from '../lib/axios';
import { useRealTimeReminders } from '../hooks/useRealTimeReminders';
import { Navbar } from '../components/Navbar';

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [waktu, setWaktu] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const parseResponseData = (resData) => {
    if (Array.isArray(resData)) return resData;
    if (resData && Array.isArray(resData.data)) return resData.data;
    if (resData && Array.isArray(resData.reminders)) return resData.reminders;
    if (resData && Array.isArray(resData.tasks)) return resData.tasks;
    return [];
  };

  const fetchPageData = async () => {
    try {
      const [reminderRes, taskRes] = await Promise.all([
        axiosInstance.get('/api/v1/reminders/upcoming').catch(() => ({ data: [] })),
        axiosInstance.get('/api/v1/tasks').catch(() => ({ data: [] }))
      ]);

      setReminders(parseResponseData(reminderRes.data));
      setTasks(parseResponseData(taskRes.data));
    } catch (err) {
      console.error('Gagal memuat data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  useRealTimeReminders(setReminders, triggerToast);

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTaskId || !waktu) return alert('Silakan isi tugas dan waktu terlebih dahulu');

    try {
      await axiosInstance.post('/api/v1/reminders', {
        taskId: parseInt(selectedTaskId, 10),
        remindAt: new Date(waktu).toISOString()
      });

      setSelectedTaskId('');
      setWaktu('');
      await fetchPageData();
    } catch (err) {
      console.error('Error saat menyimpan:', err);
      
      // MENGAMBIL PESAN ERROR ASLI DARI BACKEND JIKA ADA
      const serverMessage = err.response?.data?.message || 'Koneksi backend terputus.';
      alert(serverMessage); 
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#4b5563' }}>Memuat halaman pengingat...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {toastMessage && (
          <div style={{
            position: 'fixed', bottom: '24px', right: '24px',
            background: '#1e293b', color: '#ffffff', padding: '16px 24px', 
            borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
            zIndex: 9999, borderLeft: '4px solid #3b82f6', display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <span style={{ fontSize: '1.2rem' }}>🔔</span>
            <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{toastMessage}</div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.85rem', color: '#1e293b', fontWeight: '700' }}>⏰ Daftar Reminder Mendatang</h1>
        </div>

        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#1e293b', marginBottom: '20px', fontWeight: '600' }}>Tambah Pengingat Baru</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#475569', fontWeight: '500' }}>Pilih Tugas</label>
              <select 
                value={selectedTaskId} 
                onChange={(e) => setSelectedTaskId(e.target.value)} 
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.95rem', color: '#334155' }}
              >
                <option value="">-- Pilih Tugas Terdaftar --</option>
                {tasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#475569', fontWeight: '500' }}>Waktu Pengingat</label>
              <input 
                type="datetime-local" 
                value={waktu} 
                onChange={(e) => setWaktu(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', color: '#334155' }}
              />
            </div>

            <button 
              type="submit" 
              style={{ padding: '11px 24px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}
            >
              + Simpan Reminder
            </button>
          </form>
        </div>

        <div>
          {reminders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
              <p style={{ fontSize: '1rem' }}>Tidak ada jadwal pengingat aktif untuk saat ini.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {reminders.map((r) => (
                <div 
                  key={r.id} 
                  style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '9999px', fontWeight: '600', border: '1px solid #bfdbfe' }}>
                        ID Task: #{r.taskId}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.2rem', color: '#1e293b', fontWeight: '600', margin: '0' }}>
                      {r.task?.title || "Tugas Utama"}
                    </h4>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #f1f5f9', color: '#475569', fontSize: '0.875rem', fontWeight: '500' }}>
                    <span>⏰ Waktu Notif:</span>
                    <span style={{ color: '#0f172a', fontWeight: '600' }}>
                      {new Date(r.remindAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })} WIB
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}