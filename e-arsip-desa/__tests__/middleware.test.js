require('./helpers/setup');
const request = require('supertest');
const express = require('express');
const { mockDb, generateTestToken, authHeader } = require('./helpers/setup');

// Create a simple test app that uses the middleware
const app = express();
app.use(express.json());

const { verifyToken, checkRole } = require('../middleware/auth');

app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ success: true, data: req.user });
});

app.get('/api/admin-only', verifyToken, checkRole(['admin']), (req, res) => {
  res.json({ success: true, data: req.user });
});

app.get('/api/kades-only', verifyToken, checkRole(['kades']), (req, res) => {
  res.json({ success: true, data: req.user });
});

describe('Auth Middleware', () => {
  beforeEach(() => {
    // Reset and use mockImplementation to return user based on token
    mockDb.get.mockImplementation((sql, params) => {
      // Default return admin user
      return Promise.resolve({
        id: 1, nama: 'Admin', email: 'admin@test.com', role: 'admin', status: 'Aktif',
      });
    });
  });
  describe('verifyToken', () => {
    test('should pass with valid token', async () => {
      const token = generateTestToken({ id: 1, role: 'admin' });
      const res = await request(app)
        .get('/api/protected')
        .set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(1);
      expect(res.body.data.role).toBe('admin');
    });

    test('should reject without token', async () => {
      const res = await request(app).get('/api/protected');
      expect(res.status).toBe(401);
    });

    test('should reject with invalid token', async () => {
      const res = await request(app)
        .get('/api/protected')
        .set(authHeader('invalid-token'));

      expect(res.status).toBe(401);
    });

    test('should reject with malformed auth header', async () => {
      const res = await request(app)
        .get('/api/protected')
        .set({ Authorization: 'Basic token123' });

      expect(res.status).toBe(401);
    });
  });

  describe('checkRole', () => {
    test('should allow access for correct role', async () => {
      const token = generateTestToken({ id: 1, role: 'admin' });
      const res = await request(app)
        .get('/api/admin-only')
        .set(authHeader(token));

      expect(res.status).toBe(200);
    });

    test('should deny access for wrong role', async () => {
      mockDb.get.mockImplementation(() => Promise.resolve({
        id: 2, nama: 'Operator', email: 'operator@test.com', role: 'operator', status: 'Aktif',
      }));
      const token = generateTestToken({ id: 2, role: 'operator' });
      const res = await request(app)
        .get('/api/admin-only')
        .set(authHeader(token));

      expect(res.status).toBe(403);
    });

    test('should deny access for kades to admin endpoint', async () => {
      mockDb.get.mockImplementation(() => Promise.resolve({
        id: 3, nama: 'Kades', email: 'kades@test.com', role: 'kades', status: 'Aktif',
      }));
      const token = generateTestToken({ id: 3, role: 'kades' });
      const res = await request(app)
        .get('/api/admin-only')
        .set(authHeader(token));

      expect(res.status).toBe(403);
    });

    test('should allow kades to kades endpoint', async () => {
      mockDb.get.mockImplementation(() => Promise.resolve({
        id: 3, nama: 'Kades', email: 'kades@test.com', role: 'kades', status: 'Aktif',
      }));
      const token = generateTestToken({ id: 3, role: 'kades' });
      const res = await request(app)
        .get('/api/kades-only')
        .set(authHeader(token));

      expect(res.status).toBe(200);
    });
  });
});