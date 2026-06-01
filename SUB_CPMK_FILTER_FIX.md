# SUB-CPMK FILTER FIX - DATABASE CONNECTION

## MASALAH

Filter Prodi dan Mata Kuliah di halaman Sub-CPMK tidak terkoneksi dengan database dengan benar:
1. Filter Prodi tidak berfungsi karena membandingkan ID prodi dengan kode prodi yang diekstrak dari kode MK
2. Filter Mata Kuliah tidak ter-filter berdasarkan prodi yang dipilih
3. Data tidak muncul karena logika filter yang salah

## AKAR MASALAH

### Masalah 1: Logika Filter Prodi Salah
```typescript
// BEFORE (SALAH)
const getProdiFromMK = (kodeMK: string) => {
  return kodeMK.split('-')[0]; // Returns "IF", "TI", etc (string)
};

const filteredItems = items.filter(item => {
  // Comparing prodi.id (UUID) with extracted code ("IF")
  const matchProdi = !filterProdi || getProdiFromMK(item.kode_mk) === filterProdi; // ❌ SALAH!
  return matchProdi && matchMK;
});
```

**Penjelasan**: 
- `filterProdi` berisi UUID prodi (contoh: `"123e4567-e89b-12d3-a456-426614174000"`)
- `getProdiFromMK()` mengembalikan kode prodi (contoh: `"IF"`, `"TI"`)
- Membandingkan UUID dengan kode string tidak akan pernah match!

### Masalah 2: Tidak Ada Data Mata Kuliah
```typescript
// BEFORE (TIDAK LENGKAP)
const [items, setItems] = useState<SubCPMK[]>([]); // ✅ Ada
const [mkCplList, setMkCplList] = useState<MKCPL[]>([]); // ✅ Ada
// ❌ TIDAK ADA data mata kuliah untuk mendapatkan prodi_id!
```

**Penjelasan**:
- Sub-CPMK hanya punya `kode_mk` dan `nama_mk` (dari JOIN)
- Tidak ada `prodi_id` di data Sub-CPMK
- Perlu load data Mata Kuliah terpisah untuk mendapatkan `prodi_id`

## SOLUSI

### 1. Tambah State untuk Data Mata Kuliah
```typescript
// AFTER (BENAR)
const [mkList, setMkList] = useState<Array<{
  id: string; 
  kode_mk: string; 
  nama_mk: string; 
  prodi_id: string
}>>([]);
```

### 2. Load Data Mata Kuliah dari API
```typescript
const loadMK = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/v1/m1/kurikulum/mk', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    const data = await response.json();
    setMkList(data.data || []);
  } catch (error) {
    console.error('Error loading MK:', error);
  }
};

useEffect(() => {
  loadSubCpmk();
  loadMKCPL();
  loadMK(); // ← TAMBAHAN BARU
  loadProdi();
}, []);
```

### 3. Perbaiki Logika Filter dengan Relasi yang Benar
```typescript
// AFTER (BENAR)
const filteredItems = items.filter(item => {
  if (!item.kode_mk) return false;
  
  // Get MK data to find prodi_id
  const mkData = mkList.find(mk => mk.kode_mk === item.kode_mk);
  
  // Match prodi: compare selected prodi_id with MK's prodi_id
  const matchProdi = !filterProdi || (mkData && mkData.prodi_id === filterProdi); // ✅ BENAR!
  
  // Match MK: compare selected kode_mk with item's kode_mk
  const matchMK = !filterMK || item.kode_mk === filterMK;
  
  return matchProdi && matchMK;
});
```

**Penjelasan**:
1. Cari data MK berdasarkan `kode_mk` dari Sub-CPMK
2. Ambil `prodi_id` dari data MK
3. Bandingkan `prodi_id` dari MK dengan `filterProdi` (keduanya UUID)
4. Sekarang perbandingan UUID vs UUID = ✅ MATCH!

### 4. Filter Dropdown MK Berdasarkan Prodi
```typescript
// AFTER (BENAR)
const uniqueMKList = Array.from(new Set(items.map(item => item.kode_mk)))
  .filter(Boolean)
  .map(kode_mk => {
    const item = items.find(i => i.kode_mk === kode_mk);
    const mkData = mkList.find(mk => mk.kode_mk === kode_mk);
    return {
      kode_mk: kode_mk!,
      nama_mk: item?.nama_mk || '',
      prodi_id: mkData?.prodi_id || '' // ← TAMBAHAN BARU
    };
  })
  .filter(mk => !filterProdi || mk.prodi_id === filterProdi); // ← FILTER BY PRODI
```

**Penjelasan**:
- Tambahkan `prodi_id` ke setiap item MK
- Filter list MK hanya yang sesuai dengan prodi yang dipilih
- Dropdown MK akan otomatis update saat prodi berubah

### 5. Update Dropdown Prodi untuk Menampilkan Kode
```typescript
// AFTER (LEBIH INFORMATIF)
<select value={filterProdi} onChange={...}>
  <option value="">Semua Prodi</option>
  {prodiList.map((prodi) => (
    <option key={prodi.id} value={prodi.id}>
      {prodi.kode_prodi} - {prodi.nama_prodi} {/* ← TAMBAH KODE PRODI */}
    </option>
  ))}
</select>
```

### 6. Update Interface Prodi
```typescript
// BEFORE
const [prodiList, setProdiList] = useState<Array<{
  id: string; 
  nama_prodi: string
}>>([]);

// AFTER
const [prodiList, setProdiList] = useState<Array<{
  id: string; 
  nama_prodi: string;
  kode_prodi: string // ← TAMBAHAN BARU
}>>([]);
```

## FLOW DATA YANG BENAR

### 1. Load Data
```
┌─────────────────────────────────────────────────────────┐
│ 1. Load Sub-CPMK                                        │
│    GET /api/v1/m1/kurikulum/sub-cpmk                   │
│    Response: [{ id, kode_sub_cpmk, kode_mk, ... }]    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Load Mata Kuliah                                     │
│    GET /api/v1/m1/kurikulum/mk                         │
│    Response: [{ id, kode_mk, nama_mk, prodi_id, ... }] │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Load Prodi                                           │
│    GET /api/v1/m1/prodi                                │
│    Response: [{ id, kode_prodi, nama_prodi, ... }]     │
└─────────────────────────────────────────────────────────┘
```

### 2. Filter Process
```
User selects Prodi: "Teknik Informatika" (id: "abc-123")
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Filter Sub-CPMK items:                                  │
│                                                         │
│ For each Sub-CPMK item:                                │
│   1. Get kode_mk from item (e.g., "IF-101")           │
│   2. Find MK data: mkList.find(mk => mk.kode_mk === "IF-101") │
│   3. Get prodi_id from MK data (e.g., "abc-123")      │
│   4. Compare: mkData.prodi_id === filterProdi          │
│      "abc-123" === "abc-123" → ✅ MATCH!              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Filter MK dropdown:                                     │
│                                                         │
│ uniqueMKList.filter(mk => mk.prodi_id === "abc-123")  │
│                                                         │
│ Result: Only show MK from "Teknik Informatika"        │
└─────────────────────────────────────────────────────────┘
```

## PERUBAHAN FILE

### File: `apps/web/module2/app/superadmin/sub-cpmk/page.tsx`

#### 1. State Changes
```typescript
// Added
const [mkList, setMkList] = useState<Array<{...}>>([]);

// Updated
const [prodiList, setProdiList] = useState<Array<{
  id: string; 
  nama_prodi: string;
  kode_prodi: string // ← NEW
}>>([]);
```

#### 2. New Function
```typescript
const loadMK = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/v1/m1/kurikulum/mk', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
    });
    const data = await response.json();
    setMkList(data.data || []);
  } catch (error) {
    console.error('Error loading MK:', error);
  }
};
```

#### 3. Updated useEffect
```typescript
useEffect(() => {
  loadSubCpmk();
  loadMKCPL();
  loadMK(); // ← NEW
  loadProdi();
}, []);
```

#### 4. Updated Filter Logic
```typescript
// Removed getProdiFromMK function
// Added proper filter using mkList
const filteredItems = items.filter(item => {
  if (!item.kode_mk) return false;
  const mkData = mkList.find(mk => mk.kode_mk === item.kode_mk);
  const matchProdi = !filterProdi || (mkData && mkData.prodi_id === filterProdi);
  const matchMK = !filterMK || item.kode_mk === filterMK;
  return matchProdi && matchMK;
});
```

#### 5. Updated uniqueMKList
```typescript
const uniqueMKList = Array.from(new Set(items.map(item => item.kode_mk)))
  .filter(Boolean)
  .map(kode_mk => {
    const item = items.find(i => i.kode_mk === kode_mk);
    const mkData = mkList.find(mk => mk.kode_mk === kode_mk);
    return {
      kode_mk: kode_mk!,
      nama_mk: item?.nama_mk || '',
      prodi_id: mkData?.prodi_id || '' // ← NEW
    };
  })
  .filter(mk => !filterProdi || mk.prodi_id === filterProdi); // ← NEW
```

#### 6. Updated Prodi Dropdown
```typescript
<option key={prodi.id} value={prodi.id}>
  {prodi.kode_prodi} - {prodi.nama_prodi} {/* ← UPDATED */}
</option>
```

## TESTING CHECKLIST

### ✅ Filter Prodi
- [x] Dropdown prodi menampilkan semua prodi dari database
- [x] Dropdown prodi menampilkan format: "KODE - NAMA" (e.g., "IF - Teknik Informatika")
- [x] Saat pilih prodi, hanya Sub-CPMK dari prodi tersebut yang muncul
- [x] Dropdown MK otomatis ter-filter hanya menampilkan MK dari prodi yang dipilih
- [x] Filter MK ter-reset saat prodi berubah

### ✅ Filter Mata Kuliah
- [x] Dropdown MK menampilkan semua MK yang ada di Sub-CPMK
- [x] Dropdown MK ter-filter berdasarkan prodi yang dipilih
- [x] Saat pilih MK, hanya Sub-CPMK dari MK tersebut yang muncul
- [x] Format dropdown: "KODE_MK - NAMA_MK"

### ✅ Data Display
- [x] Sub-CPMK muncul dan ter-group by Mata Kuliah
- [x] Sub-CPMK ter-group by CPL dalam setiap MK
- [x] Total bobot per MK ditampilkan dengan benar
- [x] Warning muncul jika total bobot > 100%

### ✅ CRUD Operations
- [x] Create Sub-CPMK berfungsi
- [x] Update Sub-CPMK berfungsi
- [x] Delete Sub-CPMK berfungsi
- [x] Data reload setelah CRUD operation

## KESIMPULAN

✅ **FILTER SUB-CPMK SUDAH TERKONEKSI DENGAN DATABASE!**

**Perbaikan yang dilakukan**:
1. ✅ Tambah state `mkList` untuk menyimpan data mata kuliah
2. ✅ Tambah function `loadMK()` untuk load data mata kuliah dari API
3. ✅ Perbaiki logika filter menggunakan relasi `prodi_id` yang benar
4. ✅ Filter dropdown MK berdasarkan prodi yang dipilih
5. ✅ Update interface prodi untuk include `kode_prodi`
6. ✅ Update dropdown prodi untuk menampilkan kode prodi

**Cara Kerja**:
- Filter Prodi: Bandingkan `prodi_id` dari MK dengan `filterProdi` (UUID vs UUID)
- Filter MK: Bandingkan `kode_mk` dari Sub-CPMK dengan `filterMK` (string vs string)
- Dropdown MK: Hanya tampilkan MK yang `prodi_id`-nya sesuai dengan prodi yang dipilih

Sekarang filter berfungsi dengan benar dan terkoneksi dengan database! 🎉
