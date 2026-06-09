const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Klasifikasi = sequelize.define('Klasifikasi', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  kode: { type: DataTypes.STRING(10), allowNull: false },
  nama_klasifikasi: { type: DataTypes.STRING(100), allowNull: false },
  keterangan: { type: DataTypes.TEXT },
}, { tableName: 'klasifikasi', timestamps: true, createdAt: 'created_at', updatedAt: false });

module.exports = Klasifikasi;
