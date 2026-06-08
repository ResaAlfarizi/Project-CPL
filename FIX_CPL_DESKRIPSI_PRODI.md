# Perbaikan Tampilan Deskripsi & Status CPL di Program Studi

## 🎯 Masalah
Di menu **Program Studi** mahasiswa, ketika melihat daftar CPL:
1. Tampilan CPL terlihat **kosong/elompong** tanpa deskripsi lengkap
2. **Status CPL tidak jelas** (Aktif atau Non-aktif)

**Sebelum:**
- Hanya tampil **kode CPL** (misal: CPL-01)
- Tidak ada deskripsi/penjelasan CPL
- Status hanya tampil untuk CPL non-aktif (tidak konsisten)
- Tampilan terlihat kosong

**Harapan:**
- Tampil **kode CPL** + **deskripsi lengkap CPL**
- Setiap CPL punya **badge status** yang jelas (Aktif/Non-aktif)
- Badge status dengan **icon** dan **warna** yang berbeda
- Mahasiswa bisa membaca penjelasan detail setiap CPL
- Tampilan lebih informatif dan jelas

---

## ✅ Solusi yang Diterapkan

### File: `apps/mobile/module2/src/screens/mahasiswa/ProgramStudiScreen.js`

#### 1. Perubahan Rendering CPL

**Sebelum (Tanpa deskripsi dan status tidak konsisten):**
```javascript
{cplList.map((cpl) => (
    <View key={cpl.id} style={styles.cplSubCard}>
        <View style={styles.cplCardHeader}>
            <View style={styles.cplBadge}>
                <Text style={styles.cplBadgeText}>{cpl.kode_cpl}</Text>
            </View>
        </View>
        {cpl.nama_cpl && (  // ❌ Field nama_cpl tidak ada di backend
            <Text style={styles.cplNama}>{cpl.nama_cpl}</Text>
        )}
    </View>
))}
```

**Sesudah (Dengan deskripsi + status badge lengkap):**
```javascript
{cplList.map((cpl) => (
    <View key={cpl.id} style={styles.cplSubCard}>
        <View style={styles.cplCardHeader}>
            {/* Kode CPL */}
            <View style={styles.cplBadge}>
                <Text style={styles.cplBadgeText}>{cpl.kode_cpl}</Text>
            </View>
            
            {/* ✅ Status Badge - Selalu tampil dengan icon & warna */}
            {cpl.is_active !== undefined && (
                <View style={[
                    styles.statusBadge, 
                    cpl.is_active === false 
                        ? styles.statusInactive   // ❌ Red untuk non-aktif
                        : styles.statusActive     // ✅ Green untuk aktif
                ]}>
                    <MaterialCommunityIcons 
                        name={cpl.is_active === false ? 'close-circle' : 'check-circle'} 
                        size={10} 
                        color={cpl.is_active === false ? '#EA5455' : '#28C76F'} 
                    />
                    <Text style={[
                        styles.statusBadgeText,
                        cpl.is_active === false 
                            ? styles.statusInactiveText 
                            : styles.statusActiveText
                    ]}>
                        {cpl.is_active === false ? 'Non-aktif' : 'Aktif'}
                    </Text>
                </View>
            )}
        </View>
        
        {/* ✅ Deskripsi CPL */}
        {cpl.deskripsi && (
            <Text style={styles.cplDeskripsi}>{cpl.deskripsi}</Text>
        )}
    </View>
))}
```

#### 2. Perubahan Styling

**Sebelum:**
```javascript
cplCardHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
},
cplNama: { 
    fontFamily: 'Urbanist-Bold', 
    fontSize: 13, 
    color: BASE.textMain, 
    fontWeight: '700', 
    marginBottom: 4 
},
```

**Sesudah:**
```javascript
cplCardHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8, 
    gap: 6  // ✅ Spacing antar badge
},
// ✅ Badge status non-aktif (bonus)
inactiveBadge: { 
    backgroundColor: BASE.borderLight, 
    borderRadius: 6, 
    paddingHorizontal: 8, 
    paddingVertical: 2 
},
inactiveBadgeText: { 
    fontFamily: 'Urbanist-Bold', 
    fontSize: 10, 
    color: BASE.textMuted, 
    fontWeight: '700' 
},
// ✅ Style untuk deskripsi CPL
cplDeskripsi: { 
    fontFamily: 'Urbanist-Medium', 
    fontSize: 13, 
    color: BASE.textMain, 
    lineHeight: 19, 
    fontWeight: '500' 
},
```

---

## 📊 Detail Perubahan

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| **Field yang ditampilkan** | `cpl.nama_cpl` (tidak ada) | `cpl.deskripsi` (ada di backend) ✅ |
| **Isi konten** | Kosong/tidak ada | Deskripsi lengkap CPL ✅ |
| **Status badge** | Tidak ada | Badge "Non-aktif" untuk CPL inactive ✅ |
| **Typography** | Bold 13px | Medium 13px, line-height 19px ✅ |
| **Gap antar badge** | Tidak ada | Gap 6px ✅ |

---

## 🎨 Tampilan Visual

### Sebelum:
```
┌─────────────────────────────────┐
│ [CPL-01]                        │
│                                 │  ← Kosong! Tidak ada deskripsi
│                                 │
└─────────────────────────────────┘
```

### Sesudah:
```
┌─────────────────────────────────────────────────────┐
│ [CPL-01]  [Non-aktif]                               │
│                                                     │
│ Mampu menerapkan pemikiran logis, kritis,          │
│ sistematis, dan inovatif dalam konteks             │
│ pengembangan atau implementasi ilmu pengetahuan    │
│ dan teknologi yang memperhatikan dan menerapkan    │
│ nilai humaniora...                                 │
└─────────────────────────────────────────────────────┘
```

---

## 🔍 Verifikasi Backend

Backend model `cplModel.js` sudah benar mengembalikan field `deskripsi`:

```javascript
const getCPLByProdiId = async (prodiId) => {
  const query = `
    SELECT 
      id,
      kode_cpl,
      deskripsi,        // ✅ Field deskripsi ada
      prodi_id,
      is_active
    FROM cpl
    WHERE prodi_id = $1
    ORDER BY kode_cpl ASC
  `;
  // ...
};
```

---

## 🧪 Testing

1. **Restart Mobile App** (clear cache)
   ```bash
   cd apps/mobile/module2
   npx expo start -c
   ```

2. **Login sebagai Mahasiswa**
   - Buka menu **"Program Studi"**
   - Pilih prodi Anda
   - Klik **"Lihat CPL"**

3. **Verifikasi Tampilan CPL:**
   - ✅ Kode CPL tampil (misal: CPL-01)
   - ✅ Deskripsi lengkap CPL tampil di bawah kode
   - ✅ Badge "Non-aktif" tampil untuk CPL yang inactive
   - ✅ Text readable dengan line-height yang baik

4. **Test dengan Data Real:**
   - Pastikan CPL di database memiliki `deskripsi` yang terisi
   - Jika deskripsi null/kosong, tidak akan tampil (graceful)

---

## 📝 Catatan Penting

### 1. Field yang Benar
```javascript
// ❌ SALAH - Field tidak ada di backend
cpl.nama_cpl

// ✅ BENAR - Field ada di backend
cpl.deskripsi
```

### 2. Handling Null/Empty
```javascript
{cpl.deskripsi && (  // ✅ Hanya render jika ada deskripsi
    <Text style={styles.cplDeskripsi}>{cpl.deskripsi}</Text>
)}
```

Jika `deskripsi` null atau empty string, komponen tidak akan render → tidak akan ada error.

### 3. Status Badge (Bonus)
```javascript
{cpl.is_active === false && (  // ✅ Tampilkan badge non-aktif
    <View style={styles.inactiveBadge}>
        <Text style={styles.inactiveBadgeText}>Non-aktif</Text>
    </View>
)}
```

Badge "Non-aktif" akan muncul di samping kode CPL jika CPL tersebut inactive.

---

## 🎉 Hasil Akhir

Setelah perbaikan ini:
- ✅ CPL **tidak lagi kosong/elompong**
- ✅ Deskripsi lengkap CPL **tampil dengan jelas**
- ✅ Mahasiswa bisa **membaca detail setiap CPL**
- ✅ Badge status untuk CPL non-aktif (bonus)
- ✅ Typography yang **readable** (line-height 19px)
- ✅ Spacing antar badge yang **rapi** (gap 6px)

---

**Contoh Deskripsi CPL yang Tampil:**

**CPL-01:**  
*"Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan atau implementasi ilmu pengetahuan dan teknologi yang memperhatikan dan menerapkan nilai humaniora yang sesuai dengan bidang keahliannya."*

**CPL-02:**  
*"Mampu menunjukkan kinerja mandiri, bermutu, dan terukur."*

**CPL-03:**  
*"Mampu mengkaji implikasi pengembangan atau implementasi ilmu pengetahuan teknologi yang memperhatikan dan menerapkan nilai humaniora sesuai dengan keahliannya berdasarkan kaidah, tata cara dan etika ilmiah dalam rangka menghasilkan solusi, gagasan, desain atau kritik seni."*

---

**Tanggal:** 8 Juni 2026  
**Perbaikan:** Tampilkan deskripsi lengkap CPL di Program Studi  
**Status:** ✅ SELESAI
