const db = require('../config/database');

exports.getRekap = async (req, res) => {
  try {
    const { tahun, bulan, jenis } = req.query;
    const currentYear = new Date().getFullYear();
    const targetTahun = tahun || currentYear;

    let whereClause = '';
    const params = [];

    if (tahun) {
      whereClause += ` AND YEAR(tanggal_surat) = ?`;
      params.push(String(tahun));
    }
    if (bulan) {
      whereClause += ` AND MONTH(tanggal_surat) = ?`;
      params.push(String(bulan));
    }

    const showMasuk = !jenis || jenis === 'masuk' || jenis === 'semua';
    const showKeluar = !jenis || jenis === 'keluar' || jenis === 'semua';

    // Single query: LEFT JOIN aggregated counts instead of looping per klasifikasi
    const sql = `
      SELECT k.id as klasifikasi_id, k.kode, k.nama,
        COALESCE(sm.total, 0) as surat_masuk,
        COALESCE(sk.total, 0) as surat_keluar
      FROM klasifikasi k
      ${showMasuk ? 'LEFT JOIN (SELECT klasifikasi_id, COUNT(*) as total FROM surat_masuk WHERE 1=1' + whereClause + ' GROUP BY klasifikasi_id) sm ON k.id = sm.klasifikasi_id' : 'LEFT JOIN (SELECT 0 as total, NULL as klasifikasi_id) sm ON 1=0'}
      ${showKeluar ? 'LEFT JOIN (SELECT klasifikasi_id, COUNT(*) as total FROM surat_keluar WHERE 1=1' + whereClause + ' GROUP BY klasifikasi_id) sk ON k.id = sk.klasifikasi_id' : 'LEFT JOIN (SELECT 0 as total, NULL as klasifikasi_id) sk ON 1=0'}
      ORDER BY k.kode ASC
    `;

    const rows = await db.all(sql, [...params, ...params]);
    const result = rows
      .map(r => ({ ...r, total: r.surat_masuk + r.surat_keluar }))
      .filter(r => r.total > 0);

    const totalMasuk = result.reduce((sum, r) => sum + r.surat_masuk, 0);
    const totalKeluar = result.reduce((sum, r) => sum + r.surat_keluar, 0);
    const grandTotal = totalMasuk + totalKeluar;

    res.json({
      success: true,
      data: {
        periode: {
          tahun: parseInt(targetTahun),
          bulan: bulan ? parseInt(bulan) : null
        },
        rekap: result,
        total: {
          surat_masuk: totalMasuk,
          surat_keluar: totalKeluar,
          grand_total: grandTotal
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};

exports.getStatistikBulanan = async (req, res) => {
  try {
    const { tahun } = req.query;
    const targetTahun = tahun || new Date().getFullYear();

    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

    // Two aggregate queries instead of 24 individual queries
    const masukRows = await db.all(
      `SELECT MONTH(tanggal_surat) as bulan, COUNT(*) as total
       FROM surat_masuk
       WHERE YEAR(tanggal_surat) = ?
       GROUP BY MONTH(tanggal_surat)`,
      [String(targetTahun)]
    );

    const keluarRows = await db.all(
      `SELECT MONTH(tanggal_surat) as bulan, COUNT(*) as total
       FROM surat_keluar
       WHERE YEAR(tanggal_surat) = ?
       GROUP BY MONTH(tanggal_surat)`,
      [String(targetTahun)]
    );

    const masukMap = {};
    const keluarMap = {};
    for (const r of masukRows) masukMap[r.bulan] = r.total;
    for (const r of keluarRows) keluarMap[r.bulan] = r.total;

    const result = months.map((name, i) => ({
      bulan: name,
      masuk: masukMap[i + 1] || 0,
      keluar: keluarMap[i + 1] || 0,
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};
