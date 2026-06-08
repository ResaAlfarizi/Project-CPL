# 🚀 QUICK REFERENCE - UI/LAYOUT MODULE 2

## 🎨 Theme System

### Import Theme:
```javascript
import { BASE, ROLE_THEMES } from '../../theme/colors';
```

### Role Themes:
```javascript
const THEME = ROLE_THEMES.superadmin;   // Lavender (#cdddf4)
const THEME = ROLE_THEMES.adminProdi;   // Sky Blue (#d4e4f7)
const THEME = ROLE_THEMES.dosen;        // Green (#d1f4e0)
const THEME = ROLE_THEMES.mahasiswa;    // Orange (#fff4e6)
```

### Common Colors:
```javascript
BASE.primary        // '#24354a' - Dark navy
BASE.primaryLight   // '#577590' - Blue grey
BASE.background     // '#F6F5FA' - Light background
BASE.surface        // '#FFFFFF' - White cards
BASE.textMain       // '#212121' - Main text
BASE.textMuted      // '#64748B' - Secondary text
BASE.border         // '#E2E8F0' - Borders
BASE.success        // '#16a34a' - Success green
BASE.error          // '#c62828' - Error red
BASE.warning        // '#f59e0b' - Warning orange
```

---

## 📦 Components

### Import Components:
```javascript
import { 
  LoadingState, 
  CustomAlert, 
  EmptyState, 
  PickerModal,
  RoleHeader 
} from '../../components';
```

### Usage Examples:

#### LoadingState:
```javascript
{isLoading && (
  <LoadingState message="Memuat data..." color={BASE.primary} />
)}
```

#### CustomAlert:
```javascript
<CustomAlert
  visible={alert.visible}
  type="danger"  // info, success, warning, danger
  title="Konfirmasi"
  message="Apakah Anda yakin?"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  confirmText="Ya"
  cancelText="Tidak"
/>
```

#### EmptyState:
```javascript
<EmptyState
  icon="folder-open-outline"
  title="Tidak ada data"
  message="Belum ada data yang tersedia"
/>
```

#### PickerModal:
```javascript
<PickerModal
  visible={pickerVisible}
  title="Pilih Mata Kuliah"
  items={mkList}
  selectedValue={selectedMk}
  onSelect={(item) => setSelectedMk(item)}
  onClose={() => setPickerVisible(false)}
  displayKey="nama_mk"
  searchEnabled={true}
/>
```

---

## 🧩 Screen Template

### Basic Screen Structure:
```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE, ROLE_THEMES } from '../../theme/colors';
import { LoadingState, CustomAlert } from '../../components';

const THEME = ROLE_THEMES.adminProdi; // Change based on role

export default function MyScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // API call here
      const res = await myApi.getData();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <LoadingState message="Memuat..." />
      ) : (
        <ScrollView>
          {/* Content here */}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: BASE.background 
  },
  header: {
    backgroundColor: THEME.primary,
    padding: 20,
    // ...
  },
  card: {
    backgroundColor: BASE.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
});
```

---

## 🎯 Common Patterns

### 1. Header with Back Button:
```javascript
<View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Ionicons name="arrow-back" size={24} color={BASE.primary} />
  </TouchableOpacity>
  <Text style={styles.title}>Screen Title</Text>
</View>
```

### 2. Card with Icon:
```javascript
<View style={styles.card}>
  <View style={[styles.iconBox, { backgroundColor: THEME.primary }]}>
    <Ionicons name="document" size={20} color={BASE.primary} />
  </View>
  <Text style={styles.cardTitle}>Title</Text>
  <Text style={styles.cardDesc}>Description</Text>
</View>
```

### 3. Badge/Status:
```javascript
<View style={[styles.badge, { backgroundColor: BASE.successBg }]}>
  <Text style={[styles.badgeText, { color: BASE.success }]}>
    Aktif
  </Text>
</View>
```

### 4. Search Input:
```javascript
<View style={styles.searchBox}>
  <Ionicons name="search" size={18} color={BASE.textMuted} />
  <TextInput
    style={styles.searchInput}
    placeholder="Cari..."
    value={search}
    onChangeText={setSearch}
    placeholderTextColor={BASE.textMuted}
  />
</View>
```

### 5. Floating Action Button (FAB):
```javascript
<TouchableOpacity 
  style={styles.fab}
  onPress={handleAdd}
>
  <Ionicons name="add" size={24} color="#FFF" />
</TouchableOpacity>

// Styles:
fab: {
  position: 'absolute',
  bottom: 24,
  right: 24,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: BASE.primary,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 8,
}
```

---

## 📱 Role-Specific Routes

### Admin Prodi:
```javascript
navigation.navigate('AdminDashboard');
navigation.navigate('AdminKelolaCPL');
navigation.navigate('AdminKelolaMK');
navigation.navigate('AdminKelolaSubCpmk');
navigation.navigate('AdminKelolaUser');
navigation.navigate('AdminPantauNilai');
navigation.navigate('AdminPantauCapaian');
navigation.navigate('AdminAuditLog');
navigation.navigate('AdminProfil');
```

### Dosen:
```javascript
navigation.navigate('DosenMain');
navigation.navigate('DosenMataKuliah');
navigation.navigate('DosenInputNilai');
navigation.navigate('DosenSubCpmk');
navigation.navigate('DosenCapaian');
navigation.navigate('DosenProdiCpl');
navigation.navigate('DosenProfil');
```

### Mahasiswa:
```javascript
navigation.navigate('MahasiswaMain');
navigation.navigate('MahasiswaDashboard');
navigation.navigate('MahasiswaCapaian');
navigation.navigate('MahasiswaMataKuliah');
navigation.navigate('MahasiswaSubCpmk');
navigation.navigate('MahasiswaProdi');
navigation.navigate('MahasiswaProfile');
```

### Superadmin:
```javascript
navigation.navigate('SuperAdminDashboard');
navigation.navigate('SAKelolaCPL');
navigation.navigate('SAKelolaMK');
navigation.navigate('SAKelolaProdi');
navigation.navigate('SAKelolaSubCpmk');
navigation.navigate('SAKelolaUser');
navigation.navigate('SAHakUser');
navigation.navigate('SAInputNilai');
navigation.navigate('SAMahasiswaDosen');
navigation.navigate('SAPantauCapaian');
navigation.navigate('SAPemetaanMKCPL');
navigation.navigate('SAThreshold');
navigation.navigate('SAAuditLog');
navigation.navigate('SAProfil');
```

---

## 🛠️ Testing Commands

### Run App:
```bash
cd apps/mobile/module2
npm start
```

### Clear Cache:
```bash
npm start -- --clear
```

### Run on Android:
```bash
npm start
# Then press 'a' in terminal
```

### Run on iOS:
```bash
npm start
# Then press 'i' in terminal
```

### Verify Imports:
```bash
node verify-imports.js
```

### Quick Test:
```bash
quick-test.bat
# Or: quick-test.bat verify
```

---

## 🐛 Common Issues

### 1. "Cannot find module"
**Fix:** Clear cache and restart
```bash
npm start -- --clear
```

### 2. "Property doesn't exist"
**Check:**
- Import statement: `import { BASE, ROLE_THEMES }`
- Theme definition: `const THEME = ROLE_THEMES.adminProdi`
- Usage: `backgroundColor: THEME.primary`

### 3. "Component not found"
**Fix:** Check import from `../../components`
```javascript
import { LoadingState } from '../../components';
```

### 4. White screen/crash
**Check:**
- Console logs for errors
- Backend is running
- API configuration in `.env.local`
- Network connectivity

### 5. Navigation error
**Fix:** Verify route names match between:
- Screen definitions
- Navigator setup
- navigation.navigate() calls

---

## 📖 File Locations

### Theme & Colors:
```
src/theme/colors.js
src/services/colors.js
```

### Components:
```
src/components/CustomAlert.js
src/components/RoleHeader.js
src/components/PickerModal.js
src/components/EmptyState.js
src/components/LoadingState.js
src/components/index.js
```

### Screens:
```
src/screens/admin-prodi/
src/screens/dosen/
src/screens/mahasiswa/
src/screens/super-admin/
```

### API:
```
src/services/api.js
```

### Navigation:
```
src/navigation/AppNavigator.js
```

---

## ✅ Quick Checklist

When creating a new screen:
- [ ] Import BASE and ROLE_THEMES
- [ ] Define THEME constant
- [ ] Import needed components
- [ ] Add to navigation stack
- [ ] Use consistent styling
- [ ] Test on both Android/iOS
- [ ] Check error handling
- [ ] Verify API integration

---

## 🎨 Design Guidelines

### Spacing:
- Small: 8px
- Medium: 16px
- Large: 24px
- Extra Large: 32px

### Border Radius:
- Small: 8px
- Medium: 16px
- Large: 24px
- Extra Large: 32px

### Font Sizes:
- Caption: 11px
- Body: 13-14px
- Subtitle: 16px
- Title: 18-20px
- Header: 24px

### Elevation (Android):
- Low: 2-4
- Medium: 6-8
- High: 10-15

---

**Last Updated:** June 7, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
