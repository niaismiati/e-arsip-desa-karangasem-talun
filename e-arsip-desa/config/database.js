const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'e_arsip_karangasem',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

const db = {
  pool,

  async get(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows[0];
  },

  async all(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows;
  },

  async run(sql, params = []) {
    const [result] = await pool.execute(sql, params);
    return { lastInsertRowid: result.insertId, changes: result.affectedRows };
  },

  async exec(sql) {
    await pool.execute(sql);
  },
};

async function initDatabase() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      nama VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'kades', 'operator') NOT NULL,
      status ENUM('Aktif', 'Nonaktif') DEFAULT 'Aktif',
      avatar VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS klasifikasi (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      kode VARCHAR(50) UNIQUE NOT NULL,
      nama VARCHAR(255) NOT NULL,
      keterangan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS surat_masuk (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      nomor_surat VARCHAR(255) NOT NULL,
      asal_surat VARCHAR(255) NOT NULL,
      perihal TEXT NOT NULL,
      tanggal_surat DATE NOT NULL,
      tanggal_terima DATE NOT NULL,
      klasifikasi_id INTEGER,
      status ENUM('Belum Disposisi', 'Diproses', 'Selesai') DEFAULT 'Belum Disposisi',
      lampiran VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (klasifikasi_id) REFERENCES klasifikasi(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS surat_keluar (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      nomor_surat VARCHAR(255) UNIQUE NOT NULL,
      tujuan_surat VARCHAR(255) NOT NULL,
      perihal TEXT NOT NULL,
      tanggal_surat DATE NOT NULL,
      klasifikasi_id INTEGER,
      lampiran VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (klasifikasi_id) REFERENCES klasifikasi(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS disposisi (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      surat_masuk_id INTEGER NOT NULL,
      dari_user_id INTEGER NOT NULL,
      kepada_user_id INTEGER NOT NULL,
      instruksi TEXT NOT NULL,
      status ENUM('Menunggu', 'Disetujui', 'Ditolak', 'Selesai') DEFAULT 'Menunggu',
      catatan TEXT,
      batas_waktu DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (surat_masuk_id) REFERENCES surat_masuk(id) ON DELETE CASCADE,
      FOREIGN KEY (dari_user_id) REFERENCES users(id),
      FOREIGN KEY (kepada_user_id) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS profil_desa (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      nama_desa VARCHAR(255) NOT NULL DEFAULT 'Desa Karangasem',
      kecamatan VARCHAR(255) NOT NULL DEFAULT 'Talun',
      kabupaten VARCHAR(255) NOT NULL DEFAULT 'Pekalongan',
      provinsi VARCHAR(255) NOT NULL DEFAULT 'Jawa Tengah',
      kode_desa VARCHAR(50) NOT NULL DEFAULT '33.26.05.2009',
      alamat TEXT NOT NULL DEFAULT 'Jl. Karangasem Talun, Karangasem, Kec. Talun, Kab. Pekalongan, Jawa Tengah',
      telepon VARCHAR(50) DEFAULT '(0285) 123456',
      email VARCHAR(255) DEFAULT 'desa@karangasem.desa.id',
      logo VARCHAR(255),
      inisial_desa VARCHAR(10) DEFAULT 'KS',
      kode_surat_default VARCHAR(10) DEFAULT '470',
      pemisah VARCHAR(5) DEFAULT '/',
      panjang_nomor INTEGER DEFAULT 3,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS aktivitas (
      id INTEGER PRIMARY KEY AUTO_INCREMENT,
      user_id INTEGER,
      tipe VARCHAR(50) NOT NULL,
      deskripsi TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  console.log('✅ Database tables initialized');
}

async function seedData() {
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    // WARNING: Ganti password default segera setelah deploy pertama!
    // Set DEFAULT_USER_PASSWORD di .env untuk kustomisasi
    const defaultPassword = process.env.DEFAULT_USER_PASSWORD || 'password123';
    const hashedPassword = bcrypt.hashSync(defaultPassword, 12);
    await db.run(
      'INSERT INTO users (nama, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      ['Admin Sistem', 'admin@karangasem.desa.id', hashedPassword, 'admin', 'Aktif']
    );
    await db.run(
      'INSERT INTO users (nama, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      ['Kepala Desa Karangasem', 'kades@karangasem.desa.id', hashedPassword, 'kades', 'Aktif']
    );
    await db.run(
      'INSERT INTO users (nama, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      ['Operator Desa Karangasem', 'operator@karangasem.desa.id', hashedPassword, 'operator', 'Aktif']
    );
    console.log('✅ Default users seeded');
  }

  const klasifikasiData = [
    ['000', 'Umum', 'Surat umum, pemberitahuan'],
    ['005', 'Umum', 'Undangan'],
    ['006', 'Umum', 'Kerja sama / MoU'],
    ['010', 'Umum', 'Instruksi / disposisi'],
    ['020', 'Umum', 'Administrasi pemerintahan'],
    ['030', 'Umum', 'Dokumentasi dan pelaporan'],
    ['040', 'Umum', 'Rapat dan koordinasi'],
    ['050', 'Perencanaan', 'Musrenbang, RKP Desa, perencanaan pembangunan'],
    ['060', 'Umum', 'Data dan informasi'],
    ['070', 'Umum', 'Monitoring dan evaluasi'],
    ['080', 'Umum', 'Tata naskah dinas'],
    ['090', 'Umum', 'Arsip dan dokumentasi'],
    ['100', 'Pemerintahan', 'Kebijakan pemerintahan'],
    ['140', 'Pemerintahan', 'Pemerintahan desa'],
    ['141', 'Pemerintahan', 'Administrasi desa'],
    ['142', 'Pemerintahan', 'Perangkat desa'],
    ['143', 'Pemerintahan', 'Musyawarah Desa (Musdes)'],
    ['144', 'Pemerintahan', 'BPD'],
    ['145', 'Pemerintahan', 'Lembaga Kemasyarakatan Desa'],
    ['146', 'Pemerintahan', 'BUMDes'],
    ['147', 'Pemerintahan', 'Kerja sama antar desa'],
    ['148', 'Pemerintahan', 'Profil desa'],
    ['149', 'Pemerintahan', 'Evaluasi pemerintahan desa'],
    ['200', 'Politik', 'Politik dan organisasi'],
    ['210', 'Politik', 'Pemilu'],
    ['220', 'Politik', 'Organisasi masyarakat'],
    ['300', 'Ketertiban', 'Keamanan dan ketertiban'],
    ['330', 'Ketertiban', 'Perlindungan masyarakat'],
    ['360', 'Ketertiban', 'Kebencanaan'],
    ['370', 'Ketertiban', 'Penanggulangan darurat'],
    ['400', 'Kesra', 'Kesejahteraan rakyat'],
    ['410', 'Kesra', 'Sosial'],
    ['420', 'Kesra', 'Pendidikan'],
    ['430', 'Kesra', 'Kesehatan'],
    ['440', 'Kesra', 'Posyandu / kesehatan masyarakat'],
    ['441', 'Kesra', 'KIA (Kesehatan Ibu dan Anak)'],
    ['442', 'Kesra', 'Gizi dan stunting'],
    ['443', 'Kesra', 'Kegiatan kesehatan desa'],
    ['450', 'Kesra', 'Pemuda dan olahraga'],
    ['460', 'Kesra', 'Kebudayaan'],
    ['470', 'Kesra', 'Kependudukan'],
    ['480', 'Kesra', 'Perlindungan perempuan dan anak'],
    ['500', 'Ekonomi', 'Perekonomian'],
    ['510', 'Ekonomi', 'Perdagangan'],
    ['521', 'Ekonomi', 'Pertanian'],
    ['522', 'Ekonomi', 'Peternakan'],
    ['523', 'Ekonomi', 'Perikanan'],
    ['524', 'Ekonomi', 'Ketahanan pangan'],
    ['530', 'Ekonomi', 'UMKM'],
    ['540', 'Ekonomi', 'Koperasi'],
    ['600', 'Pembangunan', 'Pembangunan desa'],
    ['610', 'Pembangunan', 'Perumahan'],
    ['620', 'Pembangunan', 'Jalan dan jembatan'],
    ['630', 'Pembangunan', 'Irigasi'],
    ['640', 'Pembangunan', 'Tata ruang'],
    ['650', 'Pembangunan', 'Lingkungan hidup'],
    ['660', 'Pembangunan', 'Infrastruktur desa'],
    ['700', 'Pengawasan', 'Audit dan pengawasan'],
    ['710', 'Pengawasan', 'Monitoring kegiatan'],
    ['720', 'Pengawasan', 'Evaluasi program'],
    ['800', 'Kepegawaian', 'Aparatur desa'],
    ['810', 'Kepegawaian', 'Pengangkatan perangkat'],
    ['820', 'Kepegawaian', 'Penilaian kinerja'],
    ['900', 'Keuangan', 'Keuangan'],
    ['910', 'Keuangan', 'APBDes'],
    ['920', 'Keuangan', 'Dana Desa'],
    ['930', 'Keuangan', 'Aset desa'],
    ['940', 'Keuangan', 'Pelaporan keuangan'],
  ];

  for (const [kode, nama, keterangan] of klasifikasiData) {
    await db.run(
      'INSERT IGNORE INTO klasifikasi (kode, nama, keterangan) VALUES (?, ?, ?)',
      [kode, nama, keterangan]
    );
  }
  console.log('✅ Klasifikasi data seeded');

  const profilCount = await db.get('SELECT COUNT(*) as count FROM profil_desa');
  if (profilCount.count === 0) {
    await db.run(
      `INSERT INTO profil_desa (nama_desa, kecamatan, kabupaten, provinsi, kode_desa, alamat, telepon, email, inisial_desa, kode_surat_default, pemisah, panjang_nomor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['Desa Karangasem', 'Talun', 'Pekalongan', 'Jawa Tengah', '33.26.05.2009',
       'Jl. Karangasem Talun, Karangasem, Kec. Talun, Kab. Pekalongan, Jawa Tengah',
       '(0285) 123456', 'desa@karangasem.desa.id', 'KS', '470', '/', 3]
    );
    console.log('✅ Default profil desa seeded');
  }

  const suratMasukCount = await db.get('SELECT COUNT(*) as count FROM surat_masuk');
  if (suratMasukCount.count === 0) {
    await db.run(
      'INSERT INTO surat_masuk (nomor_surat, asal_surat, perihal, tanggal_surat, tanggal_terima, klasifikasi_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['005/123/PMD/VI/2024', 'Dinas PMD Kab. Pekalongan', 'Undangan Musrenbang Desa', '2024-06-12', '2024-06-12', 1, 'Belum Disposisi']
    );
    await db.run(
      'INSERT INTO surat_masuk (nomor_surat, asal_surat, perihal, tanggal_surat, tanggal_terima, klasifikasi_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['042/KEC/TLN/VI/2024', 'Kecamatan Talun', 'Pemberitahuan Lomba Desa', '2024-06-11', '2024-06-11', 1, 'Diproses']
    );
    await db.run(
      'INSERT INTO surat_masuk (nomor_surat, asal_surat, perihal, tanggal_surat, tanggal_terima, klasifikasi_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['018/BD/VI/2024', 'Bidan Desa', 'Laporan Kegiatan Posyandu', '2024-06-10', '2024-06-10', 3, 'Selesai']
    );
    console.log('✅ Sample surat masuk seeded');
  }

  const suratKeluarCount = await db.get('SELECT COUNT(*) as count FROM surat_keluar');
  if (suratKeluarCount.count === 0) {
    await db.run(
      'INSERT INTO surat_keluar (nomor_surat, tujuan_surat, perihal, tanggal_surat, klasifikasi_id) VALUES (?, ?, ?, ?, ?)',
      ['001/470/KS/06/2024', 'Warga: Budi Santoso', 'Surat Pengantar Nikah', '2024-06-11', 1]
    );
    await db.run(
      'INSERT INTO surat_keluar (nomor_surat, tujuan_surat, perihal, tanggal_surat, klasifikasi_id) VALUES (?, ?, ?, ?, ?)',
      ['002/470/KS/06/2024', 'Warga: Siti Aminah', 'Surat Keterangan Domisili', '2024-06-09', 1]
    );
    console.log('✅ Sample surat keluar seeded');
  }

  const disposisiCount = await db.get('SELECT COUNT(*) as count FROM disposisi');
  if (disposisiCount.count === 0) {
    const suratMasukRows = await db.all('SELECT id, status FROM surat_masuk ORDER BY id ASC');
    const userRows = await db.all('SELECT id, role FROM users ORDER BY id ASC');
    const adminUser = userRows.find(u => u.role === 'admin') || userRows[0];
    const kadesUser = userRows.find(u => u.role === 'kades') || userRows[0];
    const operatorUser = userRows.find(u => u.role === 'operator') || userRows[0];

    if (suratMasukRows.length > 0 && userRows.length >= 2) {
      if (suratMasukRows[0]) {
        await db.run(
          'INSERT INTO disposisi (surat_masuk_id, dari_user_id, kepada_user_id, instruksi, status, catatan, batas_waktu) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [suratMasukRows[0].id, adminUser.id, operatorUser.id, 'Mohon ditindaklanjuti undangan Musrenbang.', 'Menunggu', null, '2024-06-20']
        );
        await db.run("UPDATE surat_masuk SET status = 'Diproses' WHERE id = ?", [suratMasukRows[0].id]);
      }

      if (suratMasukRows[1]) {
        await db.run(
          'INSERT INTO disposisi (surat_masuk_id, dari_user_id, kepada_user_id, instruksi, status, catatan, batas_waktu) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [suratMasukRows[1].id, adminUser.id, kadesUser.id, 'Mohon persetujuan untuk mengikuti lomba desa.', 'Disetujui', 'Setuju, segera persiapkan.', '2024-06-18']
        );
        await db.run("UPDATE surat_masuk SET status = 'Diproses' WHERE id = ?", [suratMasukRows[1].id]);
      }

      console.log('✅ Sample disposisi seeded');
    } else {
      console.log('⚠️ Disposisi seed skipped: insufficient data');
    }
  }

  console.log('✅ Seed complete');
}

(async () => {
  try {
    await initDatabase();
    await seedData();
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
    process.exit(1);
  }
})();

module.exports = db;
