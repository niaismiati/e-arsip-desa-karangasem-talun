const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { broadcast } = require('../utils/sse');
const { JWT_SECRET } = require('../config/jwt');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

exports.register = async (req, res) => {
  try {
    const { nama, email, password, role } = req.body;

    if (!nama || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi.' });
    }

    if (!['admin', 'kades', 'operator'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role tidak valid.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter.' });
    }

    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (nama, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      [nama, email, hashedPassword, role, 'Aktif']
    );

    const user = await db.get('SELECT id, nama, email, role, status FROM users WHERE id = ?', [result.lastInsertRowid]);
    const token = generateToken(user);

    broadcast('users:created', user);
    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil.',
      data: { user, token }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
    }

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    if (user.status !== 'Aktif') {
      return res.status(403).json({ success: false, message: 'Akun tidak aktif. Hubungi admin.' });
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login berhasil.',
      data: { user: userWithoutPassword, token }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await db.get('SELECT id, nama, email, role, status, avatar FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};
