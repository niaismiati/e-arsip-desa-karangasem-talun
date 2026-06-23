const jwt = require('jsonwebtoken');

// Mock database
const mockDb = {
  pool: {},
  get: jest.fn(),
  all: jest.fn(),
  run: jest.fn().mockResolvedValue({ lastInsertRowid: 1, changes: 1 }),
  exec: jest.fn(),
};

jest.mock('../../config/database', () => mockDb);

// Mock JWT config
jest.mock('../../config/jwt', () => ({
  JWT_SECRET: 'test-secret-key-for-jwt-12345',
}));

// Mock multer
jest.mock('multer', () => {
  const multer = () => ({
    single: () => (req, res, next) => {
      req.file = undefined;
      next();
    },
    array: () => (req, res, next) => next(),
    fields: () => (req, res, next) => next(),
  });
  multer.diskStorage = () => ({});
  return multer;
});

// Mock SSE utils
jest.mock('../../utils/sse', () => ({
  broadcast: jest.fn(),
  addClient: jest.fn(),
}));

// Mock fs
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  unlinkSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  openSync: jest.fn().mockReturnValue(1),
  readSync: jest.fn(),
  closeSync: jest.fn(),
}));

// Generate a test token
function generateTestToken(overrides = {}) {
  const defaultUser = {
    id: 1,
    email: 'admin@test.com',
    role: 'admin',
    ...overrides,
  };
  return jwt.sign(defaultUser, 'test-secret-key-for-jwt-12345', { expiresIn: '7d' });
}

// Create auth header
function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  mockDb.get.mockReset();
  mockDb.all.mockReset();
  mockDb.run.mockReset();
  mockDb.run.mockResolvedValue({ lastInsertRowid: 1, changes: 1 });
});

// Helper: sets up default user mock for verifyToken middleware
function mockVerifyUser(user) {
  const defaultUser = user || {
    id: 1, nama: 'Admin', email: 'admin@test.com',
    role: 'admin', status: 'Aktif', avatar: null,
  };
  mockDb.get.mockResolvedValue(defaultUser);
  return defaultUser;
}

module.exports = {
  mockDb,
  generateTestToken,
  authHeader,
  mockVerifyUser,
};
