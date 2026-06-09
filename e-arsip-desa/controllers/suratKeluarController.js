const db = require('../config/database');

function padNumber(num, length) {
  return String(num).padStart(length, '0');
}

function getRomanMonth(month) {
  const romans = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
  return romans[month - 1];
}

exports.generateNomorSurat = (req, res) => {
  try {
    const profil = db.prepare('SELECT * FROM profil_desa LIMIT 1').get();
    if (!profil) {
      return res.status(500).json({ success: false, message: 'Profil desa belum diatur.' });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Count surat keluar this year
    const count = db.prepare(`
      SELECT COUNT(*) as total FROM surat_keluar
      WHERE strftime('%Y', tanggal_surat) = ?
    `).get(String(year));

    const urut = padNumber(count.total + 1, profil.panjang_nomor);
    const sep = profil.separator;

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
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAll = (req, res) => {
  try {
    const { search, klasifikasi } = req.query;
    let sql = `
      SELECT sk.*, k.kode as klasifikasi_kode, k.nama as klasifikasi_nama
      FROM surat_keluar sk
      LEFT JOIN klasifikasi k ON sk.klasifikasi_id = k.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (sk.perihal LIKE ? OR sk.tujuan_surat LIKE ? OR sk.nomor_surat LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (klasifikasi) {
      sql += ` AND sk.klasifikasi_id = ?`;
      params.push(klasifikasi);
    }

    sql += ` ORDER BY sk.created_at DESC`;

    const rows = db.prepare(sql).all(...params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getById = (req, res) => {
  try {
    const row = db.prepare(`
      SELECT sk.*, k.kode as klasifikasi_kode, k.nama as klasifikasi_nama
      FROM surat_keluar sk
      LEFT JOIN klasifikasi k ON sk.klasifikasi_id = k.id
      WHERE sk.id = ?
    `).get(req.params.id);

    if (!row) {
      return res.status(404).json({ success: false, message: 'Surat keluar tidak ditemukan.' });
    }

    res.json({ success: true, data: row });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.create = (req, res) => {
  try {
    const { nomor_surat, tujuan_surat, perihal, tanggal_surat, klasifikasi_id, generate_otomatis } = req.body;

    if (!tujuan_surat || !perihal || !tanggal_surat) {
      return res.status(400).json({ success: false, message: 'Field wajib: tujuan_surat, perihal, tanggal_surat.' });
    }

    let finalNomor = nomor_surat;
    if (generate_otomatis === true || generate_otomatis === 'true') {
      const profil = db.prepare('SELECT * FROM profil_desa LIMIT 1').get();
      const now = new Date(tanggal_surat);
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const count = db.prepare(`
        SELECT COUNT(*) as total FROM surat_keluar WHERE strftime('%Y', tanggal_surat) = ?
      `).get(String(year));
      const urut = padNumber(count.total + 1, profil.panjang_nomor);
      const sep = profil.separator;
      finalNomor = `${urut}${sep}${profil.kode_surat_default}${sep}${profil.inisial_desa}${sep}${month}${sep}${year}`;
    }

    if (!finalNomor) {
      return res.status(400).json({ success: false, message: 'Nomor surat wajib diisi atau generate otomatis.' });
    }

    const existingNomor = db.prepare('SELECT * FROM surat_keluar WHERE nomor_surat = ?').get(finalNomor);
    if (existingNomor) {
      return res.status(409).json({ success: false, message: 'Nomor surat sudah digunakan.' });
    }

    const lampiran = req.file ? `/uploads/${req.file.filename}` : null;

    const result = db.prepare(`
      INSERT INTO surat_keluar (nomor_surat, tujuan_surat, perihal, tanggal_surat, klasifikasi_id, lampiran)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(finalNomor, tujuan_surat, perihal, tanggal_surat, klasifikasi_id || null, lampiran);

    const newRow = db.prepare(`
      SELECT sk.*, k.kode as klasifikasi_kode, k.nama as klasifikasi_nama
      FROM surat_keluar sk
      LEFT JOIN klasifikasi k ON sk.klasifikasi_id = k.id
      WHERE sk.id = ?
    `).get(result.lastInsertRowid);

    db.prepare('INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)')
      .run(req.user.id, 'surat_keluar', `Menambahkan surat keluar: ${perihal}`);

    res.status(201).json({ success: true, message: 'Surat keluar berhasil ditambahkan.', data: newRow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const { nomor_surat, tujuan_surat, perihal, tanggal_surat, klasifikasi_id } = req.body;

    const existing = db.prepare('SELECT * FROM surat_keluar WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Surat keluar tidak ditemukan.' });
    }

    const lampiran = req.file ? `/uploads/${req.file.filename}` : existing.lampiran;

    db.prepare(`
      UPDATE surat_keluar
      SET nomor_surat = ?,
          tujuan_surat = ?,
          perihal = ?,
          tanggal_surat = ?,
          klasifikasi_id = ?,
          lampiran = ?
      WHERE id = ?
    `).run(
      nomor_surat, tujuan_surat, perihal,
      tanggal_surat,
      klasifikasi_id || null,
      lampiran || null, id
    );

    const updated = db.prepare(`
      SELECT sk.*, k.kode as klasifikasi_kode, k.nama as klasifikasi_nama
      FROM surat_keluar sk
      LEFT JOIN klasifikasi k ON sk.klasifikasi_id = k.id
      WHERE sk.id = ?
    `).get(id);

    db.prepare('INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)')
      .run(req.user.id, 'surat_keluar', `Memperbarui surat keluar: ${updated.perihal}`);

    res.json({ success: true, message: 'Surat keluar berhasil diperbarui.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.delete = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM surat_keluar WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Surat keluar tidak ditemukan.' });
    }

    db.prepare('DELETE FROM surat_keluar WHERE id = ?').run(id);

    db.prepare('INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)')
      .run(req.user.id, 'surat_keluar', `Menghapus surat keluar: ${existing.perihal}`);

    res.json({ success: true, message: 'Surat keluar berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

