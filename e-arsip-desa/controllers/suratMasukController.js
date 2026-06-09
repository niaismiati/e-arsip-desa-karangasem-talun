const db = require('../config/database');

exports.getAll = (req, res) => {
  try {
    const { search, klasifikasi, status, asal } = req.query;
    let sql = `
      SELECT sm.*, k.kode as klasifikasi_kode, k.nama as klasifikasi_nama
      FROM surat_masuk sm
      LEFT JOIN klasifikasi k ON sm.klasifikasi_id = k.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (sm.perihal LIKE ? OR sm.asal_surat LIKE ? OR sm.nomor_surat LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (klasifikasi) {
      sql += ` AND sm.klasifikasi_id = ?`;
      params.push(klasifikasi);
    }
    if (status) {
      sql += ` AND sm.status = ?`;
      params.push(status);
    }
    if (asal) {
      sql += ` AND sm.asal_surat LIKE ?`;
      params.push(`%${asal}%`);
    }

    sql += ` ORDER BY sm.created_at DESC`;

    const rows = db.prepare(sql).all(...params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = (req, res) => {
  try {
    const row = db.prepare(`
      SELECT sm.*, k.kode as klasifikasi_kode, k.nama as klasifikasi_nama
      FROM surat_masuk sm
      LEFT JOIN klasifikasi k ON sm.klasifikasi_id = k.id
      WHERE sm.id = ?
    `).get(req.params.id);

    if (!row) {
      return res.status(404).json({ success: false, message: 'Surat masuk tidak ditemukan.' });
    }

    res.json({ success: true, data: row });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = (req, res) => {
  try {
    const { nomor_surat, asal_surat, perihal, tanggal_surat, tanggal_terima, klasifikasi_id, status } = req.body;

    if (!nomor_surat || !asal_surat || !perihal || !tanggal_surat || !tanggal_terima) {
      return res.status(400).json({ success: false, message: 'Field wajib: nomor_surat, asal_surat, perihal, tanggal_surat, tanggal_terima.' });
    }

    // Check for duplicate nomor_surat
    const dup = db.prepare('SELECT id FROM surat_masuk WHERE nomor_surat = ?').get(nomor_surat);
    if (dup) {
      return res.status(409).json({ success: false, message: 'Nomor surat sudah digunakan.' });
    }

    const lampiran = req.file ? `/uploads/${req.file.filename}` : null;

    const result = db.prepare(`
      INSERT INTO surat_masuk (nomor_surat, asal_surat, perihal, tanggal_surat, tanggal_terima, klasifikasi_id, status, lampiran)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(nomor_surat, asal_surat, perihal, tanggal_surat, tanggal_terima, klasifikasi_id || null, status || 'Belum Disposisi', lampiran);

    const newRow = db.prepare(`
      SELECT sm.*, k.kode as klasifikasi_kode, k.nama as klasifikasi_nama
      FROM surat_masuk sm
      LEFT JOIN klasifikasi k ON sm.klasifikasi_id = k.id
      WHERE sm.id = ?
    `).get(result.lastInsertRowid);

    // Log aktivitas
    db.prepare('INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)')
      .run(req.user.id, 'surat_masuk', `Menambahkan surat masuk: ${perihal}`);

    res.status(201).json({ success: true, message: 'Surat masuk berhasil ditambahkan.', data: newRow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const { nomor_surat, asal_surat, perihal, tanggal_surat, tanggal_terima, klasifikasi_id, status } = req.body;

    const existing = db.prepare('SELECT * FROM surat_masuk WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Surat masuk tidak ditemukan.' });
    }

    const lampiran = req.file ? `/uploads/${req.file.filename}` : existing.lampiran;

    db.prepare(`
      UPDATE surat_masuk
      SET nomor_surat = ?,
          asal_surat = ?,
          perihal = ?,
          tanggal_surat = ?,
          tanggal_terima = ?,
          klasifikasi_id = ?,
          status = ?,
          lampiran = ?
      WHERE id = ?
    `).run(
      nomor_surat, asal_surat, perihal,
      tanggal_surat, tanggal_terima,
      klasifikasi_id || null,
      status || existing.status, lampiran || null, id
    );

    const updated = db.prepare(`
      SELECT sm.*, k.kode as klasifikasi_kode, k.nama as klasifikasi_nama
      FROM surat_masuk sm
      LEFT JOIN klasifikasi k ON sm.klasifikasi_id = k.id
      WHERE sm.id = ?
    `).get(id);

    db.prepare('INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)')
      .run(req.user.id, 'surat_masuk', `Memperbarui surat masuk: ${updated.perihal}`);

    res.json({ success: true, message: 'Surat masuk berhasil diperbarui.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM surat_masuk WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Surat masuk tidak ditemukan.' });
    }

    db.prepare('DELETE FROM surat_masuk WHERE id = ?').run(id);

    db.prepare('INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)')
      .run(req.user.id, 'surat_masuk', `Menghapus surat masuk: ${existing.perihal}`);

    res.json({ success: true, message: 'Surat masuk berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

