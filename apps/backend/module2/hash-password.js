const bcrypt = require('bcrypt');

const password = process.argv[2] || 'password123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log('\n=================================');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('=================================\n');
  console.log('Copy hash ini dan gunakan untuk UPDATE users:');
  console.log(`UPDATE users SET password_hash = '${hash}' WHERE email IN ('mhs1@if.ac.id', 'mhs2@if.ac.id', 'mhs3@if.ac.id', 'mhs4@if.ac.id', 'mhs5@if.ac.id');`);
  console.log('\n');
});
