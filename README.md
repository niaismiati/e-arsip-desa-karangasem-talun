# E-Arsip Desa Karangasem - Talun

Sistem pengelolaan arsip digital untuk Balai Desa Karangasem, Talun. Mengelola surat masuk, surat keluar, disposisi, dan laporan secara digital.

## Fitur Utama

- **Manajemen Surat Masuk** - Pencatatan dan pencarian surat masuk
- **Manajemen Surat Keluar** - Pembuatan dan pengelolaan surat keluar
- **Disposisi Surat** - Alur disposisi dari operator ke Kepala Desa
- **Laporan & Statistik** - Rekap laporan per klasifikasi dan grafik bulanan
- **Multi User** - Admin, Operator, dan Kepala Desa (Kades)

## Role & Akses

| Role | Keterangan | Akses |
|------|------------|-------|
| Admin | Pengelola sistem | Kelola user, klasifikasi, dashboard |
| Operator | Staf desa | Input surat masuk/keluar, buat disposisi |
| Kepala Desa | Pimpinan | Review & approve/reject disposisi |

## Tech Stack

**Frontend**: React 18, TypeScript, Vite, Tailwind CSS 4, Radix UI, Recharts, React Router 7

**Backend**: Node.js, Express, Sequelize ORM

**Database**: MySQL (XAMPP) / SQLite

## Instalasi

### Prasyarat

- [Node.js](https://nodejs.org/) v18+
- [XAMPP](https://www.apachefriends.org/) (untuk MySQL) atau gunakan SQLite

### Langkah Instalasi

```bash
# Clone repository
git clone https://github.com/niaismiati/e-arsip-desa-karangasem-talun.git
cd e-arsip-desa-karangasem-talun

# Install dependencies frontend
npm install

# Install dependencies backend
cd e-arsip-desa
npm install
cd ..
```

### Konfigurasi Database

Buka file `e-arsip-desa/.env` dan sesuaikan:

```env
# MySQL (XAMPP)
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=e_arsip_karangasem

# Atau gunakan SQLite (hapus/skosongkan DB_TYPE)
# DB_TYPE=
```

Buat database di phpMyAdmin:

```sql
CREATE DATABASE e_arsip_karangasem;
```

### Menjalankan Aplikasi

```bash
# Jalankan server backend + frontend sekaligus
npm start

# Atau jalankan terpisah:
# Backend (port 5000)
npm run server:dev

# Frontend (port 5173)
npm run dev
```

Aplikasi dapat diakses di:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Akun Default

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@karangasem.desa.id | password123 |
| Operator | operator@karangasem.desa.id | password123 |
| Kepala Desa | kades@karangasem.desa.id | password123 |

## Struktur Proyek

```
e-arsip-desa-karangasem-talun/
├── src/                        # Frontend React
│   ├── app/                    # Components & pages
│   ├── hooks/                  # Custom hooks
│   ├── pages/                  # Page components
│   ├── services/               # API services
│   └── styles/                 # CSS styles
├── e-arsip-desa/               # Backend Express
│   ├── config/                 # Database config
│   ├── controllers/            # Route controllers
│   ├── middleware/             # Auth & role middleware
│   ├── routes/                 # API routes
│   ├── scripts/                # Seed & migration
│   ├── utils/                  # Helper functions
│   ├── server.js               # Entry point
│   └── .env                    # Environment config
├── public/                     # Static assets
├── package.json                # Frontend dependencies
└── vite.config.ts              # Vite config
```

## API Endpoints

| Endpoint | Method | Role | Keterangan |
|----------|--------|------|------------|
| `/api/auth/login` | POST | Public | Login |
| `/api/auth/logout` | POST | All | Logout |
| `/api/users` | GET/POST | Admin | Kelola user |
| `/api/klasifikasi` | GET/POST | Admin | Kelola klasifikasi |
| `/api/surat-masuk` | GET/POST | Admin, Operator | Surat masuk |
| `/api/surat-keluar` | GET/POST | Admin, Operator | Surat keluar |
| `/api/disposisi` | GET/POST | Admin, Operator, Kades | Disposisi |
| `/api/disposisi/:id/approve` | PUT | Kades | Setujui disposisi |
| `/api/disposisi/:id/reject` | PUT | Kades | Tolak disposisi |
| `/api/laporan/rekap` | GET | All | Laporan rekap |
| `/api/laporan/statistik` | GET | All | Data statistik |

## Backup Database

**Via phpMyAdmin:**
1. Buka http://localhost/phpmyadmin
2. Pilih database `e_arsip_karangasem`
3. Klik **Export** > **Quick** > **Go**

**Via Command Line:**
```bash
"C:\xampp\mysql\bin\mysqldump" -u root e_arsip_karangasem > backup_%date:~-4%%date:~4,2%%date:~7,2%.sql
```

**Restore:**
```bash
"C:\xampp\mysql\bin\mysql" -u root e_arsip_karangasem < backup_file.sql
```

## License

Private - Balai Desa Karangasem


### Nama : Nia Ismiati
### NIM : 101230004
### Kelas : TF23B
