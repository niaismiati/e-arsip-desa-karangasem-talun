const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SuratMasuk = sequelize.define('SuratMasuk', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nomor_surat: { type: DataTypes.STRING(100), allowNull: false },
  asal_surat: { type: DataTypes.STRING(200), allowNull: false },
  perihal: { type: DataTypes.STRING(500), allowNull: false },
  tanggal_surat: { type: DataTypes.DATEONLY, allowNull: false },
  tanggal_terima: { type: DataTypes.DATEONLY, allowNull: false },
  klasifikasi_id: { type: DataTypes.INTEGER, references: { model: 'klasifikasi', key: 'id' } },
  lampiran: { type: DataTypes.STRING(255) },
  keterangan: { type: DataTypes.TEXT },
  status: {
    type: DataTypes.ENUM('belum_disposisi', 'sudah_disposisi', 'diproses', 'selesai'),
    defaultValue: 'belum_disposisi',
  },
  created_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
}, { tableName: 'surat_masuk', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = SuratMasuk;
