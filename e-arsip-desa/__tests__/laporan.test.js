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
        { id: 1, kode: '000', nama: 'Umum', keterangan: 'Surat umum' },
        { id: 2, kode: '005', nama: 'Undangan', keterangan: 'Undangan' },
      ]);
      mockDb.get.mockResolvedValueOnce({ total: 3 });
      mockDb.get.mockResolvedValueOnce({ total: 2 });
      mockDb.get.mockResolvedValueOnce({ total: 1 });
      mockDb.get.mockResolvedValueOnce({ total: 0 });

      const res = await request(app).get('/api/laporan/rekap').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
      expect(res.body.data.rekap).toBeDefined();
      expect(res.body.data.total).toBeDefined();
    });
  });

  describe('GET /api/laporan/statistik-bulanan', () => {
    test('should return monthly statistics', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser); // verifyToken
      for (let i = 0; i < 12; i++) {
        mockDb.get.mockResolvedValueOnce({ total: i });
        mockDb.get.mockResolvedValueOnce({ total: i + 1 });
      }
      const res = await request(app).get('/api/laporan/statistik-bulanan').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(12);
    });
  });

  describe('GET /api/laporan/grafik', () => {
    test('should return chart data', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser); // verifyToken
      for (let i = 0; i < 6; i++) {
        mockDb.get.mockResolvedValueOnce({ total: i });
        mockDb.get.mockResolvedValueOnce({ total: i * 2 });
      }
      const res = await request(app).get('/api/laporan/grafik').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(6);
    });
  });
});