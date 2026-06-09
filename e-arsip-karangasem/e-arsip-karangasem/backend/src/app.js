const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/surat-masuk', require('./routes/suratMasuk'));
app.use('/api/surat-keluar', require('./routes/suratKeluar'));
app.use('/api/disposisi', require('./routes/disposisi'));
app.use('/api/klasifikasi', require('./routes/klasifikasi'));
app.use('/api/laporan', require('./routes/laporan'));
app.use('/api/pengguna', require('./routes/pengguna'));
app.use('/api/profil-desa', require('./routes/profilDesa'));
app.use('/api/stream', require('./routes/stream'));

app.get('/', (req, res) => res.json({ message: 'E-Arsip Desa Karangasem API v1.0 — 2026' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
