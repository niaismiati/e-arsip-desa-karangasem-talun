# 📁 PROMPT LENGKAP: E-ARSIP DESA KARANGASEM
## Sistem Informasi Pengarsipan Surat Desa — Full Stack Web App

---

## 🎯 OVERVIEW PROJECT

Buat sistem web **E-Arsip Desa Karangasem** — aplikasi manajemen arsip surat desa berbasis web dengan 3 role pengguna: **Administrator**, **Operator**, dan **Kepala Desa (Pimpinan)**. Sistem ini mengelola surat masuk, surat keluar, disposisi, klasifikasi arsip, dan laporan.

---

## 🗂️ STRUKTUR FOLDER PROJECT

```
e-arsip-karangasem/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── multer.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── suratMasukController.js
│   │   │   ├── suratKeluarController.js
│   │   │   ├── disposisiController.js
│   │   │   ├── klasifikasiController.js
│   │   │   ├── laporanController.js
│   │   │   └── penggunaController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── roleCheck.js
│   │   │   └── upload.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── SuratMasuk.js
│   │   │   ├── SuratKeluar.js
│   │   │   ├── Disposisi.js
│   │   │   └── Klasifikasi.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── suratMasuk.js
│   │   │   ├── suratKeluar.js
│   │   │   ├── disposisi.js
│   │   │   ├── klasifikasi.js
│   │   │   ├── laporan.js
│   │   │   └── pengguna.js
│   │   └── app.js
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── favicon.ico
    ├── src/
    │   ├── assets/
    │   │   └── logo-karangasem.png
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Sidebar.jsx
    │   │   │   ├── Navbar.jsx
    │   │   │   └── Layout.jsx
    │   │   ├── common/
    │   │   │   ├── StatCard.jsx
    │   │   │   ├── DataTable.jsx
    │   │   │   ├── Modal.jsx
    │   │   │   ├── Badge.jsx
    │   │   │   └── Pagination.jsx
    │   │   └── charts/
    │   │       └── LineChart.jsx
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   └── Login.jsx
    │   │   ├── admin/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── SuratMasuk.jsx
    │   │   │   ├── SuratKeluar.jsx
    │   │   │   ├── Klasifikasi.jsx
    │   │   │   ├── Laporan.jsx
    │   │   │   └── Pengguna.jsx
    │   │   ├── operator/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── SuratMasuk.jsx
    │   │   │   ├── SuratKeluar.jsx
    │   │   │   └── Disposisi.jsx
    │   │   └── pimpinan/
    │   │       ├── Dashboard.jsx
    │   │       ├── SuratMasuk.jsx
    │   │       ├── SuratKeluar.jsx
    │   │       └── DisposisiSaya.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   └── useApi.js
    │   ├── services/
    │   │   ├── api.js
    │   │   ├── authService.js
    │   │   ├── suratService.js
    │   │   └── disposisiService.js
    │   ├── utils/
    │   │   ├── formatDate.js
    │   │   └── roleRoutes.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

---

## 🔧 TECH STACK

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: MySQL (via Sequelize ORM)
- **Auth**: JWT (JSON Web Token) + bcryptjs
- **File Upload**: Multer (PDF, max 5MB)
- **Validasi**: express-validator
- **CORS**: cors
- **ENV**: dotenv

### Frontend
- **Framework**: React 18 + Vite
- **Routing**: React Router DOM v6
- **State Management**: Context API + useState/useReducer
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: React Icons / Lucide React
- **Styling**: Tailwind CSS v3
- **Tanggal**: date-fns
- **Notifikasi**: react-hot-toast

---

## 🗄️ DATABASE SCHEMA (MySQL)

```sql
-- Tabel users
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator', 'pimpinan') NOT NULL,
  jabatan VARCHAR(100),
  desa VARCHAR(100) DEFAULT 'Desa Karangasem',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel klasifikasi
CREATE TABLE klasifikasi (
  id INT PRIMARY KEY AUTO_INCREMENT,
  kode VARCHAR(10) NOT NULL,
  nama_klasifikasi VARCHAR(100) NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel surat_masuk
CREATE TABLE surat_masuk (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nomor_surat VARCHAR(100) NOT NULL,
  asal_surat VARCHAR(200) NOT NULL,
  perihal VARCHAR(500) NOT NULL,
  tanggal_surat DATE NOT NULL,
  tanggal_terima DATE NOT NULL,
  klasifikasi_id INT,
  lampiran VARCHAR(255),
  keterangan TEXT,
  status ENUM('belum_disposisi', 'sudah_disposisi', 'diproses', 'selesai') DEFAULT 'belum_disposisi',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (klasifikasi_id) REFERENCES klasifikasi(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabel surat_keluar
CREATE TABLE surat_keluar (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nomor_surat VARCHAR(100) NOT NULL,
  tanggal_surat DATE NOT NULL,
  tujuan_surat VARCHAR(200) NOT NULL,
  perihal VARCHAR(500) NOT NULL,
  klasifikasi_id INT,
  lampiran VARCHAR(255),
  keterangan TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (klasifikasi_id) REFERENCES klasifikasi(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabel disposisi
CREATE TABLE disposisi (
  id INT PRIMARY KEY AUTO_INCREMENT,
  surat_masuk_id INT NOT NULL,
  dari_user_id INT NOT NULL,
  kepada_user_id INT NOT NULL,
  isi_disposisi TEXT NOT NULL,
  catatan TEXT,
  status ENUM('menunggu', 'diterima', 'selesai') DEFAULT 'menunggu',
  tanggal_disposisi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tanggal_selesai TIMESTAMP NULL,
  FOREIGN KEY (surat_masuk_id) REFERENCES surat_masuk(id),
  FOREIGN KEY (dari_user_id) REFERENCES users(id),
  FOREIGN KEY (kepada_user_id) REFERENCES users(id)
);
```

---

## ⚙️ BACKEND SETUP

### `backend/package.json`
```json
{
  "name": "e-arsip-karangasem-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.0",
    "mysql2": "^3.6.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### `backend/.env`
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=e_arsip_karangasem
JWT_SECRET=karangasem_secret_key_2024
JWT_EXPIRES_IN=7d
UPLOAD_PATH=./uploads
```

### `backend/src/config/database.js`
```javascript
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
  }
);

module.exports = sequelize;
```

### `backend/src/middleware/auth.js`
```javascript
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid' });
  }
};

const checkRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Akses ditolak' });
  }
  next();
};

module.exports = { verifyToken, checkRole };
```

### `backend/src/controllers/authController.js`
```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username, is_active: true } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, nama: user.nama },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: { id: user.id, nama: user.nama, username: user.username, role: user.role, jabatan: user.jabatan, desa: user.desa }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
```

### `backend/src/controllers/suratMasukController.js`
```javascript
const { SuratMasuk, Klasifikasi, User } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { search, klasifikasi, status, dari_tanggal, sampai_tanggal, page = 1, limit = 10 } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { nomor_surat: { [Op.like]: `%${search}%` } },
        { asal_surat: { [Op.like]: `%${search}%` } },
        { perihal: { [Op.like]: `%${search}%` } }
      ];
    }
    if (klasifikasi) where.klasifikasi_id = klasifikasi;
    if (status) where.status = status;
    if (dari_tanggal && sampai_tanggal) {
      where.tanggal_terima = { [Op.between]: [dari_tanggal, sampai_tanggal] };
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await SuratMasuk.findAndCountAll({
      where,
      include: [{ model: Klasifikasi, as: 'klasifikasi' }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      data: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const lampiran = req.file ? req.file.filename : null;
    const surat = await SuratMasuk.create({
      ...req.body,
      lampiran,
      created_by: req.user.id
    });
    res.status(201).json(surat);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const surat = await SuratMasuk.findByPk(req.params.id);
    if (!surat) return res.status(404).json({ message: 'Surat tidak ditemukan' });

    const lampiran = req.file ? req.file.filename : surat.lampiran;
    await surat.update({ ...req.body, lampiran });
    res.json(surat);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const surat = await SuratMasuk.findByPk(req.params.id);
    if (!surat) return res.status(404).json({ message: 'Surat tidak ditemukan' });
    await surat.destroy();
    res.json({ message: 'Surat berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalMasuk = await SuratMasuk.count();
    const sudahDisposisi = await SuratMasuk.count({ where: { status: 'sudah_disposisi' } });
    const belumDisposisi = await SuratMasuk.count({ where: { status: 'belum_disposisi' } });
    const selesai = await SuratMasuk.count({ where: { status: 'selesai' } });

    res.json({ totalMasuk, sudahDisposisi, belumDisposisi, selesai });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
```

### `backend/src/routes/suratMasuk.js`
```javascript
const router = require('express').Router();
const ctrl = require('../controllers/suratMasukController');
const { verifyToken, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', verifyToken, ctrl.getAll);
router.get('/stats', verifyToken, ctrl.getDashboardStats);
router.post('/', verifyToken, checkRole('admin', 'operator'), upload.single('lampiran'), ctrl.create);
router.put('/:id', verifyToken, checkRole('admin', 'operator'), upload.single('lampiran'), ctrl.update);
router.delete('/:id', verifyToken, checkRole('admin'), ctrl.delete);

module.exports = router;
```

### `backend/src/app.js`
```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/surat-masuk', require('./routes/suratMasuk'));
app.use('/api/surat-keluar', require('./routes/suratKeluar'));
app.use('/api/disposisi', require('./routes/disposisi'));
app.use('/api/klasifikasi', require('./routes/klasifikasi'));
app.use('/api/laporan', require('./routes/laporan'));
app.use('/api/pengguna', require('./routes/pengguna'));

app.get('/', (req, res) => res.json({ message: 'E-Arsip Karangasem API v1.0' }));

module.exports = app;
```

---

## 🎨 FRONTEND SETUP

### `frontend/package.json`
```json
{
  "name": "e-arsip-karangasem-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.18.0",
    "axios": "^1.6.0",
    "recharts": "^2.9.0",
    "lucide-react": "^0.290.0",
    "react-hot-toast": "^2.4.1",
    "date-fns": "^2.30.0",
    "react-datepicker": "^4.24.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.1.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "vite": "^4.5.0"
  }
}
```

### `frontend/src/services/api.js`
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### `frontend/src/context/AuthContext.jsx`
```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### `frontend/src/App.jsx`
```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Layout from './components/layout/Layout';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminSuratMasuk from './pages/admin/SuratMasuk';
import AdminSuratKeluar from './pages/admin/SuratKeluar';
import AdminKlasifikasi from './pages/admin/Klasifikasi';
import AdminPengguna from './pages/admin/Pengguna';
import AdminLaporan from './pages/admin/Laporan';

// Operator pages
import OperatorDashboard from './pages/operator/Dashboard';
import OperatorSuratMasuk from './pages/operator/SuratMasuk';
import OperatorSuratKeluar from './pages/operator/SuratKeluar';
import OperatorDisposisi from './pages/operator/Disposisi';

// Pimpinan pages
import PimpinanDashboard from './pages/pimpinan/Dashboard';
import PimpinanSuratMasuk from './pages/pimpinan/SuratMasuk';
import PimpinanSuratKeluar from './pages/pimpinan/SuratKeluar';
import PimpinanDisposisi from './pages/pimpinan/DisposisiSaya';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
  if (user.role === 'operator') return <Navigate to="/operator/dashboard" />;
  if (user.role === 'pimpinan') return <Navigate to="/pimpinan/dashboard" />;
  return <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RoleRedirect />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="surat-masuk" element={<AdminSuratMasuk />} />
        <Route path="surat-keluar" element={<AdminSuratKeluar />} />
        <Route path="klasifikasi" element={<AdminKlasifikasi />} />
        <Route path="pengguna" element={<AdminPengguna />} />
        <Route path="laporan" element={<AdminLaporan />} />
      </Route>

      {/* Operator Routes */}
      <Route path="/operator" element={<ProtectedRoute roles={['operator']}><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<OperatorDashboard />} />
        <Route path="surat-masuk" element={<OperatorSuratMasuk />} />
        <Route path="surat-keluar" element={<OperatorSuratKeluar />} />
        <Route path="disposisi" element={<OperatorDisposisi />} />
      </Route>

      {/* Pimpinan Routes */}
      <Route path="/pimpinan" element={<ProtectedRoute roles={['pimpinan']}><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<PimpinanDashboard />} />
        <Route path="surat-masuk" element={<PimpinanSuratMasuk />} />
        <Route path="surat-keluar" element={<PimpinanSuratKeluar />} />
        <Route path="disposisi-saya" element={<PimpinanDisposisi />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}
```

### `frontend/src/components/layout/Sidebar.jsx`
```jsx
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Mail, Send, FolderOpen,
  FileText, Users, Settings, LogOut, Archive,
  ClipboardList, User
} from 'lucide-react';

const menuConfig = {
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { section: 'SURAT' },
    { path: '/admin/surat-masuk', label: 'Surat Masuk', icon: Mail },
    { path: '/admin/surat-keluar', label: 'Surat Keluar', icon: Send },
    { section: 'KLASIFIKASI' },
    { path: '/admin/klasifikasi', label: 'Klasifikasi Surat', icon: FolderOpen },
    { section: 'LAPORAN' },
    { path: '/admin/laporan', label: 'Laporan', icon: FileText },
    { section: 'PENGATURAN' },
    { path: '/admin/pengguna', label: 'Pengguna', icon: Users },
    { path: '/admin/pengaturan', label: 'Pengaturan', icon: Settings },
  ],
  operator: [
    { path: '/operator/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { section: 'SURAT' },
    { path: '/operator/surat-masuk', label: 'Surat Masuk', icon: Mail },
    { path: '/operator/surat-keluar', label: 'Surat Keluar', icon: Send },
    { section: 'DISPOSISI' },
    { path: '/operator/disposisi', label: 'Disposisi Surat', icon: ClipboardList },
    { section: 'LAPORAN' },
    { path: '/operator/laporan', label: 'Laporan', icon: FileText },
    { section: 'PENGATURAN' },
    { path: '/operator/pengguna', label: 'Pengguna', icon: Users },
    { path: '/operator/profil', label: 'Profil Saya', icon: User },
  ],
  pimpinan: [
    { path: '/pimpinan/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { section: 'SURAT' },
    { path: '/pimpinan/surat-masuk', label: 'Surat Masuk', icon: Mail },
    { path: '/pimpinan/surat-keluar', label: 'Surat Keluar', icon: Send },
    { path: '/pimpinan/disposisi-saya', label: 'Disposisi Saya', icon: ClipboardList, badge: 3 },
    { section: 'LAPORAN' },
    { path: '/pimpinan/laporan', label: 'Laporan Surat', icon: FileText },
    { section: 'PENGATURAN' },
    { path: '/pimpinan/profil', label: 'Profil Saya', icon: User },
  ]
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const menus = menuConfig[user?.role] || [];

  return (
    <div className="w-[220px] min-h-screen bg-[#1e2d5a] text-white flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-white/10">
        <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
          KAS
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">E-ARSIP DESA</p>
          <p className="text-xs text-blue-200">Karangasem</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {menus.map((item, i) => {
          if (item.section) {
            return (
              <p key={i} className="text-[10px] text-blue-300 font-semibold tracking-wider mt-4 mb-1 px-2">
                {item.section}
              </p>
            );
          }
          const Icon = item.icon;
          return (
            <NavLink
              key={i}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-blue-500 text-white font-medium'
                    : 'text-blue-100 hover:bg-white/10'
                }`
              }
            >
              <Icon size={16} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-3 border-t border-white/10">
        <div className="bg-white/5 rounded-lg p-2.5 mb-2 text-xs">
          <p className="font-semibold text-white">{user?.nama}</p>
          <p className="text-blue-300 capitalize">{user?.role}</p>
          <p className="text-blue-400 text-[11px]">{user?.desa}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-300 hover:bg-red-500/20 transition-all"
        >
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </div>
  );
}
```

### `frontend/src/pages/auth/Login.jsx`
```jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Archive, Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      toast.success(`Selamat datang, ${user.nama}!`);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'operator') navigate('/operator/dashboard');
      else navigate('/pimpinan/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Username atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e2d5a] via-[#1a3a6b] to-[#2563eb] flex items-center justify-center p-4">
      {/* Background decorative circles */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Top banner */}
        <div className="bg-gradient-to-r from-[#1e2d5a] to-[#2563eb] px-8 py-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Archive size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">E-ARSIP DESA</h1>
          <p className="text-blue-200 text-sm mt-1">Desa Karangasem</p>
          <p className="text-blue-300 text-xs mt-0.5">Sistem Informasi Pengarsipan Surat</p>
        </div>

        {/* Form area */}
        <div className="px-8 py-7">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Masuk ke Akun</h2>
          <p className="text-sm text-gray-500 mb-6">Silakan masukkan kredensial Anda untuk melanjutkan</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Masukkan username Anda"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <a href="#" className="text-xs text-blue-600 hover:underline">Lupa password?</a>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-11"
                  placeholder="Masukkan password Anda"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <input type="checkbox" id="remember" className="rounded border-gray-300 text-blue-600" />
              <label htmlFor="remember" className="text-sm text-gray-600">Ingat saya</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1e2d5a] to-[#2563eb] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 shadow-md"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Masuk
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-500">
            Belum punya akun?{' '}
            <Link to="/daftar" className="text-blue-600 font-medium hover:underline">
              Daftar di sini
            </Link>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-3 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">© 2026 E-Arsip Desa Karangasem. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
```

---

### `frontend/src/pages/auth/Register.jsx`
```jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Archive, Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({
    nama: '',
    username: '',
    password: '',
    konfirmasi_password: '',
    jabatan: '',
    role: 'operator',
  });
  const [showPass, setShowPass] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.konfirmasi_password) {
      toast.error('Password dan konfirmasi password tidak cocok');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        nama: form.nama,
        username: form.username,
        password: form.password,
        jabatan: form.jabatan,
        role: form.role,
        desa: 'Desa Karangasem',
      });
      setSuccess(true);
      toast.success('Pendaftaran berhasil! Silakan menunggu persetujuan admin.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Pendaftaran gagal');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e2d5a] via-[#1a3a6b] to-[#2563eb] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pendaftaran Berhasil!</h2>
          <p className="text-gray-500 text-sm mb-1">Akun Anda telah terdaftar.</p>
          <p className="text-gray-500 text-sm mb-6">
            Silakan tunggu <span className="font-semibold text-[#1e2d5a]">persetujuan Administrator</span> sebelum dapat masuk ke sistem.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-r from-[#1e2d5a] to-[#2563eb] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all"
          >
            Kembali ke Halaman Login
          </button>
          <p className="text-xs text-gray-400 mt-5">© 2026 E-Arsip Desa Karangasem</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e2d5a] via-[#1a3a6b] to-[#2563eb] flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Top banner */}
        <div className="bg-gradient-to-r from-[#1e2d5a] to-[#2563eb] px-8 py-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Archive size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">E-ARSIP DESA</h1>
          <p className="text-blue-200 text-sm mt-1">Desa Karangasem</p>
          <p className="text-blue-300 text-xs mt-0.5">Daftar Akun Baru</p>
        </div>

        {/* Form area */}
        <div className="px-8 py-7">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Buat Akun Baru</h2>
          <p className="text-sm text-gray-500 mb-5">Lengkapi data berikut untuk mendaftar sebagai pengguna sistem</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Masukkan nama lengkap"
                value={form.nama}
                onChange={handleChange}
                required
              />
            </div>

            {/* Jabatan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Jabatan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="jabatan"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Contoh: Sekretaris Desa, Kaur Umum"
                value={form.jabatan}
                onChange={handleChange}
                required
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Role / Hak Akses <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                value={form.role}
                onChange={handleChange}
                required
              >
                <option value="operator">Operator</option>
                <option value="pimpinan">Pimpinan / Kepala Desa</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">* Role Admin hanya dapat dibuat oleh Administrator</p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Buat username unik (tanpa spasi)"
                value={form.username}
                onChange={handleChange}
                required
                pattern="[a-zA-Z0-9_]+"
                title="Username hanya boleh huruf, angka, dan underscore"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-11"
                  placeholder="Minimal 6 karakter"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showKonfirmasi ? 'text' : 'password'}
                  name="konfirmasi_password"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-11 ${
                    form.konfirmasi_password && form.password !== form.konfirmasi_password
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="Ulangi password Anda"
                  value={form.konfirmasi_password}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowKonfirmasi(!showKonfirmasi)}>
                  {showKonfirmasi ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.konfirmasi_password && form.password !== form.konfirmasi_password && (
                <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (form.konfirmasi_password && form.password !== form.konfirmasi_password)}
              className="w-full bg-gradient-to-r from-[#1e2d5a] to-[#2563eb] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 shadow-md"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Mendaftar...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Daftar Sekarang
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Masuk di sini
            </Link>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-3 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">© 2026 E-Arsip Desa Karangasem. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
```

---

### `backend/src/controllers/authController.js` — tambahkan fungsi register
```javascript
// Tambahkan di authController.js (di bawah exports.login)

exports.register = async (req, res) => {
  try {
    const { nama, username, password, jabatan, role, desa } = req.body;

    // Cek username sudah ada
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }

    // Role yang boleh daftar sendiri hanya operator & pimpinan
    const allowedRoles = ['operator', 'pimpinan'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Role tidak valid untuk pendaftaran mandiri' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      nama,
      username,
      password: hashedPassword,
      jabatan,
      role,
      desa: desa || 'Desa Karangasem',
      is_active: false, // Menunggu aktivasi admin
    });

    res.status(201).json({
      message: 'Pendaftaran berhasil. Akun menunggu persetujuan Administrator.',
      user: { id: user.id, nama: user.nama, username: user.username, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
```

### `backend/src/routes/auth.js` — tambahkan route register
```javascript
const router = require('express').Router();
const { login, getProfile, register } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/login', login);
router.post('/register', register);           // Daftar akun baru
router.get('/profile', verifyToken, getProfile);

module.exports = router;
```

### Update `frontend/src/App.jsx` — tambahkan route daftar
```jsx
// Tambahkan import
import Register from './pages/auth/Register';

// Tambahkan route di dalam <Routes>
<Route path="/login" element={<Login />} />
<Route path="/daftar" element={<Register />} />
```

### `frontend/src/components/common/StatCard.jsx`
```jsx
export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', onClick }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 p-5 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          <p className="text-sm font-medium text-gray-600 mt-1">{title}</p>
          {subtitle && (
            <p className="text-xs text-blue-500 mt-2 flex items-center gap-1 cursor-pointer hover:underline">
              {subtitle} →
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colors[color]}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
}
```

### `frontend/src/components/common/Badge.jsx`
```jsx
const variants = {
  belum_disposisi: 'bg-amber-100 text-amber-700',
  sudah_disposisi: 'bg-green-100 text-green-700',
  diproses: 'bg-blue-100 text-blue-700',
  selesai: 'bg-gray-100 text-gray-700',
  default: 'bg-gray-100 text-gray-600',
};

const labels = {
  belum_disposisi: 'Belum Disposisi',
  sudah_disposisi: 'Sudah Disposisi',
  diproses: 'Diproses',
  selesai: 'Selesai',
};

export default function Badge({ status, text }) {
  const cls = variants[status] || variants.default;
  const label = text || labels[status] || status;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
```

---

## 🚀 CARA MENJALANKAN

### 1. Install Backend
```bash
cd backend
npm install

# Buat database MySQL
mysql -u root -p
CREATE DATABASE e_arsip_karangasem;
EXIT;

# Jalankan server
npm run dev
```

### 2. Install Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Seed Data Awal (Jalankan di backend)
```javascript
// backend/src/seeders/seed.js
const bcrypt = require('bcryptjs');
const { User, Klasifikasi } = require('../models');

async function seed() {
  // Create users
  await User.bulkCreate([
    { nama: 'Administrator', username: 'admin', password: await bcrypt.hash('admin123', 10), role: 'admin', jabatan: 'Administrator', desa: 'Desa Karangasem' },
    { nama: 'Operator Desa', username: 'operator', password: await bcrypt.hash('operator123', 10), role: 'operator', jabatan: 'Operator', desa: 'Desa Karangasem' },
    { nama: 'Kepala Desa', username: 'kades', password: await bcrypt.hash('kades123', 10), role: 'pimpinan', jabatan: 'Kepala Desa', desa: 'Desa Karangasem' },
  ]);

  // Create klasifikasi
  await Klasifikasi.bulkCreate([
    { kode: '000', nama_klasifikasi: 'Umum', keterangan: 'Musrenbang Desa, Laporan, Protokol' },
    { kode: '100', nama_klasifikasi: 'Pemerintahan', keterangan: 'Pembagian Wilayah, Administrasi Desa' },
    { kode: '400', nama_klasifikasi: 'Kesejahteraan Masyarakat', keterangan: 'Sosial, Pendidikan, Kebudayaan, Kesehatan' },
    { kode: '800', nama_klasifikasi: 'Kepegawaian', keterangan: 'Surat Tugas/Perintah Dinas' },
    { kode: '900', nama_klasifikasi: 'Keuangan', keterangan: 'APBDes/RAPBD, Laporan Keuangan' },
  ]);

  console.log('Seed berhasil!');
  process.exit(0);
}

seed().catch(console.error);
```

---

## 🔔 KOMPONEN NAVBAR (Lengkap dengan Notifikasi)

### `frontend/src/components/layout/Navbar.jsx`
```jsx
import { useState } from 'react';
import { Bell, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Navbar({ title }) {
  const { user, logout } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);

  // Contoh data notifikasi — ganti dengan data dari API
  const notifikasi = [
    { id: 1, pesan: 'Surat masuk baru dari Dinas PMD', waktu: '5 menit lalu', dibaca: false },
    { id: 2, pesan: 'Disposisi menunggu persetujuan Anda', waktu: '1 jam lalu', dibaca: false },
    { id: 3, pesan: 'Laporan keuangan bulan ini tersedia', waktu: '2 jam lalu', dibaca: false },
  ];
  const jumlahBelumDibaca = notifikasi.filter(n => !n.dibaca).length;

  return (
    <header className="h-14 bg-[#1e2d5a] text-white flex items-center justify-between px-6 fixed top-0 left-[220px] right-0 z-20 shadow-md">
      {/* Judul Halaman */}
      <div className="flex items-center gap-3">
        <button className="text-white/60 hover:text-white lg:hidden">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <h1 className="font-semibold text-base">{title || 'Dashboard'}</h1>
      </div>

      {/* Kanan: Notifikasi + User */}
      <div className="flex items-center gap-3">

        {/* Bell Notifikasi */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowUser(false); }}
            className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Bell size={20} />
            {jumlahBelumDibaca > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {jumlahBelumDibaca}
              </span>
            )}
          </button>

          {/* Dropdown Notifikasi */}
          {showNotif && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-gray-800 text-sm">Notifikasi</span>
                <span className="text-xs text-blue-600 cursor-pointer hover:underline">Tandai semua dibaca</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifikasi.map(n => (
                  <div key={n.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${!n.dibaca ? 'bg-blue-50/50' : ''}`}>
                    <div className="flex items-start gap-2">
                      {!n.dibaca && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
                      <div className={!n.dibaca ? '' : 'ml-4'}>
                        <p className="text-sm text-gray-700">{n.pesan}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{n.waktu}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 text-center">
                <span className="text-xs text-blue-600 cursor-pointer hover:underline">Lihat semua notifikasi</span>
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowUser(!showUser); setShowNotif(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-7 h-7 bg-blue-400 rounded-full flex items-center justify-center text-xs font-bold">
              {user?.nama?.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium leading-tight">{user?.nama}</p>
              <p className="text-[11px] text-blue-200 capitalize leading-tight">{user?.role}</p>
            </div>
            <ChevronDown size={14} className="text-blue-200" />
          </button>

          {/* Dropdown User */}
          {showUser && (
            <div className="absolute right-0 top-10 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-gray-800 text-sm">{user?.nama}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role} · {user?.desa}</p>
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <User size={15} /> Profil Saya
                </button>
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Settings size={15} /> Pengaturan
                </button>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} /> Keluar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay tutup dropdown */}
      {(showNotif || showUser) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowNotif(false); setShowUser(false); }} />
      )}
    </header>
  );
}
```

---

## 🏠 DASHBOARD PIMPINAN (Lengkap)

### `frontend/src/pages/pimpinan/Dashboard.jsx`
```jsx
import { useState, useEffect } from 'react';
import { Mail, Send, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';

const grafikData = [
  { bulan: 'Jan', masuk: 20, keluar: 12 },
  { bulan: 'Feb', masuk: 25, keluar: 15 },
  { bulan: 'Mar', masuk: 35, keluar: 21 },
  { bulan: 'Apr', masuk: 18, keluar: 10 },
  { bulan: 'Mei', masuk: 28, keluar: 18 },
  { bulan: 'Jun', masuk: 40, keluar: 30 },
];

const ringkasanKlasifikasi = [
  { kode: '000', nama: 'Umum', jumlah: 12, warna: 'text-blue-600 bg-blue-50' },
  { kode: '100', nama: 'Pemerintahan', jumlah: 18, warna: 'text-green-600 bg-green-50' },
  { kode: '400', nama: 'Kesejahteraan', jumlah: 15, warna: 'text-teal-600 bg-teal-50' },
  { kode: '800', nama: 'Kepegawaian', jumlah: 7, warna: 'text-purple-600 bg-purple-50' },
  { kode: '900', nama: 'Keuangan', jumlah: 11, warna: 'text-amber-600 bg-amber-50' },
];

const suratTerbaru = [
  { id: 1, perihal: 'Surat Pengantar Nikah (N1)', pengirim: 'Warga: Siti Aminah', tanggal: '11/06/2026', tipe: 'keluar' },
  { id: 2, perihal: 'Nota Dinas', pengirim: 'Sekretariat Desa', tanggal: '11/06/2026', tipe: 'masuk' },
  { id: 3, perihal: 'Surat Tugas Perangkat Desa', pengirim: 'Kepala Desa', tanggal: '10/06/2026', tipe: 'keluar' },
  { id: 4, perihal: 'Imbauan Kebersihan Lingkungan', pengirim: 'Kepala Desa', tanggal: '10/06/2026', tipe: 'masuk' },
];

const aktivitasTerakhir = [
  { id: 1, pesan: 'Operator Desa mengajukan surat Laporan Keuangan Desa', waktu: '5 menit yang lalu', ikon: '📄', warna: 'bg-blue-100' },
  { id: 2, pesan: 'Anda menyetujui disposisi surat Undangan Musrenbang Desa', waktu: '1 jam yang lalu', ikon: '✅', warna: 'bg-green-100' },
  { id: 3, pesan: 'Operator Desa menambahkan surat baru Pemberitahuan Kegiatan', waktu: '2 jam yang lalu', ikon: '📄', warna: 'bg-blue-100' },
  { id: 4, pesan: 'Anda memberikan disposisi surat Permohonan Bantuan Alat', waktu: '3 jam yang lalu', ikon: '✏️', warna: 'bg-amber-100' },
];

export default function PimpinanDashboard() {
  const [stats, setStats] = useState({ masuk: 28, keluar: 17, menunggu: 8, selesai: 24 });
  const now = new Date();

  return (
    <div className="p-6 space-y-6">

      {/* Header Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Selamat datang, Kepala Desa</h2>
          <p className="text-gray-500 text-sm mt-1">Berikut ringkasan arsip surat desa hari ini.</p>
        </div>
        <div className="text-right bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm">
          <p className="text-sm font-medium text-gray-700">
            {format(now, 'EEEE, d MMMM yyyy', { locale: id })}
          </p>
          <p className="text-xs text-gray-400">{format(now, 'HH:mm')} WIB</p>
        </div>
      </div>

      {/* 4 StatCard */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Surat Masuk" value={stats.masuk} subtitle="12 belum dibaca" icon={Mail} color="blue" />
        <StatCard title="Surat Keluar" value={stats.keluar} subtitle="3 hari ini" icon={Send} color="green" />
        <StatCard title="Menunggu Disposisi" value={stats.menunggu} subtitle="Perlu tindakan" icon={Clock} color="amber" />
        <StatCard title="Disposisi Selesai" value={stats.selesai} subtitle="Bulan ini" icon={CheckCircle} color="purple" />
      </div>

      {/* Grafik + Disposisi Menunggu */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Grafik */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">Grafik Surat (6 Bulan Terakhir)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={grafikData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="masuk" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} name="Surat Masuk" />
              <Line type="monotone" dataKey="keluar" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} name="Surat Keluar" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Disposisi Menunggu */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Disposisi Menunggu Persetujuan</h3>
            <span className="text-xs text-blue-600 cursor-pointer hover:underline">Lihat semua</span>
          </div>
          <div className="space-y-3">
            {[
              { perihal: 'Undangan Musrenbang Desa', dari: 'Dinas PMD Kab. Bojonegoro', tgl: '10/06/2026', tipe: 'masuk' },
              { perihal: 'Pemberitahuan Kegiatan Lomba Desa', dari: 'Kecamatan Ngraho', tgl: '09/06/2026', tipe: 'masuk' },
              { perihal: 'Permohonan Bantuan Alat Pertanian', dari: 'Kelompok Tani Makmur', tgl: '08/06/2026', tipe: 'masuk' },
              { perihal: 'Laporan Realisasi APBDes Tahap I', dari: 'Sekretaris Desa', tgl: '07/06/2026', tipe: 'keluar' },
              { perihal: 'Surat Keterangan Domisili Usaha', dari: 'Warga: Budi Santoso', tgl: '07/06/2026', tipe: 'keluar' },
            ].map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-2 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="flex items-start gap-2 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${item.tipe === 'masuk' ? 'bg-blue-100' : 'bg-green-100'}`}>
                    {item.tipe === 'masuk'
                      ? <Mail size={13} className="text-blue-600" />
                      : <Send size={13} className="text-green-600" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 leading-tight truncate">{item.perihal}</p>
                    <p className="text-xs text-gray-400 truncate">{item.dari}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">{item.tgl}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${item.tipe === 'masuk' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {item.tipe === 'masuk' ? 'Surat Masuk' : 'Surat Keluar'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ringkasan Arsip Berdasarkan Klasifikasi */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">Ringkasan Arsip Berdasarkan Klasifikasi (Tahun 2026)</h3>
          <span className="text-xs text-blue-600 cursor-pointer hover:underline">Lihat semua</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
          {ringkasanKlasifikasi.map((item) => (
            <div key={item.kode} className="border border-gray-100 rounded-xl p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
              <p className="text-xs font-semibold text-gray-500 mb-1">{item.kode}</p>
              <p className="text-sm font-medium text-gray-700 mb-3">{item.nama}</p>
              <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-2 ${item.warna}`}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="opacity-70">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-800">{item.jumlah}</p>
              <p className="text-xs text-gray-400 mt-0.5">Arsip</p>
            </div>
          ))}
        </div>
      </div>

      {/* Surat Terbaru + Aktivitas Terakhir */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Surat Terbaru */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Surat Terbaru</h3>
            <span className="text-xs text-blue-600 cursor-pointer hover:underline">Lihat semua</span>
          </div>
          <div className="space-y-3">
            {suratTerbaru.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.tipe === 'masuk' ? 'bg-blue-100' : 'bg-green-100'}`}>
                    {s.tipe === 'masuk' ? <Mail size={14} className="text-blue-600" /> : <Send size={14} className="text-green-600" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{s.perihal}</p>
                    <p className="text-xs text-gray-400 truncate">{s.pengirim}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">{s.tanggal}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${s.tipe === 'masuk' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {s.tipe === 'masuk' ? 'Surat Masuk' : 'Surat Keluar'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aktivitas Terakhir */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">Aktivitas Terakhir</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {aktivitasTerakhir.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${a.warna}`}>
                  {a.ikon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{a.pesan}</p>
                  <p className="text-[11px] text-gray-400 mt-1">{a.waktu}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
```

---

## 📋 KOMPONEN STATCARD (Update — dengan subtitle informatif)

### `frontend/src/components/common/StatCard.jsx` (Update)
```jsx
export default function StatCard({ title, value, subtitle, subtitleColor = 'blue', icon: Icon, color = 'blue', onClick }) {
  const iconColors = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    amber:  'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    red:    'bg-red-50 text-red-600',
    teal:   'bg-teal-50 text-teal-600',
  };

  const subtitleColors = {
    blue:   'text-blue-500',
    green:  'text-green-500',
    amber:  'text-amber-500',
    red:    'text-red-500',
    gray:   'text-gray-400',
  };

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 p-5 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          <p className="text-sm font-medium text-gray-600 mt-1">{title}</p>
          {subtitle && (
            <p className={`text-xs mt-2 flex items-center gap-1 cursor-pointer hover:underline ${subtitleColors[subtitleColor] || subtitleColors.blue}`}>
              {subtitle} →
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl flex-shrink-0 ml-3 ${iconColors[color]}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 📄 TABEL SURAT MASUK OPERATOR (Lengkap dengan info pagination)

### `frontend/src/pages/operator/SuratMasuk.jsx`
```jsx
import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, Filter } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import { Mail, CheckCircle, Clock, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OperatorSuratMasuk() {
  const [suratList, setSuratList] = useState([]);
  const [stats, setStats] = useState({ total: 0, sudah: 0, belum: 0, selesai: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKlasifikasi, setFilterKlasifikasi] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dariTanggal, setDariTanggal] = useState('');
  const [sampaiTanggal, setSampaiTanggal] = useState('');
  const [page, setPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 7;

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      if (filterKlasifikasi) params.append('klasifikasi', filterKlasifikasi);
      if (filterStatus) params.append('status', filterStatus);
      if (dariTanggal) params.append('dari_tanggal', dariTanggal);
      if (sampaiTanggal) params.append('sampai_tanggal', sampaiTanggal);

      const [suratRes, statsRes] = await Promise.all([
        api.get(`/surat-masuk?${params}`),
        api.get('/surat-masuk/stats'),
      ]);

      setSuratList(suratRes.data.data);
      setTotalData(suratRes.data.total);
      setTotalPages(suratRes.data.totalPages);
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, filterKlasifikasi, filterStatus]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchData(); };

  const handleHapus = async (id) => {
    if (!confirm('Yakin ingin menghapus surat ini?')) return;
    try {
      await api.delete(`/surat-masuk/${id}`);
      toast.success('Surat berhasil dihapus');
      fetchData();
    } catch {
      toast.error('Gagal menghapus surat');
    }
  };

  const startRow = (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, totalData);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Surat Masuk</h2>
          <p className="text-sm text-gray-500 mt-0.5">Kelola data surat masuk yang diterima</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={16} /> Tambah Surat Masuk
        </button>
      </div>

      {/* StatCards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Surat Masuk" value={stats.total} subtitle="Lihat semua" icon={Mail} color="blue" />
        <StatCard title="Sudah Disposisi" value={stats.sudah} subtitle="Lihat semua" icon={CheckCircle} color="green" />
        <StatCard title="Belum Disposisi" value={stats.belum} subtitle="Lihat semua" icon={Clock} color="amber" />
        <StatCard title="Selesai Ditindaklanjuti" value={stats.selesai} subtitle="Lihat semua" icon={CheckSquare} color="purple" />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cari surat masuk..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={filterKlasifikasi}
            onChange={e => { setFilterKlasifikasi(e.target.value); setPage(1); }}
          >
            <option value="">Semua Klasifikasi</option>
            <option value="1">000 - Umum</option>
            <option value="2">100 - Pemerintahan</option>
            <option value="3">400 - Kesra</option>
            <option value="4">800 - Kepegawaian</option>
            <option value="5">900 - Keuangan</option>
          </select>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          >
            <option value="">Semua Status</option>
            <option value="belum_disposisi">Belum Disposisi</option>
            <option value="sudah_disposisi">Sudah Disposisi</option>
            <option value="diproses">Diproses</option>
            <option value="selesai">Selesai</option>
          </select>
          <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={dariTanggal} onChange={e => setDariTanggal(e.target.value)} />
          <span className="text-gray-400 text-sm">s/d</span>
          <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={sampaiTanggal} onChange={e => setSampaiTanggal(e.target.value)} />
          <button type="submit" className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            <Filter size={14} /> Filter
          </button>
        </form>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">No.</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nomor Surat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Asal Surat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Perihal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tgl Surat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tgl Terima</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Klasifikasi</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-10 text-gray-400">Memuat data...</td></tr>
              ) : suratList.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-gray-400">Tidak ada data surat masuk</td></tr>
              ) : suratList.map((s, i) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500">{startRow + i}</td>
                  <td className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">{s.nomor_surat}</td>
                  <td className="px-4 py-3 text-gray-600">{s.asal_surat}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{s.perihal}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{s.tanggal_surat}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{s.tanggal_terima}</td>
                  <td className="px-4 py-3">
                    {s.klasifikasi && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700 whitespace-nowrap">
                        {s.klasifikasi.kode} - {s.klasifikasi.nama_klasifikasi.substring(0, 8)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3"><Badge status={s.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Lihat">
                        <Eye size={14} />
                      </button>
                      <button className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Hapus"
                        onClick={() => handleHapus(s.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Tabel: Info Pagination + Tombol Halaman */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {totalData > 0
              ? `Menampilkan ${startRow} sampai ${endRow} dari ${totalData} data`
              : 'Tidak ada data'}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >«</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >{p}</button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >»</button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 📋 FITUR YANG DIIMPLEMENTASIKAN

### ✅ Role Admin
- [x] Dashboard dengan statistik lengkap & grafik 6 bulan terakhir
- [x] Kolom "Surat Terbaru" di dashboard
- [x] Manajemen Surat Masuk (CRUD + upload PDF)
- [x] Manajemen Surat Keluar (CRUD + upload PDF)
- [x] Klasifikasi Surat (CRUD)
- [x] Manajemen Pengguna (CRUD + reset password)
- [x] Laporan & ekspor data

### ✅ Role Operator
- [x] Dashboard ringkasan surat
- [x] Input Surat Masuk & Surat Keluar
- [x] Tabel lengkap dengan filter multi-kolom
- [x] Info "Menampilkan X sampai Y dari Z data"
- [x] Pagination halaman
- [x] Buat & kelola Disposisi
- [x] Notifikasi bell icon + dropdown

### ✅ Role Pimpinan (Kepala Desa)
- [x] Dashboard khusus pimpinan dengan greeting + tanggal/jam
- [x] 4 StatCard dengan subtitle informatif (belum dibaca, hari ini, perlu tindakan)
- [x] Grafik surat 6 bulan terakhir
- [x] Panel "Disposisi Menunggu Persetujuan"
- [x] Tabel "Ringkasan Arsip Berdasarkan Klasifikasi (Tahun 2026)"
- [x] Panel "Surat Terbaru"
- [x] Section "Aktivitas Terakhir" (4 kartu timeline)
- [x] Notifikasi bell icon + dropdown

---

## 🎨 WARNA & TEMA UI

```css
/* Tailwind config tambahan */
colors: {
  primary: '#1e2d5a',     /* Biru tua sidebar */
  secondary: '#2563eb',    /* Biru tombol */
  accent: '#f59e0b',       /* Amber aksen */
}
```

Nama Desa: **Karangasem**
Nama Sistem: **E-Arsip Desa Karangasem**
Footer: `© 2026 E-Arsip Desa Karangasem | Sistem Informasi Pengarsipan Surat Desa`
