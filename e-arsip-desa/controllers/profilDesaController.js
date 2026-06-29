const db = require('../config/database');
const { broadcast } = require('../utils/sse');
const fs = require('fs');
const path = require('path');

exports.getProfil = async (req, res) => {
  try {
    const profil = await db.get('SELECT * FROM profil_desa LIMIT 1');
    if (!profil) {
      return res.status(404).json({ success: false, message: 'Profil desa belum diatur.' });
    }
    res.json({ success: true, data: profil });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};

exports.updateProfil = async (req, res) => {
  try {
    const profil = await db.get('SELECT * FROM profil_desa LIMIT 1');
    if (!profil) {
      return res.status(404).json({ success: false, message: 'Profil desa belum diatur.' });
    }

    const {
      nama_desa, kecamatan, kabupaten, provinsi, kode_desa,
      alamat, telepon, email, inisial_desa, kode_surat_default,
      pemisah, panjang_nomor
    } = req.body;

    const logo = req.file ? `/uploads/${req.file.filename}` : profil.logo;

    if (req.file && profil.logo) {
      const oldPath = path.join(__dirname, '..', profil.logo);
      try { fs.unlinkSync(oldPath); } catch (e) { console.error('Gagal hapus logo lama:', e); }
    }

    await db.run(
      `UPDATE profil_desa
       SET nama_desa = COALESCE(?, nama_desa),
           kecamatan = COALESCE(?, kecamatan),
           kabupaten = COALESCE(?, kabupaten),
           provinsi = COALESCE(?, provinsi),
           kode_desa = COALESCE(?, kode_desa),
           alamat = COALESCE(?, alamat),
           telepon = COALESCE(?, telepon),
           email = COALESCE(?, email),
           logo = COALESCE(?, logo),
           inisial_desa = COALESCE(?, inisial_desa),
           kode_surat_default = COALESCE(?, kode_surat_default),
           pemisah = COALESCE(?, pemisah),
           panjang_nomor = COALESCE(?, panjang_nomor),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        nama_desa || null, kecamatan || null, kabupaten || null, provinsi || null,
        kode_desa || null, alamat || null, telepon !== undefined ? telepon : null,
        email || null, logo || null, inisial_desa || null, kode_surat_default || null,
        pemisah || null, panjang_nomor !== undefined ? panjang_nomor : null,
        profil.id
      ]
    );

    const updated = await db.get('SELECT * FROM profil_desa WHERE id = ?', [profil.id]);

    await db.run(
      'INSERT INTO aktivitas (user_id, tipe, deskripsi) VALUES (?, ?, ?)',
      [req.user.id, 'profil_desa', `Memperbarui profil desa ${updated.nama_desa}`]
    );

    broadcast('profil:updated', updated);
    res.json({ success: true, message: 'Profil desa berhasil diperbarui.', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};

exports.getFormatNomor = async (req, res) => {
  try {
    const profil = await db.get('SELECT inisial_desa, kode_surat_default, pemisah, panjang_nomor FROM profil_desa LIMIT 1');
    if (!profil) {
      return res.status(404).json({ success: false, message: 'Profil desa belum diatur.' });
    }

    const now = new Date();
    const urut = String(1).padStart(profil.panjang_nomor, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const sep = profil.pemisah;

    const preview = `${urut}${sep}${profil.kode_surat_default}${sep}${profil.inisial_desa}${sep}${month}${sep}${year}`;

    res.json({
      success: true,
      data: {
        format: profil,
        preview,
        keterangan: {
          nomor_urut: urut,
          kode_surat: profil.kode_surat_default,
          inisial: profil.inisial_desa,
          bulan: month,
          tahun: year
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server.' });
  }
};
