require('./helpers/setup');
const request = require('supertest');
const express = require('express');
const { mockDb, generateTestToken, authHeader } = require('./helpers/setup');

const app = express();
app.use(express.json());
app.use('/api/laporan', require('../routes/laporanRoutes'));

const adminUser = { id: 1, role: 'admin', status: 'Aktif' };

describe('Laporan Routes', () => {
  describe('GET /api/laporan/rekap', () => {
    test('should return rekap laporan', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser); // verifyToken
      mockDb.all.mockResolvedValueOnce([
        { klasifikasi_id: 1, kode: '000', nama: 'Umum', surat_masuk: 3, surat_keluar: 2 },
        { klasifikasi_id: 2, kode: '005', nama: 'Undangan', surat_masuk: 1, surat_keluar: 0 },
      ]);

      const res = await request(app).get('/api/laporan/rekap').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
      expect(res.body.data.rekap).toBeDefined();
      expect(res.body.data.total).toBeDefined();
    });
  });

  describe('GET /api/laporan/statistik-bulanan', () => {
    test('should return monthly statistics', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser); // verifyToken
      mockDb.all.mockResolvedValueOnce([
        { bulan: 1, total: 0 }, { bulan: 2, total: 1 }, { bulan: 3, total: 2 },
      ]);
      mockDb.all.mockResolvedValueOnce([
        { bulan: 1, total: 1 }, { bulan: 2, total: 2 }, { bulan: 3, total: 3 },
      ]);
      const res = await request(app).get('/api/laporan/statistik-bulanan').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(12);
    });
  });

  describe('GET /api/laporan/grafik', () => {
    test('should return chart data', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser); // verifyToken
      mockDb.all.mockResolvedValueOnce([
        { tahun: 2026, bulan: 1, total: 0 }, { tahun: 2026, bulan: 2, total: 1 },
      ]);
      mockDb.all.mockResolvedValueOnce([
        { tahun: 2026, bulan: 1, total: 0 }, { tahun: 2026, bulan: 2, total: 2 },
      ]);
      const res = await request(app).get('/api/laporan/grafik').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(6);
    });
  });
});