const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { broadcast } = require('../utils/sse');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await db.all(
      `SELECT id, nama, email, role, status, avatar, created_at
       FROM users
       ORDER BY created_at DESC`
    );
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await db.get(
      `SELECT id, nama, email, role, status, avatar, created_at
       FROM users WHERE id = ?`,
      [req.params.id]
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createUser = async (req, res) => {
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

    const existing = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await db.run(
      'INSERT INTO users (nama, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      [nama, email, hashedPassword, role, 'Aktif']
    );

    const newUser = await db.get(
      'SELECT id, nama, email, role, status, created_at FROM users WHERE id = ?',
      [result.lastInsertRowid]
    );

    await db.run(
      'INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)',
      [req.user.id, 'users', `Menambahkan pengguna: ${nama} (${role})`]
    );

    broadcast('users:created', newUser);
    res.status(201).json({ success: true, message: 'Pengguna berhasil ditambahkan.', data: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, email, role, status } = req.body;

    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    if (email && email !== user.email) {
      const existing = await db.get('SELECT * FROM users WHERE email = ? AND id != ?', [email, id]);
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email sudah digunakan.' });
      }
    }

    await db.run(
      `UPDATE users
       SET nama = COALESCE(?, nama),
           email = COALESCE(?, email),
           role = COALESCE(?, role),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [nama || null, email || null, role || null, status || null, id]
    );

    const updated = await db.get(
      'SELECT id, nama, email, role, status, avatar, created_at FROM users WHERE id = ?',
      [id]
    );

    await db.run(
      'INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)',
      [req.user.id, 'users', `Memperbarui pengguna: ${updated.nama}`]
    );

    broadcast('users:updated', updated);
    res.json({ success: true, message: 'Pengguna berhasil diperbarui.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Tidak dapat menghapus akun sendiri.' });
    }

    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    const disposisiCount = await db.get(
      'SELECT COUNT(*) as total FROM disposisi WHERE dari_user_id = ? OR kepada_user_id = ?',
      [id, id]
    );
    if (disposisiCount.total > 0) {
      return res.status(400).json({
        success: false,
        message: `Tidak dapat menghapus: pengguna masih memiliki ${disposisiCount.total} disposisi terkait.`
      });
    }

    const aktivitasCount = await db.get('SELECT COUNT(*) as total FROM aktivitas WHERE user_id = ?', [id]);
    if (aktivitasCount.total > 0) {
      await db.run('UPDATE aktivitas SET user_id = NULL WHERE user_id = ?', [id]);
    }

    await db.run('DELETE FROM users WHERE id = ?', [id]);

    await db.run(
      'INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)',
      [req.user.id, 'users', `Menghapus pengguna: ${user.nama}`]
    );

    broadcast('users:deleted', { id: parseInt(id) });
    res.json({ success: true, message: 'Pengguna berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleActive = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Tidak dapat mengubah status akun sendiri.' });
    }

    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    const newStatus = user.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    await db.run('UPDATE users SET status = ? WHERE id = ?', [newStatus, id]);

    await db.run(
      'INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)',
      [req.user.id, 'users', `${newStatus === 'Aktif' ? 'Mengaktifkan' : 'Menonaktifkan'} pengguna: ${user.nama}`]
    );

    broadcast('users:toggle', { id: parseInt(id), status: newStatus });
    res.json({ success: true, message: `Pengguna berhasil ${newStatus === 'Aktif' ? 'diaktifkan' : 'dinonaktifkan'}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter.' });
    }

    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

    await db.run(
      'INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)',
      [req.user.id, 'users', `Mereset password pengguna: ${user.nama}`]
    );

    broadcast('users:password-changed', { id: parseInt(id) });
    res.json({ success: true, message: 'Password berhasil diubah.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
