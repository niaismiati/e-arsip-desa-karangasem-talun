require('./helpers/setup');
const request = require('supertest');
const express = require('express');
const { mockDb, generateTestToken, authHeader } = require('./helpers/setup');

const app = express();
app.use(express.json());
app.use('/api/surat-keluar', require('../routes/suratKeluarRoutes'));

const adminUser = { id: 1, role: 'admin', status: 'Aktif' };
const operatorUser = { id: 2, role: 'operator', status: 'Aktif' };
const kadesUser = { id: 3, role: 'kades', status: 'Aktif' };

describe('Surat Keluar Routes', () => {
  describe('GET /api/surat-keluar/generate-nomor', () => {
    test('should generate nomor surat', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser); // verifyToken
      mockDb.get.mockResolvedValueOnce({ id: 1, kode_surat_default: '470', inisial_desa: 'KS', pemisah: '/', panjang_nomor: 3 });
      mockDb.get.mockResolvedValueOnce({ total: 5 });
      const res = await request(app).get('/api/surat-keluar/generate-nomor').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
      expect(res.body.data.nomor).toContain('470');
    });
  });

  describe('GET /api/surat-keluar', () => {
    test('should return paginated surat keluar', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser);
      mockDb.get.mockResolvedValueOnce({ total: 1 });
      mockDb.all.mockResolvedValueOnce([{ id: 1, nomor_surat: '001/470/KS/06/2024' }]);
      const res = await request(app).get('/api/surat-keluar').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/surat-keluar/:id', () => {
    test('should return by id', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser);
      mockDb.get.mockResolvedValueOnce({ id: 1, nomor_surat: '001/470/KS/06/2024' });
      const res = await request(app).get('/api/surat-keluar/1').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
    });

    test('should return 404', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser);
      mockDb.get.mockResolvedValueOnce(undefined);
      const res = await request(app).get('/api/surat-keluar/999').set(authHeader(generateTestToken()));
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/surat-keluar', () => {
    test('should create as operator', async () => {
      mockDb.get.mockResolvedValueOnce(operatorUser);
      mockDb.get.mockResolvedValueOnce(undefined); // no duplicate
      mockDb.run.mockResolvedValueOnce({ lastInsertRowid: 1, changes: 1 });
      mockDb.get.mockResolvedValueOnce({ id: 1, nomor_surat: '001/470/KS/06/2024' });
      const res = await request(app).post('/api/surat-keluar').set(authHeader(generateTestToken({ id: 2, role: 'operator' })))
        .send({ nomor_surat: '001/470/KS/06/2024', tujuan_surat: 'Warga', perihal: 'Surat', tanggal_surat: '2024-06-11' });
      expect(res.status).toBe(201);
    });

    test('should reject non-operator', async () => {
      mockDb.get.mockResolvedValueOnce(kadesUser);
      const res = await request(app).post('/api/surat-keluar').set(authHeader(generateTestToken({ id: 3, role: 'kades' })))
        .send({ nomor_surat: '001/470/KS/06/2024', tujuan_surat: 'Warga', perihal: 'Surat', tanggal_surat: '2024-06-11' });
      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/surat-keluar/:id', () => {
    test('should update', async () => {
      mockDb.get.mockResolvedValueOnce(operatorUser);
      mockDb.get.mockResolvedValueOnce({ id: 1, nomor_surat: '001/470/KS/06/2024', lampiran: null });
      mockDb.run.mockResolvedValueOnce({ changes: 1 });
      mockDb.get.mockResolvedValueOnce({ id: 1, perihal: 'Updated' });
      const res = await request(app).put('/api/surat-keluar/1').set(authHeader(generateTestToken({ id: 2, role: 'operator' })))
        .send({ perihal: 'Updated' });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/surat-keluar/:id', () => {
    test('should delete as admin', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser);
      mockDb.get.mockResolvedValueOnce({ id: 1, perihal: 'Test', lampiran: null });
      const res = await request(app).delete('/api/surat-keluar/1').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
    });
  });
});