// Script untuk generate password hash
// Usage: node generate-hash.js <password>

const bcrypt = require('bcrypt');

const password = process.argv[2] || 'test123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds).then((hash) => {
  console.log('\n=================================');
  console.log('Password Hash Generator');
  console.log('=================================');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('=================================\n');
  console.log('SQL Query untuk insert user:');
  console.log(`
INSERT INTO users (email, password_hash, role_id, created_at, updated_at)
VALUES (
  'test@example.com',
  '${hash}',
  1,
  NOW(),
  NOW()
);
  `);
  console.log('=================================\n');
}).catch((error) => {
  console.error('Error generating hash:', error);
});
