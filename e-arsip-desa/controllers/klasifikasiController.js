const db = require('../config/database');

exports.getAll = (req, res) => {
  try {
    const { search } = req.query;
    let sql = `
      SELECT k.*,
        (SELECT COUNT(*) FROM surat_masuk WHERE klasifikasi_id = k.id) + 
        (SELECT COUNT(*) FROM surat_keluar WHERE klasifikasi_id = k.id) as total_arsip
      FROM klasifikasi k
      WHERE 1=1
    `;
    const params = [];
    if (search) {
      sql += ` AND (k.kode LIKE ? OR k.nama LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ` ORDER BY k.kode ASC`;
    const rows = db.prepare(sql).all(...params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM klasifikasi WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Klasifikasi tidak ditemukan.' });
    }
    res.json({ success: true, data: row });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = (req, res) => {
  try {
    const { kode, nama, keterangan } = req.body;

    if (!kode || !nama) {
      return res.status(400).json({ success: false, message: 'Kode dan nama klasifikasi wajib diisi.' });
    }

    const existing = db.prepare('SELECT * FROM klasifikasi WHERE kode = ?').get(kode);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Kode klasifikasi sudah ada.' });
    }

    const result = db.prepare(
      'INSERT INTO klasifikasi (kode, nama, keterangan) VALUES (?, ?, ?)'
    ).run(kode, nama, keterangan || null);

    const newRow = db.prepare('SELECT * FROM klasifikasi WHERE id = ?').get(result.lastInsertRowid);

    db.prepare('INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)')
      .run(req.user.id, 'klasifikasi', `Menambahkan klasifikasi: ${kode} - ${nama}`);

    res.status(201).json({ success: true, message: 'Klasifikasi berhasil ditambahkan.', data: newRow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const { kode, nama, keterangan } = req.body;

    const existing = db.prepare('SELECT * FROM klasifikasi WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Klasifikasi tidak ditemukan.' });
    }

    if (kode && kode !== existing.kode) {
      const dup = db.prepare('SELECT * FROM klasifikasi WHERE kode = ? AND id != ?').get(kode, id);
      if (dup) {
        return res.status(409).json({ success: false, message: 'Kode klasifikasi sudah digunakan.' });
      }
    }

    db.prepare(`
      UPDATE klasifikasi
      SET kode = COALESCE(?, kode),
          nama = COALESCE(?, nama),
          keterangan = COALESCE(?, keterangan)
      WHERE id = ?
    `).run(kode || null, nama || null, keterangan !== undefined ? keterangan : null, id);

    const updated = db.prepare('SELECT * FROM klasifikasi WHERE id = ?').get(id);

    db.prepare('INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)')
      .run(req.user.id, 'klasifikasi', `Memperbarui klasifikasi: ${updated.kode} - ${updated.nama}`);

    res.json({ success: true, message: 'Klasifikasi berhasil diperbarui.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM klasifikasi WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Klasifikasi tidak ditemukan.' });
    }

    const suratCount = db.prepare('SELECT COUNT(*) as total FROM surat_masuk WHERE klasifikasi_id = ?').get(id);
    const keluarCount = db.prepare('SELECT COUNT(*) as total FROM surat_keluar WHERE klasifikasi_id = ?').get(id);
    if (suratCount.total > 0 || keluarCount.total > 0) {
      return res.status(400).json({ success: false, message: `Tidak dapat menghapus: klasifikasi digunakan oleh ${suratCount.total} surat masuk dan ${keluarCount.total} surat keluar.` });
    }

    db.prepare('DELETE FROM klasifikasi WHERE id = ?').run(id);

    db.prepare('INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)')
      .run(req.user.id, 'klasifikasi', `Menghapus klasifikasi: ${existing.kode} - ${existing.nama}`);

    res.json({ success: true, message: 'Klasifikasi berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

