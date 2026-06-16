const db = require('../config/database');
const { broadcast } = require('../utils/sse');
const fs = require('fs');
const path = require('path');

exports.getAll = async (req, res) => {
  try {
    const { search, klasifikasi, status, asal, page, limit } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = '';
    const params = [];
    const countParams = [];

    if (search) {
      whereClause += ` AND (sm.perihal LIKE ? OR sm.asal_surat LIKE ? OR sm.nomor_surat LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (klasifikasi) {
      whereClause += ` AND sm.klasifikasi_id = ?`;
      params.push(klasifikasi);
      countParams.push(klasifikasi);
    }
    if (status) {
      whereClause += ` AND sm.status = ?`;
      params.push(status);
      countParams.push(status);
    }
    if (asal) {
      whereClause += ` AND sm.asal_surat LIKE ?`;
      params.push(`%${asal}%`);
      countParams.push(`%${asal}%`);
    }

    const countResult = await db.get(
      `SELECT COUNT(*) as total FROM surat_masuk sm WHERE 1=1 ${whereClause}`,
      countParams
    );
    const total = countResult.total;

    const sql = `
      SELECT sm.*, k.kode as klasifikasi_kode, k.nama as klasifikasi_nama
      FROM surat_masuk sm
      LEFT JOIN klasifikasi k ON sm.klasifikasi_id = k.id
      WHERE 1=1 ${whereClause}
      ORDER BY sm.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(limitNum, offset);

    const rows = await db.all(sql, params);
    res.json({
      success: true,
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const row = await db.get(`
      SELECT sm.*, k.kode as klasifikasi_kode, k.nama as klasifikasi_nama
      FROM surat_masuk sm
      LEFT JOIN klasifikasi k ON sm.klasifikasi_id = k.id
      WHERE sm.id = ?
    `, [req.params.id]);

    if (!row) {
      return res.status(404).json({ success: false, message: 'Surat masuk tidak ditemukan.' });
    }

    res.json({ success: true, data: row });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nomor_surat, asal_surat, perihal, tanggal_surat, tanggal_terima, klasifikasi_id, status } = req.body;

    if (!nomor_surat || !asal_surat || !perihal || !tanggal_surat || !tanggal_terima) {
      return res.status(400).json({ success: false, message: 'Field wajib: nomor_surat, asal_surat, perihal, tanggal_surat, tanggal_terima.' });
    }

    const dup = await db.get('SELECT id FROM surat_masuk WHERE nomor_surat = ?', [nomor_surat]);
    if (dup) {
      return res.status(409).json({ success: false, message: 'Nomor surat sudah digunakan.' });
    }

    const lampiran = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await db.run(
      `INSERT INTO surat_masuk (nomor_surat, asal_surat, perihal, tanggal_surat, tanggal_terima, klasifikasi_id, status, lampiran)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nomor_surat, asal_surat, perihal, tanggal_surat, tanggal_terima, klasifikasi_id || null, status || 'Belum Disposisi', lampiran]
    );

    const newRow = await db.get(`
      SELECT sm.*, k.kode as klasifikasi_kode, k.nama as klasifikasi_nama
      FROM surat_masuk sm
      LEFT JOIN klasifikasi k ON sm.klasifikasi_id = k.id
      WHERE sm.id = ?
    `, [result.lastInsertRowid]);

    await db.run(
      'INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)',
      [req.user.id, 'surat_masuk', `Menambahkan surat masuk: ${perihal}`]
    );

    broadcast('surat-masuk:created', newRow);
    res.status(201).json({ success: true, message: 'Surat masuk berhasil ditambahkan.', data: newRow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nomor_surat, asal_surat, perihal, tanggal_surat, tanggal_terima, klasifikasi_id, status } = req.body;

    const existing = await db.get('SELECT * FROM surat_masuk WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Surat masuk tidak ditemukan.' });
    }

    const lampiran = req.file ? `/uploads/${req.file.filename}` : existing.lampiran;

    if (req.file && existing.lampiran) {
      const oldPath = path.join(__dirname, '..', existing.lampiran);
      try { fs.unlinkSync(oldPath); } catch {}
    }

    await db.run(
      `UPDATE surat_masuk
       SET nomor_surat = ?, asal_surat = ?, perihal = ?,
           tanggal_surat = ?, tanggal_terima = ?,
           klasifikasi_id = ?, status = ?, lampiran = ?
       WHERE id = ?`,
      [nomor_surat, asal_surat, perihal, tanggal_surat, tanggal_terima,
       klasifikasi_id || null, status || existing.status, lampiran || null, id]
    );

    const updated = await db.get(`
      SELECT sm.*, k.kode as klasifikasi_kode, k.nama as klasifikasi_nama
      FROM surat_masuk sm
      LEFT JOIN klasifikasi k ON sm.klasifikasi_id = k.id
      WHERE sm.id = ?
    `, [id]);

    await db.run(
      'INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)',
      [req.user.id, 'surat_masuk', `Memperbarui surat masuk: ${updated.perihal}`]
    );

    broadcast('surat-masuk:updated', updated);
    res.json({ success: true, message: 'Surat masuk berhasil diperbarui.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.get('SELECT * FROM surat_masuk WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Surat masuk tidak ditemukan.' });
    }

    await db.run('DELETE FROM surat_masuk WHERE id = ?', [id]);

    if (existing.lampiran) {
      const filePath = path.join(__dirname, '..', existing.lampiran);
      try { fs.unlinkSync(filePath); } catch {}
    }

    await db.run(
      'INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)',
      [req.user.id, 'surat_masuk', `Menghapus surat masuk: ${existing.perihal}`]
    );

    broadcast('surat-masuk:deleted', { id: parseInt(id) });
    res.json({ success: true, message: 'Surat masuk berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
