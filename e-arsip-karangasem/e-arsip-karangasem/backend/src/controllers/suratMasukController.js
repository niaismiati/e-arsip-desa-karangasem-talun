const { SuratMasuk, Klasifikasi, User } = require('../models');
const { broadcast } = require('../utils/sse');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { search, klasifikasi, status, dari_tanggal, sampai_tanggal, page = 1, limit = 7 } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [
        { nomor_surat: { [Op.like]: `%${search}%` } },
        { asal_surat: { [Op.like]: `%${search}%` } },
        { perihal: { [Op.like]: `%${search}%` } },
      ];
    }
    if (klasifikasi) where.klasifikasi_id = klasifikasi;
    if (status) where.status = status;
    if (dari_tanggal && sampai_tanggal)
      where.tanggal_terima = { [Op.between]: [dari_tanggal, sampai_tanggal] };

    const offset = (page - 1) * limit;
    const { count, rows } = await SuratMasuk.findAndCountAll({
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
    const surat = await SuratMasuk.findByPk(req.params.id, {
      include: [
        { model: Klasifikasi, as: 'klasifikasi' },
        { model: User, as: 'pembuat', attributes: ['id', 'nama'] },
      ],
    });
    if (!surat) return res.status(404).json({ message: 'Surat tidak ditemukan' });
    res.json(surat);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const lampiran = req.file ? req.file.filename : null;
    const surat = await SuratMasuk.create({ ...req.body, lampiran, created_by: req.user.id });
    res.status(201).json(surat);
    try { broadcast('surat-masuk', { action: 'create', data: surat }); } catch (e) {}
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const surat = await SuratMasuk.findByPk(req.params.id);
    if (!surat) return res.status(404).json({ message: 'Surat tidak ditemukan' });
    const lampiran = req.file ? req.file.filename : surat.lampiran;
    await surat.update({ ...req.body, lampiran });
    res.json(surat);
    try { broadcast('surat-masuk', { action: 'update', data: surat }); } catch (e) {}
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const surat = await SuratMasuk.findByPk(req.params.id);
    if (!surat) return res.status(404).json({ message: 'Surat tidak ditemukan' });
    await surat.destroy();
    res.json({ message: 'Surat berhasil dihapus' });
    try { broadcast('surat-masuk', { action: 'delete', data: { id: surat.id } }); } catch (e) {}
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [total, sudah, belum, diproses, selesai] = await Promise.all([
      SuratMasuk.count(),
      SuratMasuk.count({ where: { status: 'sudah_disposisi' } }),
      SuratMasuk.count({ where: { status: 'belum_disposisi' } }),
      SuratMasuk.count({ where: { status: 'diproses' } }),
      SuratMasuk.count({ where: { status: 'selesai' } }),
    ]);
    res.json({ total, sudah, belum, diproses, selesai });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTerbaru = async (req, res) => {
  try {
    const data = await SuratMasuk.findAll({
      include: [{ model: Klasifikasi, as: 'klasifikasi', attributes: ['kode', 'nama_klasifikasi'] }],
      order: [['created_at', 'DESC']],
      limit: 5,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
