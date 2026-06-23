require('./helpers/setup');
const request = require('supertest');
const express = require('express');
const { mockDb, generateTestToken, authHeader } = require('./helpers/setup');

const app = express();
app.use(express.json());
app.use('/api/disposisi', require('../routes/disposisiRoutes'));

const adminUser = { id: 1, role: 'admin', status: 'Aktif' };
const operatorUser = { id: 2, role: 'operator', status: 'Aktif' };
const kadesUser = { id: 3, role: 'kades', status: 'Aktif' };

describe('Disposisi Routes', () => {
  describe('GET /api/disposisi', () => {
    test('should return paginated', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser);
      mockDb.get.mockResolvedValueOnce({ total: 1 });
      mockDb.all.mockResolvedValueOnce([{ id: 1, instruksi: 'Test' }]);
      const res = await request(app).get('/api/disposisi').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/disposisi/:id', () => {
    test('should return by id', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser);
      mockDb.get.mockResolvedValueOnce({ id: 1, instruksi: 'Mohon ditindaklanjuti' });
      const res = await request(app).get('/api/disposisi/1').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
      expect(res.body.data.instruksi).toBe('Mohon ditindaklanjuti');
    });

    test('should return 404', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser);
      mockDb.get.mockResolvedValueOnce(undefined);
      const res = await request(app).get('/api/disposisi/999').set(authHeader(generateTestToken()));
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/disposisi', () => {
    test('should create as operator', async () => {
      mockDb.get.mockResolvedValueOnce(operatorUser);
      mockDb.get.mockResolvedValueOnce({ id: 1, status: 'Belum Disposisi' }); // surat exists
      mockDb.get.mockResolvedValueOnce({ id: 3, nama: 'Kades' }); // target exists
      mockDb.run.mockResolvedValueOnce({ lastInsertRowid: 1, changes: 1 });
      mockDb.get.mockResolvedValueOnce({ id: 1, instruksi: 'Mohon ditindaklanjuti' });
      const res = await request(app).post('/api/disposisi').set(authHeader(generateTestToken({ id: 2, role: 'operator' })))
        .send({ surat_masuk_id: 1, kepada_user_id: 3, instruksi: 'Mohon ditindaklanjuti' });
      expect(res.status).toBe(201);
    });

    test('should reject non-operator', async () => {
      mockDb.get.mockResolvedValueOnce(kadesUser);
      const res = await request(app).post('/api/disposisi').set(authHeader(generateTestToken({ id: 3, role: 'kades' })))
        .send({ surat_masuk_id: 1, kepada_user_id: 2, instruksi: 'Test' });
      expect(res.status).toBe(403);
    });

    test('should reject missing fields', async () => {
      mockDb.get.mockResolvedValueOnce(operatorUser);
      const res = await request(app).post('/api/disposisi').set(authHeader(generateTestToken({ id: 2, role: 'operator' })))
        .send({ instruksi: 'Test' });
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/disposisi/:id/approve', () => {
    test('should approve as kades', async () => {
      mockDb.get.mockResolvedValueOnce(kadesUser);
      mockDb.get.mockResolvedValueOnce({ id: 1, surat_masuk_id: 1, kepada_user_id: 3, dari_user_id: 2, status: 'Menunggu' });
      const res = await request(app).patch('/api/disposisi/1/approve').set(authHeader(generateTestToken({ id: 3, role: 'kades' })))
        .send({ catatan: 'Setuju' });
      expect(res.status).toBe(200);
    });

    test('should reject non-kades', async () => {
      mockDb.get.mockResolvedValueOnce(operatorUser);
      const res = await request(app).patch('/api/disposisi/1/approve').set(authHeader(generateTestToken({ id: 2, role: 'operator' })));
      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/disposisi/:id/reject', () => {
    test('should reject as kades', async () => {
      mockDb.get.mockResolvedValueOnce(kadesUser);
      mockDb.get.mockResolvedValueOnce({ id: 1, surat_masuk_id: 1, kepada_user_id: 3, dari_user_id: 2, status: 'Menunggu' });
      mockDb.get.mockResolvedValueOnce({ total: 0 });
      const res = await request(app).patch('/api/disposisi/1/reject').set(authHeader(generateTestToken({ id: 3, role: 'kades' })));
      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /api/disposisi/:id/selesai', () => {
    test('should complete as admin', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser);
      mockDb.get.mockResolvedValueOnce({ id: 1, surat_masuk_id: 1, kepada_user_id: 2, dari_user_id: 1, status: 'Disetujui' });
      const res = await request(app).patch('/api/disposisi/1/selesai').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/disposisi/:id', () => {
    test('should delete as admin', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser);
      mockDb.get.mockResolvedValueOnce({ id: 1, surat_masuk_id: 1, status: 'Menunggu' });
      mockDb.get.mockResolvedValueOnce({ total: 0 });
      const res = await request(app).delete('/api/disposisi/1').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
    });
  });
});