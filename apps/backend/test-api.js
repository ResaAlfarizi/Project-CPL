/**
 * TEST API SCRIPT
 * Script sederhana untuk test backend API
 * 
 * Cara pakai:
 * 1. Pastikan backend sudah jalan (node app.js)
 * 2. Jalankan: node test-api.js
 */

const API_URL = 'http://localhost:3000/api/v1/m2';

// Helper function untuk fetch
async function testAPI(endpoint, options = {}) {
  try {
    const url = `${API_URL}${endpoint}`;
    console.log(`\n🔍 Testing: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Success (${response.status})`);
      console.log('Response:', JSON.stringify(data, null, 2).substring(0, 500));
      return { success: true, data };
    } else {
      console.log(`❌ Failed (${response.status})`);
      console.log('Error:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main test function
async function runTests() {
  console.log('='.repeat(60));
  console.log('🧪 BACKEND API TEST');
  console.log('='.repeat(60));
  
  // Test 1: Health Check
  console.log('\n📋 Test 1: Health Check');
  await testAPI('/../..', { method: 'GET' });
  
  // Test 2: Login
  console.log('\n📋 Test 2: Login Mahasiswa');
  const loginResult = await testAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'mhs1@if.ac.id',
      password: 'password123',
    }),
  });
  
  if (!loginResult.success) {
    console.log('\n❌ Login gagal! Test dihentikan.');
    console.log('Pastikan:');
    console.log('1. Backend sudah jalan (node app.js)');
    console.log('2. Database sudah terisi (06_dummy_data_lengkap.sql)');
    console.log('3. Password sudah di-hash dengan benar');
    return;
  }
  
  const token = loginResult.data.token;
  console.log(`\n🔑 Token received: ${token.substring(0, 30)}...`);
  
  // Test 3: Get Profile
  console.log('\n📋 Test 3: Get Mahasiswa Profile');
  await testAPI('/profile/mahasiswa/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  // Test 4: Get Capaian
  console.log('\n📋 Test 4: Get Capaian Mahasiswa');
  const capaianResult = await testAPI('/capaian/mahasiswa/my-capaian', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (capaianResult.success && capaianResult.data.data) {
    console.log(`\n📊 Capaian Summary:`);
    console.log(`Total CPL: ${capaianResult.data.data.length}`);
    capaianResult.data.data.forEach((cpl, idx) => {
      console.log(`  ${idx + 1}. ${cpl.kode_cpl}: ${cpl.persentase_capaian?.toFixed(2)}% (${cpl.status_capaian})`);
    });
  }
  
  // Test 5: Get Capaian Detail
  console.log('\n📋 Test 5: Get Capaian Detail');
  await testAPI('/capaian/mahasiswa/my-capaian/detail', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  // Test 6: Get All Prodi
  console.log('\n📋 Test 6: Get All Program Studi');
  const prodiResult = await testAPI('/prodi', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (prodiResult.success && prodiResult.data.data) {
    console.log(`\n📚 Program Studi Summary:`);
    console.log(`Total Prodi: ${prodiResult.data.data.length}`);
    prodiResult.data.data.forEach((prodi, idx) => {
      console.log(`  ${idx + 1}. ${prodi.kode_prodi} - ${prodi.nama_prodi} (${prodi.jenjang})`);
    });
  }
  
  // Test 7: Get All CPL
  console.log('\n📋 Test 7: Get All CPL');
  const cplResult = await testAPI('/cpl', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (cplResult.success && cplResult.data.data) {
    console.log(`\n🎯 CPL Summary:`);
    console.log(`Total CPL: ${cplResult.data.data.length}`);
  }
  
  // Test 8: Get All Kelas
  console.log('\n📋 Test 8: Get All Kelas');
  await testAPI('/kelas', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  // Test 9: Get All Sub-CPMK
  console.log('\n📋 Test 9: Get All Sub-CPMK');
  await testAPI('/sub-cpmk', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ TEST SELESAI');
  console.log('='.repeat(60));
  console.log('\nJika semua test berhasil, backend berjalan dengan baik!');
  console.log('Silakan buka frontend di: http://localhost:3001/login');
  console.log('Login dengan: mhs1@if.ac.id / password123');
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Fatal Error:', error);
  process.exit(1);
});
