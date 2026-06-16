const db = require('../config/database');

(async () => {
  try {
    await db.run("DELETE FROM aktivitas WHERE user_id NOT IN (SELECT id FROM users WHERE email IN ('admin@karangasem.desa.id', 'kades@karangasem.desa.id', 'operator@karangasem.desa.id'))");
    await db.run("DELETE FROM disposisi WHERE dari_user_id NOT IN (SELECT id FROM users WHERE email IN ('admin@karangasem.desa.id', 'kades@karangasem.desa.id', 'operator@karangasem.desa.id'))");
    await db.run("DELETE FROM disposisi WHERE kepada_user_id NOT IN (SELECT id FROM users WHERE email IN ('admin@karangasem.desa.id', 'kades@karangasem.desa.id', 'operator@karangasem.desa.id'))");
    await db.run("DELETE FROM users WHERE email NOT IN ('admin@karangasem.desa.id', 'kades@karangasem.desa.id', 'operator@karangasem.desa.id')");

    console.log('Test users deleted');

    const users = await db.all('SELECT nama, email, role FROM users');
    console.log('Remaining users:');
    users.forEach(u => console.log('- ' + u.nama + ' (' + u.role + '): ' + u.email));
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
})();
