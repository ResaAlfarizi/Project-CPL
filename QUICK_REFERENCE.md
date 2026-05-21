# ⚡ Quick Reference - Portal Mahasiswa

Referensi cepat untuk development dan testing.

---

## 🚀 Start Commands

```bash
# Database
cd database
setup-database.bat

# Backend
cd apps/backend/module2
npm start

# Frontend
cd apps/web/module2
npm run dev
```

---

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Mahasiswa** | **ahmad.fauzi@student.cpl.ac.id** | **admin123** |
| Superadmin | admin@cpl.ac.id | admin123 |
| Admin Prodi | admin.ti@cpl.ac.id | admin123 |
| Dosen | budi.santoso@cpl.ac.id | admin123 |

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:3000 |
| Login | http://localhost:3001/login |
| Dashboard Mahasiswa | http://localhost:3001/mahasiswa |

---

## 📡 API Endpoints (Mahasiswa)

```
GET  /api/v1/m2/capaian/mahasiswa/my-capaian
GET  /api/v1/m2/capaian/mahasiswa/my-capaian/detail
GET  /api/v1/m2/prodi
GET  /api/v1/m2/prodi/:id
GET  /api/v1/m2/cpl
GET  /api/v1/m2/cpl/prodi/:prodi_id
GET  /api/v1/m2/kelas
GET  /api/v1/m2/kelas/:id
GET  /api/v1/m2/sub-cpmk
GET  /api/v1/m2/sub-cpmk/mk/:mk_id
```

---

## 🗄️ Database Quick Commands

```sql
-- Login
psql -U postgres -d sistem_cpl

-- Cek users
SELECT email, r.nama_role FROM users u JOIN roles r ON u.role_id = r.id;

-- Cek mahasiswa
SELECT * FROM mahasiswa;

-- Cek capaian
SELECT * FROM v_capaian_cpl_mahasiswa;

-- Reset password mahasiswa
UPDATE users 
SET password_hash = '$2b$10$rZ5qH8QqJ5YvK5xK5xK5xOqJ5YvK5xK5xK5xK5xK5xK5xK5xK5xK5'
WHERE email = 'ahmad.fauzi@student.cpl.ac.id';
```

---

## 🐛 Debug Commands

### Check Backend Running
```bash
curl http://localhost:3000
```

### Test Login API
```bash
curl -X POST http://localhost:3000/api/v1/m2/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"ahmad.fauzi@student.cpl.ac.id\",\"password\":\"admin123\"}"
```

### Check Database Connection
```bash
psql -U postgres -d sistem_cpl -c "SELECT NOW();"
```

---

## 🔧 Common Fixes

### Clear Browser Data
```javascript
// Console browser
localStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

### Restart Services
```bash
# Backend
Ctrl+C
npm start

# Frontend
Ctrl+C
npm run dev
```

### Reset Database
```bash
psql -U postgres -c "DROP DATABASE sistem_cpl;"
psql -U postgres -c "CREATE DATABASE sistem_cpl;"
cd database
psql -U postgres -d sistem_cpl -f 01_modul1_ddl.sql
psql -U postgres -d sistem_cpl -f 02_modul2_ddl.sql
psql -U postgres -d sistem_cpl -f 03_auth_system.sql
psql -U postgres -d sistem_cpl -f 05_insert_test_users.sql
```

---

## 📁 Important Files

### Frontend
```
apps/web/module2/
├── contexts/AuthContext.tsx      # Auth logic
├── lib/auth.ts                   # Token management
├── lib/api.ts                    # API calls
├── middleware.ts                 # Route protection
└── app/mahasiswa/                # Portal mahasiswa
    ├── layout.tsx                # Sidebar
    ├── page.tsx                  # Dashboard
    ├── capaian/page.tsx          # Capaian CPL
    ├── program-studi/page.tsx    # Program Studi
    ├── mata-kuliah/page.tsx      # Mata Kuliah
    └── sub-cpmk/page.tsx         # Sub-CPMK
```

### Backend
```
apps/backend/module2/
├── src/
│   ├── controllers/authController.js
│   ├── models/capaianModel.js
│   ├── routes/capaianRoutes.js
│   └── middlewares/authMiddleware.js
└── .env
```

### Database
```
database/
├── 01_modul1_ddl.sql
├── 02_modul2_ddl.sql
├── 03_auth_system.sql
├── 05_insert_test_users.sql
└── setup-database.bat
```

---

## 🎨 Color Codes

```css
/* Primary */
--blue-600: #4F46E5;
--blue-700: #4338CA;
--blue-800: #3730A3;
--blue-900: #312E81;

/* Status */
--green-500: #10B981;  /* Success / ≥80 */
--blue-500: #3B82F6;   /* Good / ≥60 */
--red-400: #F87171;    /* Low / <60 */
--gray-400: #9CA3AF;   /* No data */
```

---

## 🔑 Environment Variables

### Backend `.env`
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistem_cpl
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1h
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 📊 Database Schema Quick Ref

### Key Tables
- `users` - User accounts
- `roles` - User roles
- `mahasiswa` - Student data
- `cpl` - Learning outcomes
- `mata_kuliah` - Courses
- `sub_cpmk` - Sub-outcomes
- `nilai_sub_cpmk` - Grades
- `capaian_cpl_mahasiswa` - Student achievements

### Key Views
- `v_capaian_cpl_mk` - Achievement per course
- `v_capaian_cpl_mahasiswa` - Total achievement

---

## 🧪 Test Scenarios

### Scenario 1: First Time Login
1. Clear browser data
2. Go to `/login`
3. Enter mahasiswa credentials
4. Should redirect to `/mahasiswa`
5. Dashboard should load

### Scenario 2: Navigation
1. Click each menu item
2. Each page should load
3. Data should display (or "no data" message)

### Scenario 3: Logout
1. Click logout button
2. Should redirect to `/login`
3. Token should be cleared
4. Cannot access `/mahasiswa` without login

---

## 📞 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Login stuck | Clear cache, restart frontend |
| "User not found" | Run `05_insert_test_users.sql` |
| CORS error | Check backend `app.use(cors(...))` |
| 401 Unauthorized | Check JWT_SECRET matches |
| Data not loading | Check backend running, check API URL |
| Redirect to `/dashboard` | Check role in token = "Mahasiswa" |

---

## 🎯 Success Indicators

✅ Backend console: "Server running on port 3000"
✅ Frontend console: No errors
✅ Login redirects to `/mahasiswa`
✅ Sidebar visible with 5 menus
✅ Dashboard shows stats
✅ All pages accessible
✅ Logout works

---

## 📝 Quick Notes

```
Port Backend:  3000
Port Frontend: 3001
Database:      sistem_cpl
User:          postgres
```

---

**Keep this file open while developing! 🚀**
