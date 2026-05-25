/**
 * TEST DATABASE CONNECTION
 * Script untuk test koneksi ke PostgreSQL
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function testConnection() {
  console.log('='.repeat(60));
  console.log('🔍 TESTING DATABASE CONNECTION');
  console.log('='.repeat(60));
  
  console.log('\n📋 Configuration:');
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`Port: ${process.env.DB_PORT}`);
  console.log(`Database: ${process.env.DB_NAME}`);
  console.log(`User: ${process.env.DB_USER}`);
  console.log(`Password: ${'*'.repeat(process.env.DB_PASSWORD?.length || 0)}`);
  
  try {
    console.log('\n🔌 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    // Test query
    console.log('\n📊 Testing query...');
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Query successful!');
    console.log(`Current Time: ${result.rows[0].current_time}`);
    console.log(`PostgreSQL Version: ${result.rows[0].pg_version.substring(0, 50)}...`);
    
    // Check tables
    console.log('\n📋 Checking tables...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log(`✅ Found ${tables.rows.length} tables:`);
    tables.rows.forEach((row, idx) => {
      console.log(`  ${idx + 1}. ${row.table_name}`);
    });
    
    // Check users
    console.log('\n👥 Checking users...');
    const users = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Total users: ${users.rows[0].count}`);
    
    // Check mahasiswa user
    console.log('\n🎓 Checking mahasiswa user...');
    const mahasiswa = await client.query(`
      SELECT u.email, r.nama_role, m.nim, m.nama 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN mahasiswa m ON u.entity_id = m.id
      WHERE u.email = 'mhs1@if.ac.id'
    `);
    
    if (mahasiswa.rows.length > 0) {
      console.log('✅ Mahasiswa user found:');
      console.log(`  Email: ${mahasiswa.rows[0].email}`);
      console.log(`  Role: ${mahasiswa.rows[0].nama_role}`);
      console.log(`  NIM: ${mahasiswa.rows[0].nim}`);
      console.log(`  Nama: ${mahasiswa.rows[0].nama}`);
    } else {
      console.log('❌ Mahasiswa user NOT FOUND!');
      console.log('   Anda perlu menjalankan: 06_dummy_data_lengkap.sql');
    }
    
    client.release();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ DATABASE CONNECTION TEST PASSED');
    console.log('='.repeat(60));
    
    process.exit(0);
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ DATABASE CONNECTION FAILED');
    console.log('='.repeat(60));
    console.error('\nError:', error.message);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Pastikan PostgreSQL sudah running');
    console.log('2. Cek kredensial di file .env');
    console.log('3. Pastikan database "projectcpl" sudah dibuat');
    console.log('4. Cek firewall tidak block port 5432');
    
    process.exit(1);
  }
}

testConnection();
