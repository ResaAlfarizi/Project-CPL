/**
 * MOCK DATABASE TERPUSAT
 * Semua data di-key berdasarkan entity_id dosen.
 * Tambah dosen baru cukup tambah entry di sini.
 */

// ─── PRODI & CPL (global, bukan per-dosen) ───────────────────────────────────
export const PRODI_LIST = [
    { id: 'prodi-1', kode: 'IF-S1',  nama: 'Teknik Informatika', jenjang: 'S1' },
    { id: 'prodi-2', kode: 'SI-S1',  nama: 'Sistem Informasi',   jenjang: 'S1' },
    { id: 'prodi-3', kode: 'TI-S1',  nama: 'Teknologi Informasi', jenjang: 'S1' },
];

export const CPL_BY_PRODI = {
    'prodi-1': [
        { id: 1, kode: 'CPL-01', deskripsi: 'Mampu menganalisis kebutuhan sistem perangkat lunak skala besar.', status: 'Aktif' },
        { id: 2, kode: 'CPL-02', deskripsi: 'Mampu mendesain, menguji, dan mengimplementasikan algoritma kompleks.', status: 'Aktif' },
        { id: 3, kode: 'CPL-03', deskripsi: 'Mampu bekerja dalam tim multidisiplin secara profesional.', status: 'Aktif' },
    ],
    'prodi-2': [
        { id: 1, kode: 'CPL-01', deskripsi: 'Mampu menganalisis kebutuhan sistem informasi bisnis secara terstruktur.', status: 'Aktif' },
        { id: 2, kode: 'CPL-02', deskripsi: 'Mampu merancang arsitektur enterprise organisasi dan tata kelola TI.', status: 'Aktif' },
    ],
    'prodi-3': [
        { id: 1, kode: 'CPL-01', deskripsi: 'Mampu menerapkan teknologi informasi untuk memecahkan masalah nyata.', status: 'Aktif' },
        { id: 2, kode: 'CPL-02', deskripsi: 'Mampu mengelola proyek teknologi informasi secara efektif.', status: 'Aktif' },
    ],
};

// ─── DATA PER DOSEN (key = entity_id) ────────────────────────────────────────

/**
 * Struktur tiap entry:
 * {
 *   prodi_id: string,          // referensi ke PRODI_LIST
 *   kelas: [                   // kelas yang diampu
 *     {
 *       id, mk_kode, mk_nama, sks, kelas, semester, ta,
 *       mahasiswa: [{ nim, nama }],
 *       subCpmk: [{ id, kode, deskripsi, bobot }],
 *       nilai: [{ nim, nama, subCpmk, nilai, tanggal }],
 *     }
 *   ]
 * }
 */

export const DOSEN_DATA = {

    // ── dosen1 – Dr. Budi Santoso ──────────────────────────────────────────
    "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1": {
        prodi_id: 'prodi-1',
        kelas: [
            {
                id: 'kelas-d1-1',
                mk_kode: 'IF101',
                mk_nama: 'Pemrograman Dasar',
                sks: 3,
                kelas: 'A',
                semester: 'Semester 1',
                ta: '2024/2025',
                mahasiswa: [
                    { nim: '220001', nama: 'Ahmad Fauzi' },
                    { nim: '220002', nama: 'Dewi Lestari' },
                ],
                subCpmk: [
                    { id: 1, kode: 'SCPL-01', deskripsi: 'Mampu membuat program sederhana.', bobot: 0.15 },
                    { id: 2, kode: 'SCPL-02', deskripsi: 'Mampu menerapkan struktur kendali cabang.', bobot: 0.15 },
                ],
                nilai: [
                    { nim: '220001', nama: 'Ahmad Fauzi',  subCpmk: 'SCPL-01', nilai: 85.00, tanggal: '-' },
                    { nim: '220001', nama: 'Ahmad Fauzi',  subCpmk: 'SCPL-02', nilai: 90.00, tanggal: '-' },
                    { nim: '220002', nama: 'Dewi Lestari', subCpmk: 'SCPL-01', nilai: 75.00, tanggal: '-' },
                    { nim: '220002', nama: 'Dewi Lestari', subCpmk: 'SCPL-02', nilai: 80.00, tanggal: '-' },
                ],
            },
        ],
    },

    // ── dosen2 – Siti Rahmawati, M.Kom ────────────────────────────────────
    "aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2": {
        prodi_id: 'prodi-2',
        kelas: [
            {
                id: 'kelas-d2-1',
                mk_kode: 'SI201',
                mk_nama: 'Basis Data',
                sks: 3,
                kelas: 'A',
                semester: 'Semester 2',
                ta: '2024/2025',
                mahasiswa: [
                    { nim: '230001', nama: 'Rizky Pratama' },
                    { nim: '230002', nama: 'Nurul Hidayah' },
                    { nim: '230003', nama: 'Fajar Setiawan' },
                ],
                subCpmk: [
                    { id: 1, kode: 'BD-01', deskripsi: 'Mampu merancang skema basis data relasional.', bobot: 0.20 },
                    { id: 2, kode: 'BD-02', deskripsi: 'Mampu menulis query SQL tingkat lanjut.', bobot: 0.20 },
                    { id: 3, kode: 'BD-03', deskripsi: 'Mampu mengoptimalkan performa basis data.', bobot: 0.10 },
                ],
                nilai: [
                    { nim: '230001', nama: 'Rizky Pratama',  subCpmk: 'BD-01', nilai: 88.00, tanggal: '-' },
                    { nim: '230001', nama: 'Rizky Pratama',  subCpmk: 'BD-02', nilai: 76.00, tanggal: '-' },
                    { nim: '230002', nama: 'Nurul Hidayah',  subCpmk: 'BD-01', nilai: 92.00, tanggal: '-' },
                    { nim: '230002', nama: 'Nurul Hidayah',  subCpmk: 'BD-02', nilai: 85.00, tanggal: '-' },
                    { nim: '230003', nama: 'Fajar Setiawan', subCpmk: 'BD-01', nilai: 70.00, tanggal: '-' },
                    { nim: '230003', nama: 'Fajar Setiawan', subCpmk: 'BD-02', nilai: 65.00, tanggal: '-' },
                ],
            },
        ],
    },

    // ── Tambah dosen baru di sini dengan pola yang sama ───────────────────
};

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

/** Ambil semua kelas milik dosen */
export function getKelasByDosen(entityId) {
    return DOSEN_DATA[entityId]?.kelas || [];
}

/** Ambil prodi milik dosen */
export function getProdiByDosen(entityId) {
    const prodiId = DOSEN_DATA[entityId]?.prodi_id;
    return PRODI_LIST.find(p => p.id === prodiId) || null;
}

/** Ambil CPL berdasarkan prodi dosen */
export function getCplByDosen(entityId) {
    const prodiId = DOSEN_DATA[entityId]?.prodi_id;
    return CPL_BY_PRODI[prodiId] || [];
}

/** Ambil semua subCpmk dari semua kelas dosen (flat) */
export function getSubCpmkByDosen(entityId) {
    const kelas = getKelasByDosen(entityId);
    return kelas.flatMap(k => k.subCpmk);
}

/** Ambil semua nilai dari semua kelas dosen (flat) */
export function getNilaiByDosen(entityId) {
    const kelas = getKelasByDosen(entityId);
    return kelas.flatMap(k => k.nilai);
}

/** Ambil semua mahasiswa dari semua kelas dosen (flat, unique by nim) */
export function getMahasiswaByDosen(entityId) {
    const kelas = getKelasByDosen(entityId);
    const all = kelas.flatMap(k => k.mahasiswa);
    const seen = new Set();
    return all.filter(m => {
        if (seen.has(m.nim)) return false;
        seen.add(m.nim);
        return true;
    });
}

/** Hitung stats dashboard untuk dosen */
export function getDashboardStats(entityId) {
    const kelas = getKelasByDosen(entityId);
    const totalMhs = kelas.reduce((sum, k) => sum + k.mahasiswa.length, 0);
    return [
        { label: 'Kelas Diampu', value: String(kelas.length),    icon: 'monitor-dashboard',  bg: 'bg-vanilla'  },
        { label: 'Total Mhs',    value: String(totalMhs),         icon: 'account-group',      bg: 'bg-honeydew' },
        { label: 'Mata Kuliah',  value: String(kelas.length),     icon: 'book-open-outline',  bg: 'bg-alice'    },
    ];
}
