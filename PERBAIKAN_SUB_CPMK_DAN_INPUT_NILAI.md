# Perbaikan Sub-CPMK dan Input Nilai

## Tanggal: 1 Juni 2026

## Masalah yang Diperbaiki

### 1. Sub-CPMK - Data Tidak Tampil & Filter Tidak Berfungsi

**Masalah:**
- Data Sub-CPMK tidak tampil karena backend hanya return `SELECT * FROM sub_cpmk` tanpa JOIN
- Filter Prodi tidak berfungsi karena membandingkan UUID prodi dengan kode string
- Filter seharusnya "Prodi" dan "Mata Kuliah", bukan "Prodi" dan "Semester"

**Solusi:**
1. **Backend Fix (Module 1):**
   - Menambahkan method CRUD yang hilang di `kurikulumModel.js`:
     - `createSubCpmk()` - untuk create Sub-CPMK
     - `updateSubCpmk()` - untuk update Sub-CPMK
     - `deleteSubCpmk()` - untuk delete Sub-CPMK
   - Method ini diperlukan karena controller sudah memanggil method tersebut tetapi tidak ada di model

2. **Frontend Fix (Module 2 Superadmin):**
   - Menambahkan data enrichment di frontend:
     - Load MK-CPL mapping data
     - Load Mata Kuliah data
     - Load CPL data
     - Merge semua data untuk mendapatkan `kode_mk`, `nama_mk`, `prodi_id`, `kode_cpl`
   - Update filter logic:
     - Filter Prodi: membandingkan `prodi_id` dari MK dengan selected `filterProdi`
     - Filter MK: membandingkan `kode_mk` dengan selected `filterMK`
   - Update interface untuk menambahkan field `prodi_id` di SubCPMK

**File yang Diubah:**
- `apps/backend/module1/src/models/kurikulumModel.js` - Menambahkan CRUD methods
- `apps/web/module2/app/superadmin/sub-cpmk/page.tsx` - Data enrichment & filter fix

---

### 2. Input Nilai - Filter Prodi Tidak Berfungsi & Semester Salah

**Masalah:**
- Filter "Semua Prodi" menampilkan data
- Filter prodi spesifik (Sistem Informasi, dll) tidak menampilkan data
- Root cause: membandingkan UUID prodi dengan kode string yang diekstrak dari kode MK
- **Semester yang ditampilkan salah**: Menampilkan `semester_aktif` dari tabel `kelas` padahal seharusnya menampilkan `semester` dari tabel `mata_kuliah`
  - Contoh: Keamanan Informasi seharusnya Semester 3, tapi tampil Semester 1

**Solusi:**
1. **Frontend Fix:**
   - Load Mata Kuliah data untuk mendapatkan `prodi_id` untuk setiap MK
   - Enrich nilai data dengan `prodi_id` dari MK
   - Update filter logic untuk membandingkan `prodi_id` dari nilai dengan selected `filterProdi`
   - Update dropdown format: "KODE_PRODI - NAMA_PRODI"
   - **Fix semester display**: Gunakan `semester` dari `mata_kuliah` bukan `semester_aktif` dari `kelas`

**File yang Diubah:**
- `apps/web/module2/app/superadmin/input-nilai/page.tsx` - Data enrichment, filter fix, & semester fix

---

## Detail Perubahan

### Backend (Module 1)

#### File: `apps/backend/module1/src/models/kurikulumModel.js`

**Menambahkan 3 method CRUD untuk Sub-CPMK:**

```javascript
createSubCpmk: async ({ mk_cpl_id, kode_sub_cpmk, deskripsi, bobot }) => {
  const res = await pool.query(
    'INSERT INTO sub_cpmk (mk_cpl_id, kode_sub_cpmk, deskripsi, bobot) VALUES ($1, $2, $3, $4) RETURNING *',
    [mk_cpl_id, kode_sub_cpmk, deskripsi, bobot]
  );
  return res.rows[0];
},

updateSubCpmk: async (id, { mk_cpl_id, kode_sub_cpmk, deskripsi, bobot }) => {
  const res = await pool.query(
    'UPDATE sub_cpmk SET mk_cpl_id = $1, kode_sub_cpmk = $2, deskripsi = $3, bobot = $4 WHERE id = $5 RETURNING *',
    [mk_cpl_id, kode_sub_cpmk, deskripsi, bobot, id]
  );
  return res.rows[0];
},

deleteSubCpmk: async (id) => {
  const res = await pool.query('DELETE FROM sub_cpmk WHERE id = $1 RETURNING *', [id]);
  return res.rows[0];
}
```

---

### Frontend (Module 2 Superadmin)

#### File: `apps/web/module2/app/superadmin/sub-cpmk/page.tsx`

**1. Update Interface:**
```typescript
interface SubCPMK {
  // ... existing fields
  prodi_id?: string;  // ADDED
}

interface MKCPL {
  id: number;
  mk_id: string;
  cpl_id: string;
  bobot: number;  // SIMPLIFIED
}

interface MataKuliah {  // ADDED
  id: string;
  kode_mk: string;
  nama_mk: string;
  prodi_id: string;
  semester: number;
  sks: number;
}

interface CPL {  // ADDED
  id: string;
  kode_cpl: string;
  deskripsi: string;
  prodi_id: string;
}
```

**2. Data Enrichment:**
```typescript
// Load all necessary data
const [enrichedItems, setEnrichedItems] = useState<SubCPMK[]>([]);
const [mkList, setMkList] = useState<MataKuliah[]>([]);
const [cplList, setCplList] = useState<CPL[]>([]);

// Enrich data when all loaded
useEffect(() => {
  if (items.length > 0 && mkCplList.length > 0 && mkList.length > 0 && cplList.length > 0) {
    const enriched = items.map(item => {
      const mkCpl = mkCplList.find(mc => mc.id === item.mk_cpl_id);
      if (!mkCpl) return item;

      const mk = mkList.find(m => m.id === mkCpl.mk_id);
      const cpl = cplList.find(c => c.id === mkCpl.cpl_id);

      return {
        ...item,
        kode_mk: mk?.kode_mk,
        nama_mk: mk?.nama_mk,
        prodi_id: mk?.prodi_id,
        kode_cpl: cpl?.kode_cpl,
      };
    });
    setEnrichedItems(enriched);
  }
}, [items, mkCplList, mkList, cplList]);
```

**3. Filter Logic:**
```typescript
// Use enriched data for filtering
const filteredItems = enrichedItems.filter(item => {
  if (!item.kode_mk) return false;
  
  const matchProdi = !filterProdi || item.prodi_id === filterProdi;
  const matchMK = !filterMK || item.kode_mk === filterMK;
  
  return matchProdi && matchMK;
});
```

---

#### File: `apps/web/module2/app/superadmin/input-nilai/page.tsx`

**1. Update Interface:**
```typescript
interface Nilai {
  // ... existing fields
  semester?: number;  // ADDED - Semester from mata_kuliah (correct one)
  prodi_id?: string;  // ADDED
}
```

**2. Data Enrichment:**
```typescript
const [enrichedNilaiList, setEnrichedNilaiList] = useState<Nilai[]>([]);
const [mkList, setMkList] = useState<Array<{id: string; kode_mk: string; nama_mk: string; prodi_id: string}>>([]);

// Enrich nilai data with prodi_id from MK
useEffect(() => {
  if (nilaiList.length > 0 && kelasList.length > 0 && mkList.length > 0) {
    const enriched = nilaiList.map(nilai => {
      const kelas = kelasList.find(k => k.kode_mk === nilai.kode_mk);
      if (!kelas) return nilai;

      const mk = mkList.find(m => m.id === kelas.mk_id);
      
      return {
        ...nilai,
        prodi_id: mk?.prodi_id,
      };
    });
    setEnrichedNilaiList(enriched);
  } else {
    setEnrichedNilaiList(nilaiList);
  }
}, [nilaiList, kelasList, mkList]);
```

**3. Filter Logic:**
```typescript
const filteredNilai = enrichedNilaiList.filter(nilai => {
  const matchProdi = !filterProdi || nilai.prodi_id === filterProdi;
  // Use semester from mata_kuliah, not semester_aktif from kelas
  const matchSemester = !filterSemester || (nilai.semester && String(nilai.semester) === filterSemester);
  
  return matchProdi && matchSemester;
});
```

**4. Display Semester from Mata Kuliah:**
```typescript
// Group by Mata Kuliah - use semester from mata_kuliah
const groupedByMK = filteredNilai.reduce((acc, nilai) => {
  const mkKey = nilai.kode_mk || 'unknown';
  if (!acc[mkKey]) {
    acc[mkKey] = {
      kode_mk: nilai.kode_mk || '-',
      nama_mk: nilai.nama_mk || 'Tidak diketahui',
      tahun_akademik: nilai.tahun_akademik || '-',
      semester: nilai.semester || 0, // Use semester from mata_kuliah
      items: []
    };
  }
  acc[mkKey].items.push(nilai);
  return acc;
}, {} as Record<string, { kode_mk: string; nama_mk: string; tahun_akademik: string; semester: number; items: Nilai[] }>);

// Display in UI
<div>
  {group.tahun_akademik} • Semester {group.semester}
</div>
```

**5. Dropdown Format:**
```typescript
<option key={prodi.id} value={prodi.id}>
  {prodi.kode_prodi} - {prodi.nama_prodi}
</option>
```

---

## Hasil

✅ **Sub-CPMK:**
- Data Sub-CPMK sekarang tampil dengan lengkap (kode_mk, nama_mk, kode_cpl)
- Filter Prodi berfungsi dengan benar (membandingkan UUID prodi)
- Filter Mata Kuliah berfungsi dengan benar
- CRUD operations (Create, Update, Delete) berfungsi

✅ **Input Nilai:**
- Filter "Semua Prodi" tetap menampilkan semua data
- Filter prodi spesifik (Sistem Informasi, dll) sekarang berfungsi
- Dropdown menampilkan format: "KODE_PRODI - NAMA_PRODI"
- **Semester sekarang menampilkan semester dari mata_kuliah (benar)**, bukan semester_aktif dari kelas
  - Contoh: Keamanan Informasi sekarang tampil Semester 3 (sesuai database)

---

## Catatan Penting

1. **Backend Fix Minimal:** Hanya menambahkan method CRUD yang hilang di model, tidak mengubah struktur query atau database
2. **Frontend Data Enrichment:** Menggunakan pendekatan client-side join untuk menggabungkan data dari multiple endpoints
3. **Performance:** Data enrichment dilakukan di frontend, jadi ada sedikit delay saat pertama kali load. Untuk production, sebaiknya backend di-optimize dengan JOIN query.
4. **Semester Display Fix:** Backend modul 2 sudah mengembalikan field `semester` dari `mata_kuliah` dan `semester_aktif` dari `kelas`. Frontend sekarang menggunakan `semester` dari `mata_kuliah` yang merupakan data yang benar.

---

## Testing

Untuk testing, pastikan:
1. Backend server berjalan di `http://localhost:3000`
2. Database memiliki data:
   - Prodi
   - Mata Kuliah
   - CPL
   - MK-CPL Mapping
   - Sub-CPMK
   - Kelas
   - Enrollment
   - Nilai
3. User sudah login dan memiliki auth token

**Test Case Sub-CPMK:**
1. Buka halaman Sub-CPMK
2. Pilih filter Prodi → data harus ter-filter
3. Pilih filter Mata Kuliah → data harus ter-filter lebih spesifik
4. Klik "Tambah Sub-CPMK" → form muncul
5. Isi form dan submit → data tersimpan
6. Klik "Edit" → form muncul dengan data existing
7. Update dan submit → data ter-update
8. Klik "Hapus" → data terhapus

**Test Case Input Nilai:**
1. Buka halaman Input Nilai
2. Pilih filter "Semua Prodi" → semua data tampil
3. Pilih filter prodi spesifik (e.g., "IF - Sistem Informasi") → hanya data prodi tersebut yang tampil
4. Pilih filter semester → data ter-filter berdasarkan semester
5. Klik "Input Nilai" → form muncul
6. Pilih mahasiswa, kelas, sub-CPMK, dan nilai → submit → data tersimpan
7. Klik "Edit" → form muncul dengan data existing
8. Update nilai → submit → data ter-update
9. Klik "Hapus" → data terhapus
