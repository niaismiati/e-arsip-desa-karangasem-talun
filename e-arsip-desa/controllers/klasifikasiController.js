const db = require('../config/database');
const { broadcast } = require('../utils/sse');

exports.getAll = async (req, res) => {
  try {
    const { search } = req.query;
    // Optimized: LEFT JOIN + GROUP BY instead of correlated subqueries
    let sql = `
      SELECT k.*,
        COALESCE(sm.total, 0) + COALESCE(sk.total, 0) as total_arsip
      FROM klasifikasi k
      LEFT JOIN (SELECT klasifikasi_id, COUNT(*) as total FROM surat_masuk GROUP BY klasifikasi_id) sm ON k.id = sm.klasifikasi_id
      LEFT JOIN (SELECT klasifikasi_id, COUNT(*) as total FROM surat_keluar GROUP BY klasifikasi_id) sk ON k.id = sk.klasifikasi_id
      WHERE 1=1
    `;
    const params = [];
    if (search) {
      sql += ` AND (k.kode LIKE ? OR k.nama LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ` ORDER BY k.kode ASC`;
    const rows = await db.all(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const row = await db.get('SELECT * FROM klasifikasi WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Klasifikasi tidak ditemukan.' });
    }
    res.json({ success: true, data: row });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { kode, nama, keterangan } = req.body;

    if (!kode || !nama) {
      return res.status(400).json({ success: false, message: 'Kode dan nama klasifikasi wajib diisi.' });
    }

    const existing = await db.get('SELECT * FROM klasifikasi WHERE kode = ?', [kode]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Kode klasifikasi sudah ada.' });
    }

    const result = await db.run(
      'INSERT INTO klasifikasi (kode, nama, keterangan) VALUES (?, ?, ?)',
      [kode, nama, keterangan || null]
    );

    const newRow = await db.get('SELECT * FROM klasifikasi WHERE id = ?', [result.lastInsertRowid]);

    await db.run(
      'INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)',
      [req.user.id, 'klasifikasi', `Menambahkan klasifikasi: ${kode} - ${nama}`]
    );

    broadcast('klasifikasi:created', newRow);

    res.status(201).json({ success: true, message: 'Klasifikasi berhasil ditambahkan.', data: newRow });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { kode, nama, keterangan } = req.body;

    const existing = await db.get('SELECT * FROM klasifikasi WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Klasifikasi tidak ditemukan.' });
    }

    if (kode && kode !== existing.kode) {
      const dup = await db.get('SELECT * FROM klasifikasi WHERE kode = ? AND id != ?', [kode, id]);
      if (dup) {
        return res.status(409).json({ success: false, message: 'Kode klasifikasi sudah digunakan.' });
      }
    }

    await db.run(
      `UPDATE klasifikasi
       SET kode = COALESCE(?, kode),
           nama = COALESCE(?, nama),
           keterangan = COALESCE(?, keterangan)
       WHERE id = ?`,
      [kode || null, nama || null, keterangan !== undefined ? keterangan : null, id]
    );

    const updated = await db.get('SELECT * FROM klasifikasi WHERE id = ?', [id]);

    await db.run(
      'INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)',
      [req.user.id, 'klasifikasi', `Memperbarui klasifikasi: ${updated.kode} - ${updated.nama}`]
    );

    broadcast('klasifikasi:updated', updated);

    res.json({ success: true, message: 'Klasifikasi berhasil diperbarui.', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.get('SELECT * FROM klasifikasi WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Klasifikasi tidak ditemukan.' });
    }

    const suratCount = await db.get('SELECT COUNT(*) as total FROM surat_masuk WHERE klasifikasi_id = ?', [id]);
    const keluarCount = await db.get('SELECT COUNT(*) as total FROM surat_keluar WHERE klasifikasi_id = ?', [id]);
    if (suratCount.total > 0 || keluarCount.total > 0) {
      return res.status(400).json({
        success: false,
        message: `Tidak dapat menghapus: klasifikasi digunakan oleh ${suratCount.total} surat masuk dan ${keluarCount.total} surat keluar.`
      });
    }

    await db.run('DELETE FROM klasifikasi WHERE id = ?', [id]);

    await db.run(
      'INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)',
      [req.user.id, 'klasifikasi', `Menghapus klasifikasi: ${existing.kode} - ${existing.nama}`]
    );

    broadcast('klasifikasi:deleted', { id: Number(id) });

    res.json({ success: true, message: 'Klasifikasi berhasil dihapus.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};
