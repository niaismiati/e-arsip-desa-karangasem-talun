require('./helpers/setup');
const request = require('supertest');
const express = require('express');
const { mockDb, generateTestToken, authHeader } = require('./helpers/setup');

const app = express();
app.use(express.json());
app.use('/api/dashboard', require('../routes/dashboardRoutes'));

const adminUser = { id: 1, role: 'admin', status: 'Aktif' };

describe('Dashboard Routes', () => {
  describe('GET /api/dashboard/stats', () => {
    test('should return dashboard stats', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser); // verifyToken
      mockDb.get.mockResolvedValueOnce({ total: 10 });
      mockDb.get.mockResolvedValueOnce({ total: 5 });
      mockDb.get.mockResolvedValueOnce({ total: 3 });
      mockDb.get.mockResolvedValueOnce({ total: 15 });
      const res = await request(app).get('/api/dashboard/stats').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
      expect(res.body.data.surat_masuk).toBe(10);
    });
  });

  describe('GET /api/dashboard/chart', () => {
    test('should return chart data', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser);
      for (let i = 0; i < 6; i++) {
        mockDb.get.mockResolvedValueOnce({ total: i + 1 });
        mockDb.get.mockResolvedValueOnce({ total: i + 2 });
      }
      const res = await request(app).get('/api/dashboard/chart').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(6);
    });
  });

  describe('GET /api/dashboard/recent-letters', () => {
    test('should return recent letters', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser);
      mockDb.all.mockResolvedValueOnce([{ id: 1, perihal: 'Surat 1' }]);
      mockDb.all.mockResolvedValueOnce([]);
      const res = await request(app).get('/api/dashboard/recent-letters').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/dashboard/pending-disposisi', () => {
    test('should return pending disposisi', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser);
      mockDb.all.mockResolvedValueOnce([{ id: 1, instruksi: 'Test' }]);
      const res = await request(app).get('/api/dashboard/pending-disposisi').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/dashboard/klasifikasi-summary', () => {
    test('should return summary', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser);
      mockDb.all.mockResolvedValueOnce([{ id: 1, kode: '000', nama: 'Umum' }]);
      mockDb.get.mockResolvedValueOnce({ total: 5 });
      mockDb.get.mockResolvedValueOnce({ total: 3 });
      const res = await request(app).get('/api/dashboard/klasifikasi-summary').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/dashboard/aktivitas', () => {
    test('should return recent aktivitas', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser);
      mockDb.all.mockResolvedValueOnce([{ id: 1, tipe: 'users', deskripsi: 'Test', user_nama: 'Admin' }]);
      const res = await request(app).get('/api/dashboard/aktivitas').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });
});