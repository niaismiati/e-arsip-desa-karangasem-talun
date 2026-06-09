const db = require('../config/database');

exports.getAll = (req, res) => {
  try {
    const { search, status, surat_masuk_id } = req.query;
    let sql = `
      SELECT d.*,
        sm.nomor_surat, sm.perihal as surat_perihal, sm.asal_surat,
        dari.nama as dari_nama, dari.role as dari_role,
        kepada.nama as kepada_nama, kepada.role as kepada_role
      FROM disposisi d
      JOIN surat_masuk sm ON d.surat_masuk_id = sm.id
      JOIN users dari ON d.dari_user_id = dari.id
      JOIN users kepada ON d.kepada_user_id = kepada.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (sm.perihal LIKE ? OR sm.nomor_surat LIKE ? OR d.instruksi LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      sql += ` AND d.status = ?`;
      params.push(status);
    }
    if (surat_masuk_id) {
      sql += ` AND d.surat_masuk_id = ?`;
      params.push(surat_masuk_id);
    }

    sql += ` ORDER BY d.created_at DESC`;

    const rows = db.prepare(sql).all(...params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = (req, res) => {
  try {
    const row = db.prepare(`
      SELECT d.*,
        sm.nomor_surat, sm.perihal as surat_perihal, sm.asal_surat,
        dari.nama as dari_nama, dari.role as dari_role,
        kepada.nama as kepada_nama, kepada.role as kepada_role
      FROM disposisi d
      JOIN surat_masuk sm ON d.surat_masuk_id = sm.id
      JOIN users dari ON d.dari_user_id = dari.id
      JOIN users kepada ON d.kepada_user_id = kepada.id
      WHERE d.id = ?
    `).get(req.params.id);

    if (!row) {
      return res.status(404).json({ success: false, message: 'Disposisi tidak ditemukan.' });
    }

    res.json({ success: true, data: row });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = (req, res) => {
  try {
    const { surat_masuk_id, kepada_user_id, instruksi, catatan, batas_waktu } = req.body;

    if (!surat_masuk_id || !kepada_user_id || !instruksi) {
      return res.status(400).json({ success: false, message: 'Field wajib: surat_masuk_id, kepada_user_id, instruksi.' });
    }

    const surat = db.prepare('SELECT * FROM surat_masuk WHERE id = ?').get(surat_masuk_id);
    if (!surat) {
      return res.status(404).json({ success: false, message: 'Surat masuk tidak ditemukan.' });
    }

    const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(kepada_user_id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Pengguna tujuan tidak ditemukan.' });
    }

    const result = db.prepare(`
      INSERT INTO disposisi (surat_masuk_id, dari_user_id, kepada_user_id, instruksi, catatan, status, batas_waktu)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(surat_masuk_id, req.user.id, kepada_user_id, instruksi, catatan || null, 'Menunggu', batas_waktu || null);

    // Update surat masuk status
    db.prepare("UPDATE surat_masuk SET status = 'Diproses' WHERE id = ?").run(surat_masuk_id);

    const newRow = db.prepare(`
      SELECT d.*,
        sm.nomor_surat, sm.perihal as surat_perihal, sm.asal_surat,
        dari.nama as dari_nama, dari.role as dari_role,
        kepada.nama as kepada_nama, kepada.role as kepada_role
      FROM disposisi d
      JOIN surat_masuk sm ON d.surat_masuk_id = sm.id
      JOIN users dari ON d.dari_user_id = dari.id
      JOIN users kepada ON d.kepada_user_id = kepada.id
      WHERE d.id = ?
    `).get(result.lastInsertRowid);

    db.prepare('INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)')
      .run(req.user.id, 'disposisi', `Membuat disposisi untuk surat: ${surat.perihal}`);

    res.status(201).json({ success: true, message: 'Disposisi berhasil dibuat.', data: newRow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const { instruksi, batas_waktu } = req.body;

    const existing = db.prepare('SELECT * FROM disposisi WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Disposisi tidak ditemukan.' });
    }

    db.prepare(`
      UPDATE disposisi
      SET instruksi = COALESCE(?, instruksi),
          batas_waktu = COALESCE(?, batas_waktu),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(instruksi || null, batas_waktu !== undefined ? batas_waktu : null, id);

    const updated = db.prepare(`
      SELECT d.*,
        sm.nomor_surat, sm.perihal as surat_perihal, sm.asal_surat,
        dari.nama as dari_nama, dari.role as dari_role,
        kepada.nama as kepada_nama, kepada.role as kepada_role
      FROM disposisi d
      JOIN surat_masuk sm ON d.surat_masuk_id = sm.id
      JOIN users dari ON d.dari_user_id = dari.id
      JOIN users kepada ON d.kepada_user_id = kepada.id
      WHERE d.id = ?
    `).get(id);

    res.json({ success: true, message: 'Disposisi berhasil diperbarui.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approve = (req, res) => {
  try {
    const { id } = req.params;
    const { catatan } = req.body;

    const existing = db.prepare('SELECT * FROM disposisi WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Disposisi tidak ditemukan.' });
    }

    db.prepare(`
      UPDATE disposisi
      SET status = 'Disetujui', catatan = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(catatan || null, id);

    // Update surat masuk status
    db.prepare("UPDATE surat_masuk SET status = 'Diproses' WHERE id = ?").run(existing.surat_masuk_id);

    db.prepare('INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)')
      .run(req.user.id, 'disposisi', `Menyetujui disposisi surat ID ${existing.surat_masuk_id}`);

    res.json({ success: true, message: 'Disposisi berhasil disetujui.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reject = (req, res) => {
  try {
    const { id } = req.params;
    const { catatan } = req.body;

    const existing = db.prepare('SELECT * FROM disposisi WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Disposisi tidak ditemukan.' });
    }

    db.prepare(`
      UPDATE disposisi
      SET status = 'Ditolak', catatan = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(catatan || null, id);

    // Update surat masuk status
    db.prepare("UPDATE surat_masuk SET status = 'Belum Disposisi' WHERE id = ?").run(existing.surat_masuk_id);

    db.prepare('INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)')
      .run(req.user.id, 'disposisi', `Menolak disposisi surat ID ${existing.surat_masuk_id}`);

    res.json({ success: true, message: 'Disposisi berhasil ditolak.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.selesai = (req, res) => {
  try {
    const { id } = req.params;
    const { catatan } = req.body;

    const existing = db.prepare('SELECT * FROM disposisi WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Disposisi tidak ditemukan.' });
    }

    db.prepare(`
      UPDATE disposisi
      SET status = 'Selesai', catatan = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(catatan || null, id);

    // Update surat masuk status
    db.prepare("UPDATE surat_masuk SET status = 'Selesai' WHERE id = ?").run(existing.surat_masuk_id);

    res.json({ success: true, message: 'Disposisi berhasil diselesaikan.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM disposisi WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Disposisi tidak ditemukan.' });
    }

    db.prepare('DELETE FROM disposisi WHERE id = ?').run(id);
    res.json({ success: true, message: 'Disposisi berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

