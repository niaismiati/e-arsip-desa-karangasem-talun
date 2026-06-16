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

    const klasifikasiList = await db.all('SELECT * FROM klasifikasi ORDER BY kode ASC');

    const result = [];
    for (const k of klasifikasiList) {
      let masukCount = 0;
      let keluarCount = 0;

      if (!jenis || jenis === 'masuk' || jenis === 'semua') {
        const m = await db.get(
          `SELECT COUNT(*) as total FROM surat_masuk WHERE klasifikasi_id = ? ${whereClause}`,
          [k.id, ...params]
        );
        masukCount = m.total;
      }

      if (!jenis || jenis === 'keluar' || jenis === 'semua') {
        const kq = await db.get(
          `SELECT COUNT(*) as total FROM surat_keluar WHERE klasifikasi_id = ? ${whereClause}`,
          [k.id, ...params]
        );
        keluarCount = kq.total;
      }

      const total = masukCount + keluarCount;
      if (total > 0) {
        result.push({
          klasifikasi_id: k.id,
          kode: k.kode,
          nama: k.nama,
          surat_masuk: masukCount,
          surat_keluar: keluarCount,
          total
        });
      }
    }

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
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStatistikBulanan = async (req, res) => {
  try {
    const { tahun } = req.query;
    const targetTahun = tahun || new Date().getFullYear();

    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const result = [];

    for (let i = 0; i < months.length; i++) {
      const monthNum = i + 1;

      const masuk = await db.get(
        `SELECT COUNT(*) as total FROM surat_masuk
         WHERE YEAR(tanggal_surat) = ? AND MONTH(tanggal_surat) = ?`,
        [String(targetTahun), monthNum]
      );

      const keluar = await db.get(
        `SELECT COUNT(*) as total FROM surat_keluar
         WHERE YEAR(tanggal_surat) = ? AND MONTH(tanggal_surat) = ?`,
        [String(targetTahun), monthNum]
      );

      result.push({
        bulan: months[i],
        masuk: masuk.total,
        keluar: keluar.total
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
