const app = require('./src/app');
const sequelize = require('./src/config/database');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Database terhubung');
    // Ensure critical migrations for local sqlite
    const ensureTables = async () => {
      try {
        if (sequelize.getDialect && sequelize.getDialect() === 'sqlite') {
          const ensureTableColumns = async (table, columns) => {
            const [cols] = await sequelize.query(`PRAGMA table_info('${table}')`);
            const existing = new Set((cols || []).map((c) => c.name));
            for (const [name, sql] of Object.entries(columns)) {
              if (!existing.has(name)) {
                console.log(`ℹ️ Menambahkan kolom ${name} ke tabel ${table} (sqlite)`);
                await sequelize.query(`ALTER TABLE ${table} ADD COLUMN ${name} ${sql};`);
              }
            }
          };
          
          // Users columns
          await ensureTableColumns('users', {
            username: 'VARCHAR(50)',
            jabatan: 'VARCHAR(100)',
            desa: "VARCHAR(100) DEFAULT 'Desa Karangasem'",
            is_active: 'BOOLEAN DEFAULT 1',
            role: "TEXT DEFAULT 'operator'",
            created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
            updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
          });
          
          // Surat Masuk columns
          await ensureTableColumns('surat_masuk', {
            created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
            updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
          });
          
          // Surat Keluar columns
          await ensureTableColumns('surat_keluar', {
            created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
            updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
          });
        }
      } catch (e) {
        console.warn('⚠️ Gagal memastikan kolom:', e.message || e);
      }
    };
    return ensureTables().then(() => sequelize.sync());
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Gagal terhubung ke database:', err);
    if (err && err.stack) console.error(err.stack);
    process.exit(1);
  });
