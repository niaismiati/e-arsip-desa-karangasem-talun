require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const { User, Klasifikasi, SuratMasuk, SuratKeluar } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log('📦 Tabel berhasil dibuat ulang');

    const users = await User.bulkCreate([
      { nama: 'Administrator', username: 'admin', email: 'admin@karangasem.desa.id', password: await bcrypt.hash('admin123', 10), role: 'admin', jabatan: 'Administrator', desa: 'Desa Karangasem', is_active: true },
      { nama: 'Operator Desa', username: 'operator', email: 'operator@karangasem.desa.id', password: await bcrypt.hash('operator123', 10), role: 'operator', jabatan: 'Operator', desa: 'Desa Karangasem', is_active: true },
      { nama: 'Kepala Desa', username: 'kades', email: 'kades@karangasem.desa.id', password: await bcrypt.hash('kades123', 10), role: 'pimpinan', jabatan: 'Kepala Desa', desa: 'Desa Karangasem', is_active: true },
    ]);
    console.log('👤 Users berhasil dibuat');

    const klasifikasi = await Klasifikasi.bulkCreate([
      { kode: '000', nama_klasifikasi: 'Umum', keterangan: 'Musrenbang Desa, Laporan, Protokol' },
      { kode: '100', nama_klasifikasi: 'Pemerintahan', keterangan: 'Pembagian Wilayah, Administrasi Desa' },
      { kode: '400', nama_klasifikasi: 'Kesejahteraan Masyarakat', keterangan: 'Sosial, Pendidikan, Kebudayaan, Kesehatan' },
      { kode: '800', nama_klasifikasi: 'Kepegawaian', keterangan: 'Surat Tugas/Perintah Dinas' },
      { kode: '900', nama_klasifikasi: 'Keuangan', keterangan: 'APBDes/RAPBD, Laporan Keuangan' },
    ]);
    console.log('🗂️ Klasifikasi berhasil dibuat');

    await SuratMasuk.bulkCreate([
      { nomor_surat: '005/123/PMD/VI/2026', asal_surat: 'Dinas PMD Kab. Bojonegoro', perihal: 'Undangan Musrenbang Desa', tanggal_surat: '2026-06-10', tanggal_terima: '2026-06-12', klasifikasi_id: klasifikasi[0].id, status: 'sudah_disposisi', created_by: users[1].id },
      { nomor_surat: '400/256/Kec/VI/2026', asal_surat: 'Kecamatan Ngraho', perihal: 'Pemberitahuan Kegiatan Lomba Desa', tanggal_surat: '2026-06-08', tanggal_terima: '2026-06-10', klasifikasi_id: klasifikasi[2].id, status: 'belum_disposisi', created_by: users[1].id },
      { nomor_surat: '300/112/DPMD/VI/2026', asal_surat: 'DPMD Kab. Bojonegoro', perihal: 'Laporan Keuangan Desa', tanggal_surat: '2026-06-07', tanggal_terima: '2026-06-09', klasifikasi_id: klasifikasi[4].id, status: 'sudah_disposisi', created_by: users[1].id },
      { nomor_surat: '100/078/Dispem/VI/2026', asal_surat: 'Dinas Kependudukan', perihal: 'Data Penduduk Semester I', tanggal_surat: '2026-06-05', tanggal_terima: '2026-06-08', klasifikasi_id: klasifikasi[1].id, status: 'diproses', created_by: users[1].id },
      { nomor_surat: '800/034/BKPSDM/VI/2026', asal_surat: 'BKPSDM Kab. Bojonegoro', perihal: 'Surat Tugas', tanggal_surat: '2026-06-03', tanggal_terima: '2026-06-07', klasifikasi_id: klasifikasi[3].id, status: 'selesai', created_by: users[1].id },
    ]);
    console.log('📬 Surat Masuk berhasil dibuat');

    await SuratKeluar.bulkCreate([
      { nomor_surat: '470/145/DS/VI/2026', tanggal_surat: '2026-06-13', tujuan_surat: 'Dinas PMD Kabupaten Bojonegoro', perihal: 'Surat Pengantar Laporan Pertanggungjawaban APBDes', klasifikasi_id: klasifikasi[4].id, created_by: users[1].id },
      { nomor_surat: '474/089/DS/VI/2026', tanggal_surat: '2026-06-11', tujuan_surat: 'Warga: Budi Santoso', perihal: 'Surat Pengantar Nikah (N1)', klasifikasi_id: klasifikasi[0].id, created_by: users[1].id },
      { nomor_surat: '143/012/DS/VI/2026', tanggal_surat: '2026-06-09', tujuan_surat: 'Warga: Siti Aminah', perihal: 'Surat Keterangan Domisili', klasifikasi_id: klasifikasi[1].id, created_by: users[1].id },
    ]);
    console.log('📤 Surat Keluar berhasil dibuat');

    console.log('\n✅ Seed selesai!');
    console.log('──────────────────────────────');
    console.log('Akun Login:');
    console.log('  Admin    : admin@karangasem.desa.id / admin123');
    console.log('  Operator : operator@karangasem.desa.id / operator123');
    console.log('  Kades    : kades@karangasem.desa.id / kades123');
    console.log('──────────────────────────────');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed gagal:', err.message);
    process.exit(1);
  }
}

seed();
