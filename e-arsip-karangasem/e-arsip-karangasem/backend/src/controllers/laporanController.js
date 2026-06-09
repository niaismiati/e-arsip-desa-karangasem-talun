const { SuratMasuk, SuratKeluar, Klasifikasi, Disposisi } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

exports.getDashboard = async (req, res) => {
  try {
    const tahunIni = new Date().getFullYear();
    const [totalMasuk, totalKeluar, totalDisposisi, menungguDisposisi, disposisiSelesai] = await Promise.all([
      SuratMasuk.count(),
      SuratKeluar.count(),
      Disposisi.count(),
      SuratMasuk.count({ where: { status: 'belum_disposisi' } }),
      Disposisi.count({ where: { status: 'selesai' } }),
    ]);

    res.json({ success: true, data: { totalMasuk, totalKeluar, totalDisposisi, menungguDisposisi, disposisiSelesai } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getGrafik = async (req, res) => {
  try {
    const bulanData = [];
    const namaBulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      const [masuk, keluar] = await Promise.all([
        SuratMasuk.count({ where: { tanggal_terima: { [Op.between]: [start, end] } } }),
        SuratKeluar.count({ where: { tanggal_surat: { [Op.between]: [start, end] } } }),
      ]);

      bulanData.push({ bulan: namaBulan[d.getMonth()], masuk, keluar });
    }

    res.json({ success: true, data: bulanData });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getPerKlasifikasi = async (req, res) => {
  try {
    const klasifikasi = await Klasifikasi.findAll({ order: [['kode', 'ASC']] });
    const result = await Promise.all(klasifikasi.map(async (k) => {
      const [masuk, keluar] = await Promise.all([
        SuratMasuk.count({ where: { klasifikasi_id: k.id } }),
        SuratKeluar.count({ where: { klasifikasi_id: k.id } }),
      ]);
      return { kode: k.kode, nama: k.nama_klasifikasi, masuk, keluar, total: masuk + keluar };
    }));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// New endpoint for detailed rekap report
exports.getRekap = async (req, res) => {
  try {
    const { tahun, bulan, jenis = 'semua' } = req.query;
    if (!tahun) return res.status(400).json({ success: false, message: 'Tahun harus diisi' });

    const where = {};
    
    // Handle month filter
    if (bulan) {
      const startOfMonth = new Date(parseInt(tahun), parseInt(bulan) - 1, 1);
      const endOfMonth = new Date(parseInt(tahun), parseInt(bulan), 0);
      
      if (jenis === 'masuk' || jenis === 'semua') {
        where.tanggal_terima = { [Op.between]: [startOfMonth, endOfMonth] };
      }
    } else {
      const startOfYear = new Date(parseInt(tahun), 0, 1);
      const endOfYear = new Date(parseInt(tahun), 11, 31);
      
      if (jenis === 'masuk' || jenis === 'semua') {
        where.tanggal_terima = { [Op.between]: [startOfYear, endOfYear] };
      }
    }

    const klasifikasi = await Klasifikasi.findAll({ order: [['kode', 'ASC']] });
    const rekap = await Promise.all(klasifikasi.map(async (k) => {
      const klasifikasiWhere = { ...where, klasifikasi_id: k.id };
      
      let masuk = 0, keluar = 0;
      
      if (jenis === 'masuk' || jenis === 'semua') {
        masuk = await SuratMasuk.count({ where: klasifikasiWhere });
      }
      
      if (jenis === 'keluar' || jenis === 'semua') {
        const keluarWhere = { klasifikasi_id: k.id };
        if (bulan) {
          const startOfMonth = new Date(parseInt(tahun), parseInt(bulan) - 1, 1);
          const endOfMonth = new Date(parseInt(tahun), parseInt(bulan), 0);
          keluarWhere.tanggal_surat = { [Op.between]: [startOfMonth, endOfMonth] };
        } else {
          const startOfYear = new Date(parseInt(tahun), 0, 1);
          const endOfYear = new Date(parseInt(tahun), 11, 31);
          keluarWhere.tanggal_surat = { [Op.between]: [startOfYear, endOfYear] };
        }
        keluar = await SuratKeluar.count({ where: keluarWhere });
      }
      
      return {
        klasifikasi_id: k.id,
        kode: k.kode,
        nama: k.nama_klasifikasi,
        surat_masuk: masuk,
        surat_keluar: keluar,
        total: masuk + keluar
      };
    }));

    res.json({ success: true, data: { tahun, bulan: bulan || null, jenis, rekap } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// New endpoint for statistik bulanan
exports.getStatistikBulanan = async (req, res) => {
  try {
    const { tahun = new Date().getFullYear() } = req.query;
    const namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const statistik = [];
    
    for (let m = 1; m <= 12; m++) {
      const startOfMonth = new Date(parseInt(tahun), m - 1, 1);
      const endOfMonth = new Date(parseInt(tahun), m, 0);
      
      const [masuk, keluar] = await Promise.all([
        SuratMasuk.count({ where: { tanggal_terima: { [Op.between]: [startOfMonth, endOfMonth] } } }),
        SuratKeluar.count({ where: { tanggal_surat: { [Op.between]: [startOfMonth, endOfMonth] } } }),
      ]);
      
      statistik.push({
        bulan: namaBulan[m - 1],
        bulan_num: m,
        masuk,
        keluar,
        total: masuk + keluar
      });
    }
    
    res.json({ success: true, data: statistik, tahun });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
