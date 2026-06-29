const db = require('../config/database');

exports.getStats = async (req, res) => {
  try {
    const suratMasukTotal = await db.get('SELECT COUNT(*) as total FROM surat_masuk');
    const suratKeluarTotal = await db.get('SELECT COUNT(*) as total FROM surat_keluar');
    const disposisiBaru = await db.get("SELECT COUNT(*) as total FROM disposisi WHERE status = 'Menunggu'");
    const totalArsip = await db.get('SELECT COUNT(*) as total FROM (SELECT id FROM surat_masuk UNION ALL SELECT id FROM surat_keluar) as sub');

    res.json({
      success: true,
      data: {
        surat_masuk: suratMasukTotal.total,
        surat_keluar: suratKeluarTotal.total,
        disposisi_baru: disposisiBaru.total,
        total_arsip: totalArsip.total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};

exports.getChartData = async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Two aggregate queries instead of 12 individual queries
    const masukRows = await db.all(
      `SELECT YEAR(tanggal_surat) as tahun, MONTH(tanggal_surat) as bulan, COUNT(*) as total
       FROM surat_masuk
       WHERE tanggal_surat >= ?
       GROUP BY YEAR(tanggal_surat), MONTH(tanggal_surat)
       ORDER BY tahun, bulan`,
      [sixMonthsAgo.toISOString().split('T')[0]]
    );

    const keluarRows = await db.all(
      `SELECT YEAR(tanggal_surat) as tahun, MONTH(tanggal_surat) as bulan, COUNT(*) as total
       FROM surat_keluar
       WHERE tanggal_surat >= ?
       GROUP BY YEAR(tanggal_surat), MONTH(tanggal_surat)
       ORDER BY tahun, bulan`,
      [sixMonthsAgo.toISOString().split('T')[0]]
    );

    const masukMap = {};
    const keluarMap = {};
    for (const r of masukRows) masukMap[`${r.tahun}-${r.bulan}`] = r.total;
    for (const r of keluarRows) keluarMap[`${r.tahun}-${r.bulan}`] = r.total;

    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const key = `${year}-${month}`;
      const monthName = d.toLocaleString('id-ID', { month: 'short' });

      result.push({
        bulan: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        masuk: masukMap[key] || 0,
        keluar: keluarMap[key] || 0
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};

exports.getRecentLetters = async (req, res) => {
  try {
    const masuk = await db.all(`
      SELECT sm.id, sm.perihal, sm.asal_surat as asal_tujuan, sm.tanggal_surat as tanggal, 'Masuk' as jenis, sm.status
      FROM surat_masuk sm
      ORDER BY sm.created_at DESC
      LIMIT 5
    `);

    const keluar = await db.all(`
      SELECT sk.id, sk.perihal, sk.tujuan_surat as asal_tujuan, sk.tanggal_surat as tanggal, 'Keluar' as jenis, 'Selesai' as status
      FROM surat_keluar sk
      ORDER BY sk.created_at DESC
      LIMIT 5
    `);

    const combined = [...masuk, ...keluar]
      .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
      .slice(0, 5);

    res.json({ success: true, data: combined });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};

exports.getPendingDisposisi = async (req, res) => {
  try {
    const rows = await db.all(`
      SELECT d.id, d.instruksi, d.status, d.created_at, d.batas_waktu,
        sm.id as surat_masuk_id, sm.nomor_surat, sm.perihal, sm.asal_surat, sm.tanggal_terima,
        dari.nama as dari_nama
      FROM disposisi d
      JOIN surat_masuk sm ON d.surat_masuk_id = sm.id
      JOIN users dari ON d.dari_user_id = dari.id
      WHERE d.status = 'Menunggu'
      ORDER BY d.created_at DESC
      LIMIT 5
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};

exports.getKlasifikasiSummary = async (req, res) => {
  try {
    // Single query with LEFT JOIN + GROUP BY instead of looping per klasifikasi
    const rows = await db.all(`
      SELECT k.kode, k.nama,
        COALESCE(sm.total, 0) + COALESCE(sk.total, 0) as count
      FROM klasifikasi k
      LEFT JOIN (SELECT klasifikasi_id, COUNT(*) as total FROM surat_masuk GROUP BY klasifikasi_id) sm ON k.id = sm.klasifikasi_id
      LEFT JOIN (SELECT klasifikasi_id, COUNT(*) as total FROM surat_keluar GROUP BY klasifikasi_id) sk ON k.id = sk.klasifikasi_id
      HAVING count > 0
      ORDER BY k.kode ASC
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};

exports.getAktivitas = async (req, res) => {
  try {
    const rows = await db.all(`
      SELECT a.*, u.nama as user_nama
      FROM aktivitas a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};
