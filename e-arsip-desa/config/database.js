const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

function initDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'kades', 'operator')),
      status TEXT DEFAULT 'Aktif' CHECK(status IN ('Aktif', 'Nonaktif')),
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Klasifikasi table
  db.exec(`
    CREATE TABLE IF NOT EXISTS klasifikasi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kode TEXT UNIQUE NOT NULL,
      nama TEXT NOT NULL,
      keterangan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Surat Masuk table
  db.exec(`
    CREATE TABLE IF NOT EXISTS surat_masuk (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nomor_surat TEXT NOT NULL,
      asal_surat TEXT NOT NULL,
      perihal TEXT NOT NULL,
      tanggal_surat DATE NOT NULL,
      tanggal_terima DATE NOT NULL,
      klasifikasi_id INTEGER,
      status TEXT DEFAULT 'Belum Disposisi' CHECK(status IN ('Belum Disposisi', 'Diproses', 'Selesai')),
      lampiran TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (klasifikasi_id) REFERENCES klasifikasi(id)
    )
  `);

  // Surat Keluar table
  db.exec(`
    CREATE TABLE IF NOT EXISTS surat_keluar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nomor_surat TEXT UNIQUE NOT NULL,
      tujuan_surat TEXT NOT NULL,
      perihal TEXT NOT NULL,
      tanggal_surat DATE NOT NULL,
      klasifikasi_id INTEGER,
      lampiran TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (klasifikasi_id) REFERENCES klasifikasi(id)
    )
  `);

  // Disposisi table
  db.exec(`
    CREATE TABLE IF NOT EXISTS disposisi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      surat_masuk_id INTEGER NOT NULL,
      dari_user_id INTEGER NOT NULL,
      kepada_user_id INTEGER NOT NULL,
      instruksi TEXT NOT NULL,
      status TEXT DEFAULT 'Menunggu' CHECK(status IN ('Menunggu', 'Disetujui', 'Ditolak', 'Selesai')),
      catatan TEXT,
      batas_waktu DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (surat_masuk_id) REFERENCES surat_masuk(id) ON DELETE CASCADE,
      FOREIGN KEY (dari_user_id) REFERENCES users(id),
      FOREIGN KEY (kepada_user_id) REFERENCES users(id)
    )
  `);

  // Profil Desa table
  db.exec(`
    CREATE TABLE IF NOT EXISTS profil_desa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_desa TEXT NOT NULL DEFAULT 'Desa Karangasem',
      kecamatan TEXT NOT NULL DEFAULT 'Talun',
      kabupaten TEXT NOT NULL DEFAULT 'Pekalongan',
      provinsi TEXT NOT NULL DEFAULT 'Jawa Tengah',
      kode_desa TEXT NOT NULL DEFAULT '33.26.05.2009',
      alamat TEXT NOT NULL DEFAULT 'Jl. Karangasem Talun, Karangasem, Kec. Talun, Kab. Pekalongan, Jawa Tengah',
      telepon TEXT DEFAULT '(0285) 123456',
      email TEXT DEFAULT 'desa@karangasem.desa.id',
      logo TEXT,
      inisial_desa TEXT DEFAULT 'KS',
      kode_surat_default TEXT DEFAULT '470',
      separator TEXT DEFAULT '/',
      panjang_nomor INTEGER DEFAULT 3,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Aktivitas table
  db.exec(`
    CREATE TABLE IF NOT EXISTS aktivitas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      tipe TEXT NOT NULL,
      deskripsi TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log('✅ Database tables initialized');
}

function seedData() {
  // Seed default users
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    const hashedPassword = bcrypt.hashSync('password123', 10);
    const insertUser = db.prepare(`
      INSERT INTO users (nama, email, password, role, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertUser.run('Admin Sistem', 'admin@karangasem.desa.id', hashedPassword, 'admin', 'Aktif');
    insertUser.run('Kepala Desa Karangasem', 'kades@karangasem.desa.id', hashedPassword, 'kades', 'Aktif');
    insertUser.run('Operator Desa Karangasem', 'operator@karangasem.desa.id', hashedPassword, 'operator', 'Aktif');
    console.log('✅ Default users seeded');
  }

  // Seed klasifikasi
  const klasifikasiCount = db.prepare('SELECT COUNT(*) as count FROM klasifikasi').get();
  if (klasifikasiCount.count === 0) {
    const insertKlasifikasi = db.prepare(`
      INSERT INTO klasifikasi (kode, nama, keterangan)
      VALUES (?, ?, ?)
    `);
    insertKlasifikasi.run('000', 'Umum', 'Musrenbang, Laporan, Protokol');
    insertKlasifikasi.run('100', 'Pemerintahan', 'Administrasi Desa, Pembagian Wilayah');
    insertKlasifikasi.run('400', 'Kesejahteraan', 'Sosial, Pendidikan, Kesehatan');
    insertKlasifikasi.run('800', 'Kepegawaian', 'Surat Tugas, Perjalanan Dinas');
    insertKlasifikasi.run('900', 'Keuangan', 'APBDes, Laporan Keuangan');
    console.log('✅ Default klasifikasi seeded');
  }

  // Seed profil desa
  const profilCount = db.prepare('SELECT COUNT(*) as count FROM profil_desa').get();
  if (profilCount.count === 0) {
    db.prepare(`
      INSERT INTO profil_desa (nama_desa, kecamatan, kabupaten, provinsi, kode_desa, alamat, telepon, email, inisial_desa, kode_surat_default, separator, panjang_nomor)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Desa Karangasem', 'Talun', 'Pekalongan', 'Jawa Tengah',
      '33.26.05.2009',
      'Jl. Karangasem Talun, Karangasem, Kec. Talun, Kab. Pekalongan, Jawa Tengah',
      '(0285) 123456', 'desa@karangasem.desa.id', 'KS', '470', '/', 3
    );
    console.log('✅ Default profil desa seeded');
  }

  // Seed sample surat masuk
  const suratMasukCount = db.prepare('SELECT COUNT(*) as count FROM surat_masuk').get();
  if (suratMasukCount.count === 0) {
    const insertSuratMasuk = db.prepare(`
      INSERT INTO surat_masuk (nomor_surat, asal_surat, perihal, tanggal_surat, tanggal_terima, klasifikasi_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertSuratMasuk.run('005/123/PMD/VI/2024', 'Dinas PMD Kab. Pekalongan', 'Undangan Musrenbang Desa', '2024-06-12', '2024-06-12', 1, 'Belum Disposisi');
    insertSuratMasuk.run('042/KEC/TLN/VI/2024', 'Kecamatan Talun', 'Pemberitahuan Lomba Desa', '2024-06-11', '2024-06-11', 1, 'Diproses');
    insertSuratMasuk.run('018/BD/VI/2024', 'Bidan Desa', 'Laporan Kegiatan Posyandu', '2024-06-10', '2024-06-10', 3, 'Selesai');
    console.log('✅ Sample surat masuk seeded');
  }

  // Seed sample surat keluar
  const suratKeluarCount = db.prepare('SELECT COUNT(*) as count FROM surat_keluar').get();
  if (suratKeluarCount.count === 0) {
    const insertSuratKeluar = db.prepare(`
      INSERT INTO surat_keluar (nomor_surat, tujuan_surat, perihal, tanggal_surat, klasifikasi_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertSuratKeluar.run('001/470/KS/06/2024', 'Warga: Budi Santoso', 'Surat Pengantar Nikah', '2024-06-11', 1);
    insertSuratKeluar.run('002/470/KS/06/2024', 'Warga: Siti Aminah', 'Surat Keterangan Domisili', '2024-06-09', 1);
    console.log('✅ Sample surat keluar seeded');
  }

// Seed sample disposisi
  const disposisiCount = db.prepare('SELECT COUNT(*) as count FROM disposisi').get();
  if (disposisiCount.count === 0) {
    const suratMasukRows = db.prepare('SELECT id, status FROM surat_masuk ORDER BY id ASC').all();
    const userRows = db.prepare('SELECT id, role FROM users ORDER BY id ASC').all();
    const adminUser = userRows.find(u => u.role === 'admin') || userRows[0];
    const kadesUser = userRows.find(u => u.role === 'kades') || userRows[0];
    const operatorUser = userRows.find(u => u.role === 'operator') || userRows[0];

    if (suratMasukRows.length > 0 && userRows.length >= 2) {
      const insertDisposisi = db.prepare(`
        INSERT INTO disposisi (surat_masuk_id, dari_user_id, kepada_user_id, instruksi, status, catatan, batas_waktu)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      // Disposisi untuk surat pertama: admin → operator, status Menunggu
      if (suratMasukRows[0]) {
        insertDisposisi.run(suratMasukRows[0].id, adminUser.id, operatorUser.id, 'Mohon ditindaklanjuti undangan Musrenbang.', 'Menunggu', null, '2024-06-20');
        // Update surat menjadi Diproses
        db.prepare("UPDATE surat_masuk SET status = 'Diproses' WHERE id = ?").run(suratMasukRows[0].id);
      }

      // Disposisi untuk surat kedua: admin → kades, status Disetujui
      if (suratMasukRows[1]) {
        insertDisposisi.run(suratMasukRows[1].id, adminUser.id, kadesUser.id, 'Mohon persetujuan untuk mengikuti lomba desa.', 'Disetujui', 'Setuju, segera persiapkan.', '2024-06-18');
        db.prepare("UPDATE surat_masuk SET status = 'Diproses' WHERE id = ?").run(suratMasukRows[1].id);
      }

      console.log('✅ Sample disposisi seeded');
    } else {
      console.log('⚠️ Disposisi seed skipped: insufficient data');
    }
  }

  console.log('✅ Seed complete');
}

// Initialize and seed
initDatabase();
seedData();

module.exports = db;

