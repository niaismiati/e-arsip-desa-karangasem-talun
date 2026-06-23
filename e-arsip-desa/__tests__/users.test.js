require('./helpers/setup');
const request = require('supertest');
const express = require('express');
const { mockDb, generateTestToken, authHeader } = require('./helpers/setup');

const app = express();
app.use(express.json());
app.use('/api/users', require('../routes/userRoutes'));

describe('User Routes', () => {
  const adminToken = generateTestToken({ id: 1, role: 'admin' });
  const operatorToken = generateTestToken({ id: 2, role: 'operator' });

  describe('GET /api/users', () => {
    test('should return all users', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, nama: 'Admin', email: 'admin@test.com', role: 'admin', status: 'Aktif', avatar: null }); // verifyToken
      mockDb.all.mockResolvedValueOnce([
        { id: 1, nama: 'Admin', email: 'admin@test.com', role: 'admin', status: 'Aktif' },
      ]);
      const res = await request(app).get('/api/users').set(authHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    test('should reject without token', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/users/:id', () => {
    test('should return user by id', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, nama: 'Admin', email: 'admin@test.com', role: 'admin', status: 'Aktif', avatar: null }); // verifyToken
      mockDb.get.mockResolvedValueOnce({ id: 1, nama: 'Admin', email: 'admin@test.com', role: 'admin', status: 'Aktif', avatar: null, created_at: '2024-01-01' }); // getUserById
      const res = await request(app).get('/api/users/1').set(authHeader(adminToken));
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('admin@test.com');
    });

    test('should return 404 if not found', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, nama: 'Admin', email: 'admin@test.com', role: 'admin', status: 'Aktif', avatar: null }); // verifyToken
      mockDb.get.mockResolvedValueOnce(undefined); // getUserById
      const res = await request(app).get('/api/users/999').set(authHeader(adminToken));
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/users', () => {
    test('should create user as admin', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, nama: 'Admin', email: 'admin@test.com', role: 'admin', status: 'Aktif', avatar: null }); // verifyToken
      mockDb.get.mockResolvedValueOnce(undefined); // createUser: no duplicate email
      mockDb.run.mockResolvedValueOnce({ lastInsertRowid: 3, changes: 1 }); // createUser: INSERT users
      mockDb.get.mockResolvedValueOnce({ id: 3, nama: 'New', email: 'new@test.com', role: 'operator', status: 'Aktif', created_at: '2024-01-01' }); // createUser: fetch new user
      mockDb.run.mockResolvedValueOnce({ lastInsertRowid: 1, changes: 1 }); // createUser: INSERT aktivitas

      const res = await request(app).post('/api/users').set(authHeader(adminToken))
        .send({ nama: 'New', email: 'new@test.com', password: 'password123', role: 'operator' });
      expect(res.status).toBe(201);
    });

    test('should reject non-admin', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 2, nama: 'Operator', email: 'operator@test.com', role: 'operator', status: 'Aktif', avatar: null }); // verifyToken
      const res = await request(app).post('/api/users').set(authHeader(operatorToken))
        .send({ nama: 'New', email: 'new@test.com', password: 'password123', role: 'operator' });
      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/users/:id', () => {
    test('should update user', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, nama: 'Admin', email: 'admin@test.com', role: 'admin', status: 'Aktif', avatar: null }); // verifyToken
      mockDb.get.mockResolvedValueOnce({ id: 1, nama: 'Admin', email: 'admin@test.com', role: 'admin', status: 'Aktif' }); // updateUser: exist check
      mockDb.run.mockResolvedValueOnce({ changes: 1 }); // updateUser: UPDATE users
      mockDb.get.mockResolvedValueOnce({ id: 1, nama: 'Updated', email: 'admin@test.com', role: 'admin', status: 'Aktif', avatar: null, created_at: '2024-01-01' }); // updateUser: fetch updated
      mockDb.run.mockResolvedValueOnce({ lastInsertRowid: 1, changes: 1 }); // updateUser: INSERT aktivitas

      const res = await request(app).put('/api/users/1').set(authHeader(adminToken))
        .send({ nama: 'Updated' });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/users/:id', () => {
    test('should delete user', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, nama: 'Admin', email: 'admin@test.com', role: 'admin', status: 'Aktif', avatar: null }); // verifyToken
      mockDb.get.mockResolvedValueOnce({ id: 2, nama: 'Operator', email: 'operator@test.com', role: 'operator', status: 'Aktif' }); // deleteUser: exists check
      mockDb.get.mockResolvedValueOnce({ total: 0 }); // deleteUser: disposisi count
      mockDb.get.mockResolvedValueOnce({ total: 0 }); // deleteUser: aktivitas count
      mockDb.run.mockResolvedValueOnce({ changes: 1 }); // deleteUser: DELETE users
      mockDb.run.mockResolvedValueOnce({ lastInsertRowid: 1, changes: 1 }); // deleteUser: INSERT aktivitas

      const res = await request(app).delete('/api/users/2').set(authHeader(adminToken));
      expect(res.status).toBe(200);
    });

    test('should not allow deleting self', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, nama: 'Admin', email: 'admin@test.com', role: 'admin', status: 'Aktif', avatar: null }); // verifyToken
      const res = await request(app).delete('/api/users/1').set(authHeader(adminToken));
      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/users/:id/toggle-active', () => {
    test('should toggle user status', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, nama: 'Admin', email: 'admin@test.com', role: 'admin', status: 'Aktif', avatar: null }); // verifyToken
      mockDb.get.mockResolvedValueOnce({ id: 2, nama: 'Operator', email: 'operator@test.com', role: 'operator', status: 'Aktif' }); // toggleActive: exist check
      mockDb.run.mockResolvedValueOnce({ changes: 1 }); // toggleActive: UPDATE status
      mockDb.run.mockResolvedValueOnce({ lastInsertRowid: 1, changes: 1 }); // toggleActive: INSERT aktivitas

      const res = await request(app).patch('/api/users/2/toggle-active').set(authHeader(adminToken));
      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /api/users/:id/password', () => {
    test('should change password', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, nama: 'Admin', email: 'admin@test.com', role: 'admin', status: 'Aktif', avatar: null }); // verifyToken
      mockDb.get.mockResolvedValueOnce({ id: 2, nama: 'Operator', email: 'operator@test.com', role: 'operator', status: 'Aktif' }); // changePassword: exist check
      mockDb.run.mockResolvedValueOnce({ changes: 1 }); // changePassword: UPDATE password
      mockDb.run.mockResolvedValueOnce({ lastInsertRowid: 1, changes: 1 }); // changePassword: INSERT aktivitas

      const res = await request(app).patch('/api/users/2/password').set(authHeader(adminToken))
        .send({ password: 'newpassword123' });
      expect(res.status).toBe(200);
    });

    test('should reject short password', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, nama: 'Admin', email: 'admin@test.com', role: 'admin', status: 'Aktif', avatar: null }); // verifyToken
      const res = await request(app).patch('/api/users/2/password').set(authHeader(adminToken))
        .send({ password: '12345' });
      expect(res.status).toBe(400);
    });
  });
});
