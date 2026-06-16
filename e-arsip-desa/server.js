const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:5173', 'http://127.0.0.1:5000', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));
// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Request timeout middleware (30s)
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    if (!res.headersSent) {
      res.status(503).json({ success: false, message: 'Waktu permintaan habis. Silakan coba lagi.' });
    }
  });
  next();
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const suratMasukRoutes = require('./routes/suratMasukRoutes');
const suratKeluarRoutes = require('./routes/suratKeluarRoutes');
const klasifikasiRoutes = require('./routes/klasifikasiRoutes');
const disposisiRoutes = require('./routes/disposisiRoutes');
const laporanRoutes = require('./routes/laporanRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const profilDesaRoutes = require('./routes/profilDesaRoutes');
const sseRoutes = require('./routes/sseRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/surat-masuk', suratMasukRoutes);
app.use('/api/surat-keluar', suratKeluarRoutes);
app.use('/api/klasifikasi', klasifikasiRoutes);
app.use('/api/disposisi', disposisiRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profil-desa', profilDesaRoutes);
app.use('/api', sseRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-Arsip Desa API is running' });
});

// Serve frontend for all other routes (React Router)
app.get('*', (req, res, next) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  } else {
    next();
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, 'uploads')}`);
});

module.exports = app;

