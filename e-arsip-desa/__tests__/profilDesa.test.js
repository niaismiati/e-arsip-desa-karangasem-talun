require('./helpers/setup');
const request = require('supertest');
const express = require('express');
const { mockDb, generateTestToken, authHeader } = require('./helpers/setup');

const app = express();
app.use(express.json());
app.use('/api/profil-desa', require('../routes/profilDesaRoutes'));

const adminUser = { id: 1, role: 'admin', status: 'Aktif' };
const operatorUser = { id: 2, role: 'operator', status: 'Aktif' };

const mockProfil = {
  id: 1, nama_desa: 'Desa Karangasem', kecamatan: 'Talun',
  kabupaten: 'Pekalongan', provinsi: 'Jawa Tengah', kode_desa: '33.26.05.2009',
  alamat: 'Jl. Karangasem Talun', telepon: '(0285) 123456',
  email: 'desa@karangasem.desa.id', logo: null,
  inisial_desa: 'KS', kode_surat_default: '470', pemisah: '/', panjang_nomor: 3,
};

describe('Profil Desa Routes', () => {
  describe('GET /api/profil-desa', () => {
    test('should return profil desa', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser); // verifyToken
      mockDb.get.mockResolvedValueOnce(mockProfil);
      const res = await request(app).get('/api/profil-desa').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
      expect(res.body.data.nama_desa).toBe('Desa Karangasem');
    });

    test('should return 404 if not found', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser);
      mockDb.get.mockResolvedValueOnce(undefined);
      const res = await request(app).get('/api/profil-desa').set(authHeader(generateTestToken()));
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/profil-desa', () => {
    test('should update as admin', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser); // verifyToken
      mockDb.get.mockResolvedValueOnce(mockProfil);
      mockDb.run.mockResolvedValueOnce({ changes: 1 });
      mockDb.get.mockResolvedValueOnce({ ...mockProfil, nama_desa: 'Updated' });
      const res = await request(app).put('/api/profil-desa').set(authHeader(generateTestToken()))
        .send({ nama_desa: 'Updated' });
      expect(res.status).toBe(200);
    });

    test('should reject non-admin', async () => {
      mockDb.get.mockResolvedValueOnce(operatorUser); // verifyToken
      const res = await request(app).put('/api/profil-desa').set(authHeader(generateTestToken({ id: 2, role: 'operator' })))
        .send({ nama_desa: 'Update' });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/profil-desa/format-nomor', () => {
    test('should return format nomor', async () => {
      mockDb.get.mockResolvedValueOnce(adminUser);
      mockDb.get.mockResolvedValueOnce(mockProfil);
      const res = await request(app).get('/api/profil-desa/format-nomor').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
      expect(res.body.data.preview).toContain('KS');
    });
  });
});