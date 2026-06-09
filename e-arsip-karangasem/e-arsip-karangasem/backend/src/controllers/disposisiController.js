const { Disposisi, SuratMasuk, User, Klasifikasi } = require('../models');
const { broadcast } = require('../utils/sse');

exports.getAll = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const where = {};
    if (status) where.status = status;

    // Pimpinan hanya lihat disposisi yang ditujukan kepadanya
    if (req.user.role === 'pimpinan') where.kepada_user_id = req.user.id;

    const offset = (page - 1) * limit;
    const { count, rows } = await Disposisi.findAndCountAll({
      where,
      include: [
        {
          model: SuratMasuk, as: 'surat',
          include: [{ model: Klasifikasi, as: 'klasifikasi', attributes: ['kode', 'nama_klasifikasi'] }],
        },
        { model: User, as: 'dari', attributes: ['id', 'nama', 'jabatan'] },
        { model: User, as: 'kepada', attributes: ['id', 'nama', 'jabatan'] },
      ],
      order: [['tanggal_disposisi', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Transform data to match frontend expectations
    const data = rows.map(d => ({
      id: d.id,
      surat_masuk_id: d.surat_masuk_id,
      nomor_surat: d.surat?.nomor_surat,
      asal_surat: d.surat?.asal_surat,
      surat_perihal: d.surat?.perihal,
      dari_nama: d.dari?.nama,
      dari_role: d.dari?.role,
      kepada_nama: d.kepada?.nama,
      kepada_role: d.kepada?.role,
      instruksi: d.isi_disposisi,
      status: d.status,
      batas_waktu: d.batas_waktu,
      catatan: d.catatan,
      created_at: d.createdAt,
      updated_at: d.updatedAt,
    }));

    res.json({ success: true, data, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { surat_masuk_id, kepada_user_id, isi_disposisi, catatan } = req.body;
    const disposisi = await Disposisi.create({
      surat_masuk_id, kepada_user_id, isi_disposisi, catatan,
      dari_user_id: req.user.id,
      status: 'menunggu',
    });
    // Update status surat masuk
    await SuratMasuk.update({ status: 'sudah_disposisi' }, { where: { id: surat_masuk_id } });
    res.status(201).json({ success: true, data: disposisi });
    try { broadcast('disposisi', { action: 'create', data: disposisi }); } catch (e) {}
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, catatan } = req.body;
    const disposisi = await Disposisi.findByPk(req.params.id);
    if (!disposisi) return res.status(404).json({ success: false, message: 'Disposisi tidak ditemukan' });

    const update = { status };
    if (catatan) update.catatan = catatan;
    if (status === 'selesai') {
      update.tanggal_selesai = new Date();
      await SuratMasuk.update({ status: 'selesai' }, { where: { id: disposisi.surat_masuk_id } });
    }
    await disposisi.update(update);
    res.json({ success: true, data: disposisi });
    try { broadcast('disposisi', { action: 'update', data: disposisi }); } catch (e) {}
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'pimpinan') where.kepada_user_id = req.user.id;
    const [total, menunggu, diterima, selesai] = await Promise.all([
      Disposisi.count({ where }),
      Disposisi.count({ where: { ...where, status: 'menunggu' } }),
      Disposisi.count({ where: { ...where, status: 'diterima' } }),
      Disposisi.count({ where: { ...where, status: 'selesai' } }),
    ]);
    res.json({ success: true, data: { total, menunggu, diterima, selesai } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
