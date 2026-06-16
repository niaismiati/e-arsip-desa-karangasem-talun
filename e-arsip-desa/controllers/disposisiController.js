const db = require('../config/database');
const { broadcast } = require('../utils/sse');

exports.getAll = async (req, res) => {
  try {
    const { search, status, surat_masuk_id, page, limit } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = '';
    const params = [];

    if (search) {
      whereClause += ` AND (sm.perihal LIKE ? OR sm.nomor_surat LIKE ? OR d.instruksi LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      whereClause += ` AND d.status = ?`;
      params.push(status);
    }
    if (surat_masuk_id) {
      whereClause += ` AND d.surat_masuk_id = ?`;
      params.push(surat_masuk_id);
    }

    if (req.user.role === 'kades') {
      whereClause += ` AND (d.kepada_user_id = ? OR d.dari_user_id = ?)`;
      params.push(req.user.id, req.user.id);
    }

    const countResult = await db.get(
      `SELECT COUNT(*) as total FROM disposisi d
       JOIN surat_masuk sm ON d.surat_masuk_id = sm.id
       JOIN users dari ON d.dari_user_id = dari.id
       JOIN users kepada ON d.kepada_user_id = kepada.id
       WHERE 1=1 ${whereClause}`,
      params
    );
    const total = countResult.total;

    const sql = `
      SELECT d.*,
        sm.nomor_surat, sm.perihal as surat_perihal, sm.asal_surat,
        dari.nama as dari_nama, dari.role as dari_role,
        kepada.nama as kepada_nama, kepada.role as kepada_role
      FROM disposisi d
      JOIN surat_masuk sm ON d.surat_masuk_id = sm.id
      JOIN users dari ON d.dari_user_id = dari.id
      JOIN users kepada ON d.kepada_user_id = kepada.id
      WHERE 1=1 ${whereClause}
      ORDER BY d.created_at DESC
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
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const row = await db.get(`
      SELECT d.*,
        sm.nomor_surat, sm.perihal as surat_perihal, sm.asal_surat,
        dari.nama as dari_nama, dari.role as dari_role,
        kepada.nama as kepada_nama, kepada.role as kepada_role
      FROM disposisi d
      JOIN surat_masuk sm ON d.surat_masuk_id = sm.id
      JOIN users dari ON d.dari_user_id = dari.id
      JOIN users kepada ON d.kepada_user_id = kepada.id
      WHERE d.id = ?
    `, [req.params.id]);

    if (!row) {
      return res.status(404).json({ success: false, message: 'Disposisi tidak ditemukan.' });
    }

    res.json({ success: true, data: row });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { surat_masuk_id, kepada_user_id, instruksi, catatan, batas_waktu } = req.body;

    if (!surat_masuk_id || !kepada_user_id || !instruksi) {
      return res.status(400).json({ success: false, message: 'Field wajib: surat_masuk_id, kepada_user_id, instruksi.' });
    }

    const surat = await db.get('SELECT * FROM surat_masuk WHERE id = ?', [surat_masuk_id]);
    if (!surat) {
      return res.status(404).json({ success: false, message: 'Surat masuk tidak ditemukan.' });
    }

    const targetUser = await db.get('SELECT * FROM users WHERE id = ?', [kepada_user_id]);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Pengguna tujuan tidak ditemukan.' });
    }

    const result = await db.run(
      `INSERT INTO disposisi (surat_masuk_id, dari_user_id, kepada_user_id, instruksi, catatan, status, batas_waktu)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [surat_masuk_id, req.user.id, kepada_user_id, instruksi, catatan || null, 'Menunggu', batas_waktu || null]
    );

    await db.run("UPDATE surat_masuk SET status = 'Diproses' WHERE id = ?", [surat_masuk_id]);

    const newRow = await db.get(`
      SELECT d.*,
        sm.nomor_surat, sm.perihal as surat_perihal, sm.asal_surat,
        dari.nama as dari_nama, dari.role as dari_role,
        kepada.nama as kepada_nama, kepada.role as kepada_role
      FROM disposisi d
      JOIN surat_masuk sm ON d.surat_masuk_id = sm.id
      JOIN users dari ON d.dari_user_id = dari.id
      JOIN users kepada ON d.kepada_user_id = kepada.id
      WHERE d.id = ?
    `, [result.lastInsertRowid]);

    await db.run(
      'INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)',
      [req.user.id, 'disposisi', `Membuat disposisi untuk surat: ${surat.perihal}`]
    );

    broadcast('disposisi:created', newRow);
    res.status(201).json({ success: true, message: 'Disposisi berhasil dibuat.', data: newRow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { instruksi, batas_waktu } = req.body;

    const existing = await db.get('SELECT * FROM disposisi WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Disposisi tidak ditemukan.' });
    }

    if (existing.dari_user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Tidak memiliki akses untuk mengubah disposisi ini.' });
    }

    await db.run(
      `UPDATE disposisi
       SET instruksi = COALESCE(?, instruksi),
           batas_waktu = COALESCE(?, batas_waktu),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [instruksi || null, batas_waktu !== undefined ? batas_waktu : null, id]
    );

    const updated = await db.get(`
      SELECT d.*,
        sm.nomor_surat, sm.perihal as surat_perihal, sm.asal_surat,
        dari.nama as dari_nama, dari.role as dari_role,
        kepada.nama as kepada_nama, kepada.role as kepada_role
      FROM disposisi d
      JOIN surat_masuk sm ON d.surat_masuk_id = sm.id
      JOIN users dari ON d.dari_user_id = dari.id
      JOIN users kepada ON d.kepada_user_id = kepada.id
      WHERE d.id = ?
    `, [id]);

    broadcast('disposisi:updated', updated);
    res.json({ success: true, message: 'Disposisi berhasil diperbarui.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approve = async (req, res) => {
  try {
    const { id } = req.params;
    const { catatan } = req.body;

    const existing = await db.get('SELECT * FROM disposisi WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Disposisi tidak ditemukan.' });
    }

    if (existing.kepada_user_id !== req.user.id && existing.dari_user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Tidak memiliki akses untuk menyetujui disposisi ini.' });
    }

    await db.run(
      `UPDATE disposisi SET status = 'Disetujui', catatan = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [catatan || null, id]
    );

    await db.run("UPDATE surat_masuk SET status = 'Diproses' WHERE id = ?", [existing.surat_masuk_id]);

    await db.run(
      'INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)',
      [req.user.id, 'disposisi', `Menyetujui disposisi surat ID ${existing.surat_masuk_id}`]
    );

    broadcast('disposisi:approved', { id: parseInt(id), status: 'Disetujui', surat_masuk_id: existing.surat_masuk_id });
    res.json({ success: true, message: 'Disposisi berhasil disetujui.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reject = async (req, res) => {
  try {
    const { id } = req.params;
    const { catatan } = req.body;

    const existing = await db.get('SELECT * FROM disposisi WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Disposisi tidak ditemukan.' });
    }

    if (existing.kepada_user_id !== req.user.id && existing.dari_user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Tidak memiliki akses untuk menolak disposisi ini.' });
    }

    await db.run(
      `UPDATE disposisi SET status = 'Ditolak', catatan = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [catatan || null, id]
    );

    const hasOtherActive = await db.get(
      "SELECT COUNT(*) as total FROM disposisi WHERE surat_masuk_id = ? AND id != ? AND status IN ('Menunggu', 'Disetujui')",
      [existing.surat_masuk_id, id]
    );

    if (hasOtherActive.total === 0) {
      await db.run("UPDATE surat_masuk SET status = 'Belum Disposisi' WHERE id = ?", [existing.surat_masuk_id]);
    }

    await db.run(
      'INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)',
      [req.user.id, 'disposisi', `Menolak disposisi surat ID ${existing.surat_masuk_id}`]
    );

    broadcast('disposisi:rejected', { id: parseInt(id), status: 'Ditolak', surat_masuk_id: existing.surat_masuk_id });
    res.json({ success: true, message: 'Disposisi berhasil ditolak.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.selesai = async (req, res) => {
  try {
    const { id } = req.params;
    const { catatan } = req.body;

    const existing = await db.get('SELECT * FROM disposisi WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Disposisi tidak ditemukan.' });
    }

    if (existing.kepada_user_id !== req.user.id && existing.dari_user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Tidak memiliki akses untuk menyelesaikan disposisi ini.' });
    }

    await db.run(
      `UPDATE disposisi SET status = 'Selesai', catatan = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [catatan || null, id]
    );

    await db.run("UPDATE surat_masuk SET status = 'Selesai' WHERE id = ?", [existing.surat_masuk_id]);

    broadcast('disposisi:selesai', { id: parseInt(id), status: 'Selesai', surat_masuk_id: existing.surat_masuk_id });
    res.json({ success: true, message: 'Disposisi berhasil diselesaikan.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.get('SELECT * FROM disposisi WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Disposisi tidak ditemukan.' });
    }

    await db.run('DELETE FROM disposisi WHERE id = ?', [id]);

    const hasOtherActive = await db.get(
      "SELECT COUNT(*) as total FROM disposisi WHERE surat_masuk_id = ? AND id != ? AND status IN ('Menunggu', 'Disetujui')",
      [existing.surat_masuk_id, id]
    );

    if (hasOtherActive.total === 0) {
      await db.run("UPDATE surat_masuk SET status = 'Belum Disposisi' WHERE id = ?", [existing.surat_masuk_id]);
    }

    broadcast('disposisi:deleted', { id: parseInt(id) });
    res.json({ success: true, message: 'Disposisi berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
