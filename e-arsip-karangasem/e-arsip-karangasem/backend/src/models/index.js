const User = require('./User');
const Klasifikasi = require('./Klasifikasi');
const SuratMasuk = require('./SuratMasuk');
const SuratKeluar = require('./SuratKeluar');
const Disposisi = require('./Disposisi');

// Associations
SuratMasuk.belongsTo(Klasifikasi, { foreignKey: 'klasifikasi_id', as: 'klasifikasi' });
SuratMasuk.belongsTo(User, { foreignKey: 'created_by', as: 'pembuat' });
Klasifikasi.hasMany(SuratMasuk, { foreignKey: 'klasifikasi_id' });

SuratKeluar.belongsTo(Klasifikasi, { foreignKey: 'klasifikasi_id', as: 'klasifikasi' });
SuratKeluar.belongsTo(User, { foreignKey: 'created_by', as: 'pembuat' });

Disposisi.belongsTo(SuratMasuk, { foreignKey: 'surat_masuk_id', as: 'surat' });
Disposisi.belongsTo(User, { foreignKey: 'dari_user_id', as: 'dari' });
Disposisi.belongsTo(User, { foreignKey: 'kepada_user_id', as: 'kepada' });
SuratMasuk.hasMany(Disposisi, { foreignKey: 'surat_masuk_id', as: 'disposisi' });

module.exports = { User, Klasifikasi, SuratMasuk, SuratKeluar, Disposisi };
