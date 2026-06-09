const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { broadcast } = require('../utils/sse');

exports.getAll = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] }, order: [['created_at', 'DESC']] });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nama, username, password, role, jabatan, desa } = req.body;
    const existing = await User.findOne({ where: { username } });
    if (existing) return res.status(400).json({ message: 'Username sudah digunakan' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ nama, username, password: hashed, role, jabatan, desa: desa || 'Desa Karangasem', is_active: true });
    const { password: _, ...result } = user.toJSON();
    res.status(201).json(result);
    try { broadcast('pengguna', { action: 'create', data: result }); } catch (e) {}
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    const { password, ...data } = req.body;
    if (password) data.password = await bcrypt.hash(password, 10);
    await user.update(data);
    const { password: _, ...result } = user.toJSON();
    res.json(result);
    try { broadcast('pengguna', { action: 'update', data: result }); } catch (e) {}
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleActive = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    await user.update({ is_active: !user.is_active });
    res.json({ message: `User ${user.is_active ? 'diaktifkan' : 'dinonaktifkan'}`, is_active: user.is_active });
    try { broadcast('pengguna', { action: 'toggle', data: { id: user.id, is_active: user.is_active } }); } catch (e) {}
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
    if (user.id === req.user.id) return res.status(400).json({ message: 'Tidak dapat menghapus akun sendiri' });
    await user.destroy();
    res.json({ message: 'User berhasil dihapus' });
    try { broadcast('pengguna', { action: 'delete', data: { id: user.id } }); } catch (e) {}
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
