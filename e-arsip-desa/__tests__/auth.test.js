require('./helpers/setup');
const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const { mockDb, generateTestToken, authHeader } = require('./helpers/setup');

const app = express();
app.use(express.json());
app.use('/api/auth', require('../routes/authRoutes'));

describe('Auth Routes', () => {
  const adminToken = generateTestToken();
  const adminAuth = authHeader(adminToken);

  describe('POST /api/auth/register (admin only)', () => {
    const validUser = { nama: 'Test User', email: 'test@test.com', password: 'password123', role: 'operator' };

    beforeEach(() => {
      // verifyToken + checkRole middleware: first get call resolves user
      mockDb.get.mockReset();
      mockDb.get.mockResolvedValue({ id: 1, nama: 'Admin', email: 'admin@test.com', role: 'admin', status: 'Aktif', avatar: null });
      mockDb.run.mockResolvedValue({ lastInsertRowid: 2, changes: 1 });
    });

    test('should register a new user successfully', async () => {
      mockDb.get.mockReset();
      // verifyToken check
      mockDb.get.mockResolvedValueOnce({ id: 1, nama: 'Admin', email: 'admin@test.com', role: 'admin', status: 'Aktif', avatar: null });
      // check existing email
      mockDb.get.mockResolvedValueOnce(undefined);
      // after insert get
      mockDb.get.mockResolvedValueOnce({ id: 2, nama: 'Test User', email: 'test@test.com', role: 'operator', status: 'Aktif' });

      const res = await request(app).post('/api/auth/register').set(adminAuth).send(validUser);
      expect(res.status).toBe(201);
      expect(res.body.data.token).toBeDefined();
    });

    test('should reject missing fields', async () => {
      const res = await request(app).post('/api/auth/register').set(adminAuth).send({ nama: 'Test' });
      expect(res.status).toBe(400);
    });

    test('should reject invalid role', async () => {
      const res = await request(app).post('/api/auth/register').set(adminAuth).send({ ...validUser, role: 'superadmin' });
      expect(res.status).toBe(400);
    });

    test('should reject short password', async () => {
      const res = await request(app).post('/api/auth/register').set(adminAuth).send({ ...validUser, password: '12345' });
      expect(res.status).toBe(400);
    });

    test('should reject duplicate email', async () => {
      mockDb.get.mockReset();
      mockDb.get.mockResolvedValueOnce({ id: 1, nama: 'Admin', email: 'admin@test.com', role: 'admin', status: 'Aktif', avatar: null });
      mockDb.get.mockResolvedValueOnce({ id: 1, email: 'test@test.com' });
      const res = await request(app).post('/api/auth/register').set(adminAuth).send(validUser);
      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/auth/login (unprotected)', () => {
    const hashedPassword = bcrypt.hashSync('password123', 10);

    test('should login successfully', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, nama: 'Admin', email: 'admin@test.com', password: hashedPassword, role: 'admin', status: 'Aktif' });
      const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'password123' });
      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    test('should reject wrong password', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 1, email: 'admin@test.com', password: hashedPassword, role: 'admin', status: 'Aktif' });
      const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'wrong' });
      expect(res.status).toBe(401);
    });

    test('should reject non-existent email', async () => {
      mockDb.get.mockResolvedValueOnce(undefined);
      const res = await request(app).post('/api/auth/login').send({ email: 'x@y.com', password: 'password123' });
      expect(res.status).toBe(401);
    });

    test('should reject inactive account', async () => {
      mockDb.get.mockResolvedValueOnce({ id: 2, email: 'non@test.com', password: hashedPassword, role: 'operator', status: 'Nonaktif' });
      const res = await request(app).post('/api/auth/login').send({ email: 'non@test.com', password: 'password123' });
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/auth/me (protected)', () => {
    test('should return current user data', async () => {
      // verifyToken calls db.get, then controller calls db.get
      mockDb.get.mockResolvedValue({ id: 1, nama: 'Admin', email: 'admin@test.com', role: 'admin', status: 'Aktif' });
      const res = await request(app).get('/api/auth/me').set(authHeader(generateTestToken()));
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('admin@test.com');
    });

    test('should reject without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});