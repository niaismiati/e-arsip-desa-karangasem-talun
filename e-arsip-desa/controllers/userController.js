const bcrypt = require('bcryptjs');
const db = require('../config/database');

exports.getAllUsers = (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, nama, email, role, status, avatar, created_at
      FROM users
      ORDER BY created_at DESC
    `).all();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserById = (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, nama, email, role, status, avatar, created_at
      FROM users WHERE id = ?
    `).get(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createUser = (req, res) => {
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

    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (nama, email, password, role, status) VALUES (?, ?, ?, ?, ?)'
    ).run(nama, email, hashedPassword, role, 'Aktif');

    const newUser = db.prepare('SELECT id, nama, email, role, status, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

    db.prepare('INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)')
      .run(req.user.id, 'users', `Menambahkan pengguna: ${nama} (${role})`);

    res.status(201).json({ success: true, message: 'Pengguna berhasil ditambahkan.', data: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUser = (req, res) => {
  try {
    const { id } = req.params;
    const { nama, email, role, status } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    if (email && email !== user.email) {
      const existing = db.prepare('SELECT * FROM users WHERE email = ? AND id != ?').get(email, id);
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email sudah digunakan.' });
      }
    }

    db.prepare(`
      UPDATE users
      SET nama = COALESCE(?, nama),
          email = COALESCE(?, email),
          role = COALESCE(?, role),
          status = COALESCE(?, status)
      WHERE id = ?
    `).run(nama || null, email || null, role || null, status || null, id);

    const updated = db.prepare('SELECT id, nama, email, role, status, avatar, created_at FROM users WHERE id = ?').get(id);

    db.prepare('INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)')
      .run(req.user.id, 'users', `Memperbarui pengguna: ${updated.nama}`);

    res.json({ success: true, message: 'Pengguna berhasil diperbarui.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Tidak dapat menghapus akun sendiri.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    const disposisiCount = db.prepare('SELECT COUNT(*) as total FROM disposisi WHERE dari_user_id = ? OR kepada_user_id = ?').get(id, id);
    if (disposisiCount.total > 0) {
      return res.status(400).json({ success: false, message: `Tidak dapat menghapus: pengguna masih memiliki ${disposisiCount.total} disposisi terkait.` });
    }

    const aktivitasCount = db.prepare('SELECT COUNT(*) as total FROM aktivitas WHERE user_id = ?').get(id);
    if (aktivitasCount.total > 0) {
      db.prepare('UPDATE aktivitas SET user_id = NULL WHERE user_id = ?').run(id);
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    db.prepare('INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)')
      .run(req.user.id, 'users', `Menghapus pengguna: ${user.nama}`);

    res.json({ success: true, message: 'Pengguna berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleActive = (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Tidak dapat mengubah status akun sendiri.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    const newStatus = user.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(newStatus, id);

    db.prepare('INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)')
      .run(req.user.id, 'users', `${newStatus === 'Aktif' ? 'Mengaktifkan' : 'Menonaktifkan'} pengguna: ${user.nama}`);

    res.json({ success: true, message: `Pengguna berhasil ${newStatus === 'Aktif' ? 'diaktifkan' : 'dinonaktifkan'}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, id);

    db.prepare('INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)')
      .run(req.user.id, 'users', `Mereset password pengguna: ${user.nama}`);

    res.json({ success: true, message: 'Password berhasil diubah.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

