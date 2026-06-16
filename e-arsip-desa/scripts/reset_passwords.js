const db = require('../config/database');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const defaultPassword = 'password123';
    const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

    await db.run('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'admin@karangasem.desa.id']);
    await db.run('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'kades@karangasem.desa.id']);
    await db.run('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'operator@karangasem.desa.id']);

    console.log('✅ Passwords reset to default: password123');

    const users = await db.all('SELECT nama, email, role FROM users');
    console.log('\nUsers:');
    users.forEach(u => console.log('- ' + u.nama + ' (' + u.role + '): ' + u.email));
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
})();
