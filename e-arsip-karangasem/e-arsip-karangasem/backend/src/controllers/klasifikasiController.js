const { Klasifikasi, SuratMasuk, SuratKeluar } = require('../models');
const { fn, col, literal } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const data = await Klasifikasi.findAll({ order: [['kode', 'ASC']] });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { kode, nama_klasifikasi, keterangan } = req.body;
    const existing = await Klasifikasi.findOne({ where: { kode } });
    if (existing) return res.status(400).json({ success: false, message: 'Kode klasifikasi sudah ada' });
    const data = await Klasifikasi.create({ kode, nama_klasifikasi, keterangan });
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await Klasifikasi.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Klasifikasi tidak ditemukan' });
    await item.update(req.body);
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const item = await Klasifikasi.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Klasifikasi tidak ditemukan' });
    await item.destroy();
    res.json({ success: true, message: 'Klasifikasi berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getRingkasan = async (req, res) => {
  try {
    const data = await Klasifikasi.findAll({
      attributes: ['id', 'kode', 'nama_klasifikasi'],
      order: [['kode', 'ASC']],
    });

    const result = await Promise.all(data.map(async (k) => {
      const jumlahMasuk = await SuratMasuk.count({ where: { klasifikasi_id: k.id } });
      const jumlahKeluar = await SuratKeluar.count({ where: { klasifikasi_id: k.id } });
      return { ...k.toJSON(), jumlah_masuk: jumlahMasuk, jumlah_keluar: jumlahKeluar, total: jumlahMasuk + jumlahKeluar };
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
