# E-Arsip Desa Karangasem
**Sistem Informasi Pengarsipan Surat Desa Karangasem**

---

## 🗂️ Struktur Project
```
e-arsip-karangasem/
├── backend/    → Node.js + Express + MySQL
└── frontend/   → React + Vite + Tailwind CSS
```

---

## ⚙️ Cara Setup & Menjalankan

### 1. Siapkan Database MySQL
```sql
mysql -u root -p
CREATE DATABASE e_arsip_karangasem CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 2. Setup Backend
```bash
cd backend
npm install

# Salin dan isi file .env
cp .env .env.local
# Edit DB_HOST, DB_USER, DB_PASSWORD sesuai konfigurasi MySQL Anda

# Jalankan seeder (buat tabel + data awal)
npm run seed

# Jalankan server backend
npm run dev
# → Server berjalan di http://localhost:5000
```

### 3. Setup Frontend
```bash
cd frontend
npm install

# Jalankan frontend
npm run dev
# → App berjalan di http://localhost:5173
```

---

## 🔑 Akun Default

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Operator | `operator` | `operator123` |
| Kepala Desa | `kades` | `kades123` |

---

## 👥 Fitur per Role

### Admin
- Dashboard statistik + grafik 6 bulan
- CRUD Surat Masuk & Surat Keluar (+ upload PDF)
- Manajemen Klasifikasi Surat
- Manajemen Pengguna (aktifkan/nonaktifkan)
- Laporan & grafik per klasifikasi

### Operator
- Dashboard ringkasan harian
- Input Surat Masuk & Surat Keluar
- Buat & kelola Disposisi ke pimpinan
- Filter & pencarian surat

### Pimpinan (Kepala Desa)
- Dashboard lengkap: grafik, ringkasan klasifikasi, aktivitas
- Lihat Surat Masuk & Surat Keluar
- Tindak lanjut Disposisi (Terima / Selesai)

---

## 🛠️ Tech Stack

**Backend**: Node.js, Express.js, Sequelize ORM, MySQL, JWT, Multer  
**Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide React, Axios

---

© 2026 E-Arsip Desa Karangasem
