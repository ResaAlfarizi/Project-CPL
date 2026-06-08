/**
 * Check if all files that use THEME_COLOR have it defined
 */

const fs = require('fs');
const path = require('path');

const files = [
  './src/screens/super-admin/sa_audit_log.js',
  './src/screens/super-admin/sa_hak_user.js',
  './src/screens/super-admin/sa_input_nilai.js',
  './src/screens/super-admin/sa_kelola_cpl.js',
  './src/screens/super-admin/sa_kelola_mk.js',
  './src/screens/super-admin/sa_kelola_prodi.js',
  './src/screens/super-admin/sa_kelola_subcpmk.js',
  './src/screens/super-admin/sa_kelola_user.js',
  './src/screens/super-admin/sa_mahasiswa_dosen.js',
  './src/screens/super-admin/sa_pantau_capaian.js',
  './src/screens/super-admin/sa_pemetaan_mk_cpl.js',
  './src/screens/super-admin/sa_threshold.js',
];

console.log('\n🔍 Checking THEME_COLOR definitions...\n');

let issues = [];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${path.basename(file)} - FILE NOT FOUND`);
    issues.push(file);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file uses THEME_COLOR
  const usesTHEME_COLOR = content.includes('THEME_COLOR');
  
  // Check if THEME_COLOR is defined
  const definesTHEME_COLOR = /const\s+THEME_COLOR\s*=/.test(content);
  
  if (usesTHEME_COLOR && !definesTHEME_COLOR) {
    console.log(`❌ ${path.basename(file)} - USES THEME_COLOR BUT NOT DEFINED`);
    issues.push(file);
  } else if (usesTHEME_COLOR && definesTHEME_COLOR) {
    console.log(`✅ ${path.basename(file)} - OK`);
  } else {
    console.log(`⚪ ${path.basename(file)} - Does not use THEME_COLOR`);
  }
});

console.log('\n' + '='.repeat(60));

if (issues.length === 0) {
  console.log('\n✅ ALL FILES OK! No THEME_COLOR issues found.\n');
  process.exit(0);
} else {
  console.log(`\n❌ FOUND ${issues.length} ISSUE(S):\n`);
  issues.forEach(file => console.log(`  - ${file}`));
  console.log('\n');
  process.exit(1);
}
