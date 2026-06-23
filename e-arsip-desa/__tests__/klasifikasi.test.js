require('./helpers/setup');
const request = require('supertest');
const express = require('express');
const { mockDb, generateTestToken, authHeader } = require('./helpers/setup');

const app = express();
app.use(express.json());
app.use('/api/klasifikasi', require('../routes/klasifikasiRoutes'));

const adminUser = { id: 1, nama: 'Admin', email: 'admin@test.com', role: 'admin', status: 'Aktif', avatar: null };

describe('Klasifikasi Routes', () => {
  describe('GET /api/klasifikasi', () => {
    test('should return all', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser);
      mockDb.all.mockResolvedValueOnce([{ id: 1, kode: '000', nama: 'Umum', total_arsip: 5 }]);
      const res = await request(app).get('/api/klasifikasi').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/klasifikasi/:id', () => {
    test('should return by id', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser);
      mockDb.get.mockResolvedValueOnce({ id: 1, kode: '000', nama: 'Umum' });
      const res = await request(app).get('/api/klasifikasi/1').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
      expect(res.body.data.kode).toBe('000');
    });

    test('should return 404', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser);
      mockDb.get.mockResolvedValueOnce(undefined);
      const res = await request(app).get('/api/klasifikasi/999').set(authHeader(generateTestToken()));
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/klasifikasi', () => {
    test('should create', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser); // verifyToken
      mockDb.get.mockResolvedValueOnce(undefined); // create: no duplicate kode
      mockDb.run.mockResolvedValueOnce({ lastInsertRowid: 2, changes: 1 }); // create: INSERT klasifikasi
      mockDb.get.mockResolvedValueOnce({ id: 2, kode: '001', nama: 'Baru', keterangan: null }); // create: fetch new
      mockDb.run.mockResolvedValueOnce({ lastInsertRowid: 1, changes: 1 }); // create: INSERT aktivitas
      const res = await request(app).post('/api/klasifikasi').set(authHeader(generateTestToken()))
        .send({ kode: '001', nama: 'Baru' });
      expect(res.status).toBe(201);
    });

    test('should reject duplicate', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser); // verifyToken
      mockDb.get.mockResolvedValueOnce({ id: 1, kode: '001', nama: 'Umum' }); // create: duplicate check found
      const res = await request(app).post('/api/klasifikasi').set(authHeader(generateTestToken()))
        .send({ kode: '001', nama: 'Baru' });
      expect(res.status).toBe(409);
    });
  });

  describe('PUT /api/klasifikasi/:id', () => {
    test('should update', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser); // verifyToken
      mockDb.get.mockResolvedValueOnce({ id: 1, kode: '000', nama: 'Umum', keterangan: null }); // update: exist check
      mockDb.run.mockResolvedValueOnce({ changes: 1 }); // update: UPDATE klasifikasi
      mockDb.get.mockResolvedValueOnce({ id: 1, kode: '000', nama: 'Updated', keterangan: null }); // update: fetch updated
      mockDb.run.mockResolvedValueOnce({ lastInsertRowid: 1, changes: 1 }); // update: INSERT aktivitas
      const res = await request(app).put('/api/klasifikasi/1').set(authHeader(generateTestToken()))
        .send({ nama: 'Updated' });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/klasifikasi/:id', () => {
    test('should delete if not in use', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser); // verifyToken
      mockDb.get.mockResolvedValueOnce({ id: 1, kode: '000', nama: 'Umum', keterangan: null }); // delete: exist check
      mockDb.get.mockResolvedValueOnce({ total: 0 }); // delete: surat_masuk count
      mockDb.get.mockResolvedValueOnce({ total: 0 }); // delete: surat_keluar count
      mockDb.run.mockResolvedValueOnce({ changes: 1 }); // delete: DELETE klasifikasi
      mockDb.run.mockResolvedValueOnce({ lastInsertRowid: 1, changes: 1 }); // delete: INSERT aktivitas
      const res = await request(app).delete('/api/klasifikasi/1').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
    });

    test('should reject if in use', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser); // verifyToken
      mockDb.get.mockResolvedValueOnce({ id: 1, kode: '000', nama: 'Umum', keterangan: null }); // delete: exist check
      mockDb.get.mockResolvedValueOnce({ total: 2 }); // delete: surat_masuk count
      mockDb.get.mockResolvedValueOnce({ total: 0 }); // delete: surat_keluar count
      const res = await request(app).delete('/api/klasifikasi/1').set(authHeader(generateTestToken()));
      expect(res.status).toBe(400);
    });
  });
});
