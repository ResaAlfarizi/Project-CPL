/**
 * Comprehensive check for all color constants
 */

const fs = require('fs');
const path = require('path');

const CONSTANTS_TO_CHECK = [
  'THEME_COLOR',
  'PRIMARY_BLUE',
  'PRIMARY_DARK',
  'DANGER_COLOR',
  'SUCCESS_COLOR',
  'DARK_PINK',
  'CANCEL_BG',
  'FAB_COLOR',
  'CANCEL_TEXT',
];

console.log('\n🔍 Checking all color constants across all screens...\n');

// Define files to check
const screenFiles = [
  // Admin Prodi
  './src/screens/admin-prodi/dashboard.js',
  './src/screens/admin-prodi/kelola_cpl.js',
  './src/screens/admin-prodi/kelola_mk.js',
  './src/screens/admin-prodi/kelola_subcpmk.js',
  './src/screens/admin-prodi/kelola_user.js',
  './src/screens/admin-prodi/pantau_capaian.js',
  './src/screens/admin-prodi/pantau_nilai.js',
  './src/screens/admin-prodi/audit_log.js',
  './src/screens/admin-prodi/profil_admin.js',
  // Dosen
  './src/screens/dosen/DosenMainScreen.js',
  './src/screens/dosen/MataKuliahScreen.js',
  './src/screens/dosen/InputNilaiScreen.js',
  './src/screens/dosen/SubCpmkScreen.js',
  './src/screens/dosen/CapaianScreen.js',
  './src/screens/dosen/ProdiCplScreen.js',
  './src/screens/dosen/ProfilDetailScreen.js',
  // Mahasiswa
  './src/screens/mahasiswa/MahasiswaMainScreen.js',
  './src/screens/mahasiswa/DashboardScreen.js',
  './src/screens/mahasiswa/CapaianScreen.js',
  './src/screens/mahasiswa/MataKuliahScreen.js',
  './src/screens/mahasiswa/SubCpmkScreen.js',
  './src/screens/mahasiswa/ProgramStudiScreen.js',
  './src/screens/mahasiswa/ProfileScreen.js',
  // Superadmin
  './src/screens/super-admin/dashboard.js',
  './src/screens/super-admin/sa_profil.js',
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

let totalIssues = 0;
const issues = {};

screenFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${path.basename(file)} - FILE NOT FOUND`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(file);
  const fileIssues = [];
  
  CONSTANTS_TO_CHECK.forEach(constant => {
    // Check if constant is used
    const usesConstant = new RegExp(`\\b${constant}\\b`).test(content);
    
    if (usesConstant) {
      // Check if constant is defined
      const definesConstant = new RegExp(`const\\s+${constant}\\s*=`).test(content);
      
      if (!definesConstant) {
        // Check if it's imported
        const importsConstant = new RegExp(`import.*${constant}.*from`).test(content);
        
        if (!importsConstant) {
          fileIssues.push(`❌ Uses ${constant} but NOT defined or imported`);
          totalIssues++;
        }
      }
    }
  });
  
  if (fileIssues.length > 0) {
    issues[fileName] = fileIssues;
  }
});

console.log('='.repeat(70));

if (totalIssues === 0) {
  console.log('\n✅ ALL FILES OK! No missing constant definitions found.\n');
  console.log(`Checked ${screenFiles.length} files across all roles.`);
  console.log('\n');
  process.exit(0);
} else {
  console.log(`\n❌ FOUND ${totalIssues} ISSUE(S) in ${Object.keys(issues).length} file(s):\n`);
  
  Object.entries(issues).forEach(([file, fileIssues]) => {
    console.log(`📄 ${file}:`);
    fileIssues.forEach(issue => console.log(`   ${issue}`));
    console.log('');
  });
  
  process.exit(1);
}
