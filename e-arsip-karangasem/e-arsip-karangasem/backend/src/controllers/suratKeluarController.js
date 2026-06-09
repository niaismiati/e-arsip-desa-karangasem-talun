const { SuratKeluar, Klasifikasi, User } = require('../models');
const { broadcast } = require('../utils/sse');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { search, klasifikasi, dari_tanggal, sampai_tanggal, page = 1, limit = 7 } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [
        { nomor_surat: { [Op.like]: `%${search}%` } },
        { tujuan_surat: { [Op.like]: `%${search}%` } },
        { perihal: { [Op.like]: `%${search}%` } },
      ];
    }
    if (klasifikasi) where.klasifikasi_id = klasifikasi;
    if (dari_tanggal && sampai_tanggal)
      where.tanggal_surat = { [Op.between]: [dari_tanggal, sampai_tanggal] };

    const offset = (page - 1) * limit;
    const { count, rows } = await SuratKeluar.findAndCountAll({
      where,
      include: [
        { model: Klasifikasi, as: 'klasifikasi', attributes: ['id', 'kode', 'nama_klasifikasi'] },
        { model: User, as: 'pembuat', attributes: ['id', 'nama'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({ success: true, data: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const surat = await SuratKeluar.findByPk(req.params.id, {
      include: [{ model: Klasifikasi, as: 'klasifikasi' }],
    });
    if (!surat) return res.status(404).json({ success: false, message: 'Surat tidak ditemukan' });
    res.json({ success: true, data: surat });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const lampiran = req.file ? req.file.filename : null;
    const surat = await SuratKeluar.create({ ...req.body, lampiran, created_by: req.user.id });
    res.status(201).json({ success: true, data: surat });
    try { broadcast('surat-keluar', { action: 'create', data: surat }); } catch (e) {}
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const surat = await SuratKeluar.findByPk(req.params.id);
    if (!surat) return res.status(404).json({ success: false, message: 'Surat tidak ditemukan' });
    const lampiran = req.file ? req.file.filename : surat.lampiran;
    await surat.update({ ...req.body, lampiran });
    res.json({ success: true, data: surat });
    try { broadcast('surat-keluar', { action: 'update', data: surat }); } catch (e) {}
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const surat = await SuratKeluar.findByPk(req.params.id);
    if (!surat) return res.status(404).json({ success: false, message: 'Surat tidak ditemukan' });
    await surat.destroy();
    res.json({ success: true, message: 'Surat berhasil dihapus' });
    try { broadcast('surat-keluar', { action: 'delete', data: { id: surat.id } }); } catch (e) {}
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await SuratKeluar.count();
    res.json({ success: true, data: { total } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
