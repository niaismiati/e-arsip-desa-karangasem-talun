const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');

exports.login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const identifier = username || email;

    if (!identifier || !password)
      return res.status(400).json({ success: false, message: 'Username/email dan password wajib diisi' });

    const user = await User.findOne({ where: { [Op.or]: [{ username: identifier }, { email: identifier }] } });
    if (!user) return res.status(401).json({ success: false, message: 'Username atau password salah' });
    if (!user.is_active) return res.status(403).json({ success: false, message: 'Akun belum diaktifkan. Hubungi Administrator.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Username atau password salah' });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role, nama: user.nama },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil.',
      data: {
        token,
        user: { id: user.id, nama: user.nama, email: user.email, username: user.username, role: user.role, jabatan: user.jabatan, desa: user.desa }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { nama, username, email, password, jabatan, role, desa } = req.body;
    if (!nama || !password || !role)
      return res.status(400).json({ success: false, message: 'Nama, password, dan role wajib diisi' });

    const normalizedRole = role === 'kades' ? 'pimpinan' : role;
    if (!['operator', 'pimpinan'].includes(normalizedRole))
      return res.status(400).json({ success: false, message: 'Role tidak valid untuk pendaftaran mandiri' });

    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter.' });

    const identifier = username || email;
    if (identifier) {
      const existing = await User.findOne({ where: { [Op.or]: [{ username: identifier }, { email: identifier }] } });
      if (existing) return res.status(400).json({ success: false, message: 'Username/email sudah digunakan' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      nama, username: username || email, email, password: hashed, jabatan,
      role: normalizedRole, desa: desa || 'Desa Karangasem', is_active: false,
    });

    res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil. Akun menunggu persetujuan Administrator.',
      data: { user: { id: user.id, nama: user.nama, email: user.email, username: user.username, role: user.role } }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { password_lama, password_baru } = req.body;
    const user = await User.findByPk(req.user.id);
    const valid = await bcrypt.compare(password_lama, user.password);
    if (!valid) return res.status(400).json({ success: false, message: 'Password lama tidak sesuai' });
    user.password = await bcrypt.hash(password_baru, 10);
    await user.save();
    res.json({ success: true, message: 'Password berhasil diubah' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
