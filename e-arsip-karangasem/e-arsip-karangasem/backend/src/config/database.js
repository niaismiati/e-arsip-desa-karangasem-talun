const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Prefer local sqlite when database file exists (local dev convenience)
const fs = require('fs');
// In development (non-production), prefer local sqlite to avoid requiring MySQL
const storagePath = path.resolve(process.cwd(), 'database.sqlite');
if (process.env.NODE_ENV !== 'production') {
  const sequelize = new Sequelize({ dialect: 'sqlite', storage: storagePath, logging: false });
  module.exports = sequelize;
} else if (fs.existsSync(storagePath)) {
  const sequelize = new Sequelize({ dialect: 'sqlite', storage: storagePath, logging: false });
  module.exports = sequelize;
} else if (!process.env.DB_HOST) {
  // fallback to sqlite in backend folder (will create file)
  const sequelize = new Sequelize({ dialect: 'sqlite', storage: storagePath, logging: false });
  module.exports = sequelize;
} else {
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      logging: false,
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
      timezone: '+07:00',
    }
  );
  module.exports = sequelize;
}
