# WAD Frontend Client

React · Vite · React Router · Axios · Socket.IO

Aplikasi single-page React + Vite untuk manajemen tugas. Frontend ini terhubung ke backend REST API dan mendukung autentikasi JWT, proteksi rute, operasi CRUD tugas, serta sinkronisasi real-time dengan Socket.IO.

## Deskripsi Singkat

Front-end ini dibangun untuk mendukung fitur task management sebagai bagian dari aplikasi WAD Task Manager. Arsitekturnya memisahkan:
- state autentikasi global
- koneksi WebSocket real-time
- mekanisme notifikasi toast
- service layer untuk komunikasi API

Semua komponen dirancang agar dapat bekerja sebagai satu aplikasi yang konsisten dan mudah dimodifikasi.

## Persyaratan

- Node.js v20 atau lebih baru
- npm v10 atau lebih baru
- MySQL / XAMPP untuk database backend
- Backend berjalan di `http://localhost:3000`

## Variabel Lingkungan

Backend menggunakan `.env.example` dengan variabel berikut:

- `PORT`
- `DATABASE_URL`
- `ALLOWED_ORIGINS`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`

Frontend menggunakan proxy Vite untuk meneruskan `/api` dan `/auth` ke backend.

## Instalasi & Menjalankan Aplikasi

```bash
cd wad-frontend
npm install
npm run dev
```

Buka alamat yang muncul, biasanya:

```text
http://localhost:5173
```

## Struktur Proyek

```
wad-frontend
├─ public/                              # Aset statis browser
├─ src/
│  ├─ components/                       # UI dan tampilan komponen
│  │  ├─ Navbar.jsx                     # Navbar dengan status online
│  │  ├─ ProtectedRoute.jsx             # Guard untuk rute terproteksi
│  │  ├─ TaskCard.jsx                   # Tampilan kartu task
│  │  ├─ TaskForm.jsx                   # Form untuk create/edit task
│  │  └─ ToastContainer.jsx             # Presentasi toast notification
│  ├─ contexts/                         # Provider konteks global
│  │  ├─ AuthContext.jsx                # Login, logout, restore session
│  │  ├─ NotifContext.jsx               # Notifikasi toast global
│  │  └─ SocketContext.jsx              # Koneksi Socket.IO dan online count
│  ├─ hooks/                            # Custom hook
│  │  └─ useRealTimeTasks.js            # Listener event Socket untuk task
│  ├─ lib/                              # Utility dan konfigurasi
│  │  ├─ axios.js                       # Axios instance dengan interceptor JWT
│  │  └─ tokenStore.js                  # Penyimpanan token
│  ├─ pages/                            # Halaman aplikasi
│  │  ├─ LoginPage.jsx                  # Halaman login
│  │  ├─ ProfilePage.jsx                # Halaman profil user
│  │  ├─ RegisterPage.jsx               # Halaman registrasi
│  │  └─ TasksPage.jsx                  # Halaman dashboard task
│  ├─ services/                         # Abstraksi layer API
│  │  └─ task.service.js                # Service endpoint task
│  ├─ index.css                         # Style global
│  └─ main.jsx                          # Entry point aplikasi
```

## Arsitektur & Teknologi Utama

| Kategori | Teknologi | Fungsi |
| --- | --- | --- |
| Build Tool | Vite | Bundling dan development server |
| UI | React 19 | Komponen antarmuka deklaratif |
| Routing | React Router v7 | Navigasi halaman dan proteksi |
| Form | React Hook Form | Validasi dan input form |
| HTTP | Axios | Komunikasi API dengan interceptor |
| Real-Time | Socket.IO Client 4.x | Sinkronisasi event waktu nyata |
| State | Context API | Manajemen auth dan notifikasi |

## Backend & Prisma

Jalankan backend di folder `wad-capstone`:

```bash
cd wad-capstone
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Jika perlu migrasi development:

```bash
npx prisma migrate dev --name init
npm run db:seed
```

## Contoh Akun Tes

- Pengguna biasa:
  - Email: `budi@example.com`
  - Password: `password123`
- Administrator:
  - Email: `admin@example.com`
  - Password: `password123`
