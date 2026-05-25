/**
 * Script untuk generate password hash menggunakan bcrypt
 * 
 * Usage:
 *   node hash-password.js
 *   node hash-password.js mypassword
 */

const bcrypt = require('bcrypt');

// Ambil password dari argument atau gunakan default
const password = process.argv[2] || 'admin123';
const saltRounds = 10;

console.log('\n🔐 Password Hash Generator\n');
console.log('Password:', password);
console.log('Salt Rounds:', saltRounds);
console.log('\nGenerating hash...\n');

const hash = bcrypt.hashSync(password, saltRounds);

console.log('✅ Hash berhasil dibuat!\n');
console.log('Hash:', hash);
console.log('\n📋 Copy hash di atas untuk digunakan di SQL INSERT\n');

// Contoh SQL
console.log('Contoh SQL:');
console.log(`INSERT INTO users (email, password_hash, role_id) VALUES`);
console.log(`  ('user@example.com', '${hash}', '<role_id>');\n`);
