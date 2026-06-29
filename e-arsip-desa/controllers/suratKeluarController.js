const db = require('../config/database');
const { broadcast } = require('../utils/sse');
const fs = require('fs');
const path = require('path');

function padNumber(num, length) {
  return String(num).padStart(length, '0');
}

exports.generateNomorSurat = async (req, res) => {
  try {
    const profil = await db.get('SELECT * FROM profil_desa LIMIT 1');
    if (!profil) {
      return res.status(500).json({ success: false, message: 'Profil desa belum diatur.' });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    const count = await db.get(
      `SELECT COUNT(*) as total FROM surat_keluar WHERE YEAR(tanggal_surat) = ?`,
      [String(year)]
    );

    const urut = padNumber(count.total + 1, profil.panjang_nomor);
    const sep = profil.pemisah;

    const nomor = `${urut}${sep}${profil.kode_surat_default}${sep}${profil.inisial_desa}${sep}${month}${sep}${year}`;

    res.json({
      success: true,
      data: {
        nomor,
        preview: nomor,
        urut,
        kode_surat: profil.kode_surat_default,
        inisial: profil.inisial_desa,
        bulan: month,
        tahun: year
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { search, klasifikasi, page, limit } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = '';
    const params = [];

    if (search) {
      whereClause += ` AND (sk.perihal LIKE ? OR sk.tujuan_surat LIKE ? OR sk.nomor_surat LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (klasifikasi) {
      whereClause += ` AND sk.klasifikasi_id = ?`;
      params.push(klasifikasi);
    }

    const countResult = await db.get(
      `SELECT COUNT(*) as total FROM surat_keluar sk WHERE 1=1 ${whereClause}`,
      params
    );
    const total = countResult.total;

    const sql = `
      SELECT sk.*, k.kode as klasifikasi_kode, k.nama as klasifikasi_nama
      FROM surat_keluar sk
      LEFT JOIN klasifikasi k ON sk.klasifikasi_id = k.id
      WHERE 1=1 ${whereClause}
      ORDER BY sk.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const sqlParams = [...params, limitNum, offset];

    const rows = await db.all(sql, sqlParams);
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
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const row = await db.get(`
      SELECT sk.*, k.kode as klasifikasi_kode, k.nama as klasifikasi_nama
      FROM surat_keluar sk
      LEFT JOIN klasifikasi k ON sk.klasifikasi_id = k.id
      WHERE sk.id = ?
    `, [req.params.id]);

    if (!row) {
      return res.status(404).json({ success: false, message: 'Surat keluar tidak ditemukan.' });
    }

    res.json({ success: true, data: row });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { nomor_surat, tujuan_surat, perihal, tanggal_surat, klasifikasi_id, generate_otomatis } = req.body;

    if (!tujuan_surat || !perihal || !tanggal_surat) {
      return res.status(400).json({ success: false, message: 'Field wajib: tujuan_surat, perihal, tanggal_surat.' });
    }

    let finalNomor = nomor_surat;
    if (generate_otomatis === true || generate_otomatis === 'true') {
      const profil = await db.get('SELECT * FROM profil_desa LIMIT 1');
      if (!profil) {
        return res.status(500).json({ success: false, message: 'Profil desa belum diatur.' });
      }
      const now = new Date(tanggal_surat);
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const count = await db.get(
        `SELECT COUNT(*) as total FROM surat_keluar WHERE YEAR(tanggal_surat) = ?`,
        [String(year)]
      );
      const urut = padNumber(count.total + 1, profil.panjang_nomor);
      const sep = profil.pemisah;
      finalNomor = `${urut}${sep}${profil.kode_surat_default}${sep}${profil.inisial_desa}${sep}${month}${sep}${year}`;
    }

    if (!finalNomor) {
      return res.status(400).json({ success: false, message: 'Nomor surat wajib diisi atau generate otomatis.' });
    }

    const existingNomor = await db.get('SELECT * FROM surat_keluar WHERE nomor_surat = ?', [finalNomor]);
    if (existingNomor) {
      return res.status(409).json({ success: false, message: 'Nomor surat sudah digunakan.' });
    }

    const lampiran = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await db.run(
      `INSERT INTO surat_keluar (nomor_surat, tujuan_surat, perihal, tanggal_surat, klasifikasi_id, lampiran)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [finalNomor, tujuan_surat, perihal, tanggal_surat, klasifikasi_id || null, lampiran]
    );

    const newRow = await db.get(`
      SELECT sk.*, k.kode as klasifikasi_kode, k.nama as klasifikasi_nama
      FROM surat_keluar sk
      LEFT JOIN klasifikasi k ON sk.klasifikasi_id = k.id
      WHERE sk.id = ?
    `, [result.lastInsertRowid]);

    await db.run(
      'INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)',
      [req.user.id, 'surat_keluar', `Menambahkan surat keluar: ${perihal}`]
    );

    broadcast('surat-keluar:created', newRow);
    res.status(201).json({ success: true, message: 'Surat keluar berhasil ditambahkan.', data: newRow });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nomor_surat, tujuan_surat, perihal, tanggal_surat, klasifikasi_id } = req.body;

    const existing = await db.get('SELECT * FROM surat_keluar WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Surat keluar tidak ditemukan.' });
    }

    const lampiran = req.file ? `/uploads/${req.file.filename}` : existing.lampiran;

    if (req.file && existing.lampiran) {
      const oldPath = path.join(__dirname, '..', existing.lampiran);
      try { fs.unlinkSync(oldPath); } catch (e) { console.error('Gagal hapus file lama:', e); }
    }

    await db.run(
      `UPDATE surat_keluar
       SET nomor_surat = ?, tujuan_surat = ?, perihal = ?,
           tanggal_surat = ?, klasifikasi_id = ?, lampiran = ?
       WHERE id = ?`,
      [nomor_surat, tujuan_surat, perihal, tanggal_surat, klasifikasi_id || null, lampiran || null, id]
    );

    const updated = await db.get(`
      SELECT sk.*, k.kode as klasifikasi_kode, k.nama as klasifikasi_nama
      FROM surat_keluar sk
      LEFT JOIN klasifikasi k ON sk.klasifikasi_id = k.id
      WHERE sk.id = ?
    `, [id]);

    await db.run(
      'INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)',
      [req.user.id, 'surat_keluar', `Memperbarui surat keluar: ${updated.perihal}`]
    );

    broadcast('surat-keluar:updated', updated);
    res.json({ success: true, message: 'Surat keluar berhasil diperbarui.', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.get('SELECT * FROM surat_keluar WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Surat keluar tidak ditemukan.' });
    }

    await db.run('DELETE FROM surat_keluar WHERE id = ?', [id]);

    if (existing.lampiran) {
      const filePath = path.join(__dirname, '..', existing.lampiran);
      try { fs.unlinkSync(filePath); } catch (e) { console.error('Gagal hapus file:', e); }
    }

    await db.run(
      'INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)',
      [req.user.id, 'surat_keluar', `Menghapus surat keluar: ${existing.perihal}`]
    );

    broadcast('surat-keluar:deleted', { id: parseInt(id) });
    res.json({ success: true, message: 'Surat keluar berhasil dihapus.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};
