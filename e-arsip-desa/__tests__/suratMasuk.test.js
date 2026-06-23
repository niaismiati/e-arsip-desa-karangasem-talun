require('./helpers/setup');
const request = require('supertest');
const express = require('express');
const { mockDb, generateTestToken, authHeader } = require('./helpers/setup');

const app = express();
app.use(express.json());
app.use('/api/surat-masuk', require('../routes/suratMasukRoutes'));

const adminUser = { id: 1, role: 'admin', status: 'Aktif' };
const operatorUser = { id: 2, role: 'operator', status: 'Aktif' };
const kadesUser = { id: 3, role: 'kades', status: 'Aktif' };

describe('Surat Masuk Routes', () => {
  describe('GET /api/surat-masuk', () => {
    test('should return paginated surat masuk', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser); // verifyToken
      mockDb.get.mockResolvedValueOnce({ total: 1 }); // count query
      mockDb.all.mockResolvedValueOnce([{ id: 1, nomor_surat: '005/123/PMD/VI/2024' }]);
      const res = await request(app).get('/api/surat-masuk').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
    });
  });

  describe('GET /api/surat-masuk/:id', () => {
    test('should return by id', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser); // verifyToken
      mockDb.get.mockResolvedValueOnce({ id: 1, nomor_surat: '005/123/PMD/VI/2024' });
      const res = await request(app).get('/api/surat-masuk/1').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
      expect(res.body.data.nomor_surat).toBe('005/123/PMD/VI/2024');
    });

    test('should return 404', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser);
      mockDb.get.mockResolvedValueOnce(undefined);
      const res = await request(app).get('/api/surat-masuk/999').set(authHeader(generateTestToken()));
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/surat-masuk', () => {
    test('should create as operator', async () => {
      mockDb.get.mockResolvedValueOnce(operatorUser); // verifyToken
      mockDb.get.mockResolvedValueOnce(undefined); // no duplicate
      mockDb.run.mockResolvedValueOnce({ lastInsertRowid: 1, changes: 1 });
      mockDb.get.mockResolvedValueOnce({ id: 1, nomor_surat: '005/123/PMD/VI/2024' });
      const res = await request(app).post('/api/surat-masuk').set(authHeader(generateTestToken({ id: 2, role: 'operator' })))
        .send({ nomor_surat: '005/123/PMD/VI/2024', asal_surat: 'Dinas PMD', perihal: 'Undangan', tanggal_surat: '2024-06-12', tanggal_terima: '2024-06-12' });
      expect(res.status).toBe(201);
    });

    test('should reject non-operator', async () => {
      mockDb.get.mockResolvedValueOnce(kadesUser); // verifyToken
      const res = await request(app).post('/api/surat-masuk').set(authHeader(generateTestToken({ id: 3, role: 'kades' })))
        .send({ nomor_surat: '005/123/PMD/VI/2024', asal_surat: 'Dinas PMD', perihal: 'Undangan', tanggal_surat: '2024-06-12', tanggal_terima: '2024-06-12' });
      expect(res.status).toBe(403);
    });

    test('should reject duplicate nomor surat', async () => {
      mockDb.get.mockResolvedValueOnce(operatorUser); // verifyToken
      mockDb.get.mockResolvedValueOnce({ id: 1 }); // duplicate found
      const res = await request(app).post('/api/surat-masuk').set(authHeader(generateTestToken({ id: 2, role: 'operator' })))
        .send({ nomor_surat: '005/123/PMD/VI/2024', asal_surat: 'Dinas PMD', perihal: 'Undangan', tanggal_surat: '2024-06-12', tanggal_terima: '2024-06-12' });
      expect(res.status).toBe(409);
    });
  });

  describe('PUT /api/surat-masuk/:id', () => {
    test('should update surat masuk', async () => {
      mockDb.get.mockResolvedValueOnce(operatorUser); // verifyToken
      mockDb.get.mockResolvedValueOnce({ id: 1, nomor_surat: '005/123/PMD/VI/2024', lampiran: null });
      mockDb.run.mockResolvedValueOnce({ changes: 1 });
      mockDb.get.mockResolvedValueOnce({ id: 1, perihal: 'Updated' });
      const res = await request(app).put('/api/surat-masuk/1').set(authHeader(generateTestToken({ id: 2, role: 'operator' })))
        .send({ perihal: 'Updated' });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/surat-masuk/:id', () => {
    test('should delete as admin', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser); // verifyToken
      mockDb.get.mockResolvedValueOnce({ id: 1, perihal: 'Test', lampiran: null });
      const res = await request(app).delete('/api/surat-masuk/1').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
    });

    test('should reject non-admin', async () => {
      mockDb.get.mockResolvedValueOnce(operatorUser); // verifyToken
      const res = await request(app).delete('/api/surat-masuk/1').set(authHeader(generateTestToken({ id: 2, role: 'operator' })));
      expect(res.status).toBe(403);
    });
  });
});