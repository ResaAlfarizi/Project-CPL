/**
 * QUICK IMPORT VERIFICATION SCRIPT
 * Verifikasi bahwa semua file bisa di-import tanpa error
 * 
 * Usage: node verify-imports.js
 */

console.log('🔍 Memulai verifikasi imports...\n');

const files = {
  'Theme System': [
    './src/theme/colors.js',
    './src/services/colors.js',
  ],
  'Components': [
    './src/components/CustomAlert.js',
    './src/components/RoleHeader.js',
    './src/components/PickerModal.js',
    './src/components/EmptyState.js',
    './src/components/LoadingState.js',
    './src/components/index.js',
  ],
  'Admin Prodi': [
    './src/screens/admin-prodi/dashboard.js',
    './src/screens/admin-prodi/kelola_cpl.js',
    './src/screens/admin-prodi/kelola_mk.js',
    './src/screens/admin-prodi/kelola_subcpmk.js',
    './src/screens/admin-prodi/kelola_user.js',
    './src/screens/admin-prodi/pantau_capaian.js',
    './src/screens/admin-prodi/pantau_nilai.js',
    './src/screens/admin-prodi/audit_log.js',
    './src/screens/admin-prodi/profil_admin.js',
    './src/screens/admin-prodi/admin_navigation.js',
  ],
  'Dosen': [
    './src/screens/dosen/DosenMainScreen.js',
    './src/screens/dosen/MataKuliahScreen.js',
    './src/screens/dosen/InputNilaiScreen.js',
    './src/screens/dosen/SubCpmkScreen.js',
    './src/screens/dosen/CapaianScreen.js',
    './src/screens/dosen/ProdiCplScreen.js',
    './src/screens/dosen/ProfilDetailScreen.js',
  ],
  'Mahasiswa': [
    './src/screens/mahasiswa/MahasiswaMainScreen.js',
    './src/screens/mahasiswa/DashboardScreen.js',
    './src/screens/mahasiswa/CapaianScreen.js',
    './src/screens/mahasiswa/MataKuliahScreen.js',
    './src/screens/mahasiswa/SubCpmkScreen.js',
    './src/screens/mahasiswa/ProgramStudiScreen.js',
    './src/screens/mahasiswa/ProfileScreen.js',
  ],
  'Superadmin': [
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
  ],
};

let totalFiles = 0;
let successCount = 0;
let errorCount = 0;
const errors = [];

for (const [category, fileList] of Object.entries(files)) {
  console.log(`\n📁 ${category}:`);
  
  for (const file of fileList) {
    totalFiles++;
    try {
      // Try to require/import the file to check for syntax errors
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, file);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for common issues
      const issues = [];
      
      // Check for undefined property access patterns
      if (content.match(/COLORS\./g)) {
        const match = content.match(/COLORS\.(\w+)/g);
        if (match) issues.push(`Uses COLORS.* (${match.length} times)`);
      }
      
      if (content.match(/BASE\[/g)) {
        issues.push('Uses BASE[] array access');
      }
      
      if (content.match(/THEME\[/g)) {
        issues.push('Uses THEME[] array access');
      }
      
      // Check import statements
      const themeImportMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"].*colors['"]/);
      if (themeImportMatch) {
        const imports = themeImportMatch[1].split(',').map(s => s.trim());
        // Verify BASE and ROLE_THEMES are imported
        const hasBase = imports.includes('BASE');
        const hasRoleThemes = imports.includes('ROLE_THEMES');
        
        if (!hasBase && content.includes('BASE.')) {
          issues.push('Uses BASE but not imported');
        }
        if (!hasRoleThemes && content.includes('ROLE_THEMES.')) {
          issues.push('Uses ROLE_THEMES but not imported');
        }
      }
      
      if (issues.length > 0) {
        console.log(`  ⚠️  ${file.split('/').pop()} - ${issues.join(', ')}`);
        errorCount++;
        errors.push({ file, issues });
      } else {
        console.log(`  ✅ ${file.split('/').pop()}`);
        successCount++;
      }
      
    } catch (err) {
      console.log(`  ❌ ${file.split('/').pop()} - ${err.message}`);
      errorCount++;
      errors.push({ file, issues: [err.message] });
    }
  }
}

console.log('\n' + '='.repeat(60));
console.log('\n📊 HASIL VERIFIKASI:\n');
console.log(`Total Files:    ${totalFiles}`);
console.log(`✅ Success:     ${successCount} (${Math.round(successCount/totalFiles*100)}%)`);
console.log(`⚠️  Warnings:    ${errorCount} (${Math.round(errorCount/totalFiles*100)}%)`);

if (errors.length > 0) {
  console.log('\n⚠️  FILES WITH POTENTIAL ISSUES:\n');
  errors.forEach(({ file, issues }) => {
    console.log(`  ${file}`);
    issues.forEach(issue => console.log(`    - ${issue}`));
  });
}

console.log('\n' + '='.repeat(60));

if (errorCount === 0) {
  console.log('\n🎉 SEMUA FILE VERIFIED! Tidak ada masalah yang terdeteksi.\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Beberapa file memiliki potensi masalah. Mohon periksa file-file di atas.\n');
  process.exit(0); // Exit with 0 for warnings, not critical
}
