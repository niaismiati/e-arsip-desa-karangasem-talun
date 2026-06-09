const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Disposisi = sequelize.define('Disposisi', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  surat_masuk_id: { type: DataTypes.INTEGER, allowNull: false },
  dari_user_id: { type: DataTypes.INTEGER, allowNull: false },
  kepada_user_id: { type: DataTypes.INTEGER, allowNull: false },
  isi_disposisi: { type: DataTypes.TEXT, allowNull: false },
  catatan: { type: DataTypes.TEXT },
  status: {
    type: DataTypes.ENUM('menunggu', 'diterima', 'selesai'),
    defaultValue: 'menunggu',
  },
  tanggal_disposisi: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  tanggal_selesai: { type: DataTypes.DATE },
}, { tableName: 'disposisi', timestamps: false });

module.exports = Disposisi;
