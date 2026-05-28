# 🗺️ Navigation Flow Diagram

## 📱 Complete Navigation Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                           App.js                                 │
│                    (Load Fonts + Render)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AppNavigator.js                             │
│                   (NavigationContainer)                          │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Stack Navigator                             │   │
│  │  ┌────────────────────────────────────────────────┐     │   │
│  │  │  Screen: "Login"                               │     │   │
│  │  │  Component: LoginScreen                        │     │   │
│  │  └────────────────────────────────────────────────┘     │   │
│  │  ┌────────────────────────────────────────────────┐     │   │
│  │  │  Screen: "DosenMain"                           │     │   │
│  │  │  Component: DosenMainScreen                    │     │   │
│  │  └────────────────────────────────────────────────┘     │   │
│  │  ┌────────────────────────────────────────────────┐     │   │
│  │  │  Screen: "MahasiswaMain"                       │     │   │
│  │  │  Component: MahasiswaMainScreen                │     │   │
│  │  └────────────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Login Flow

```
┌──────────────────┐
│   LoginScreen    │
│                  │
│  [Email Input]   │
│  [Password]      │
│  [Login Button]  │
└────────┬─────────┘
         │
         │ User clicks "Masuk"
         ▼
    ┌────────────┐
    │  API Call  │
    │ authApi.   │
    │  login()   │
    └─────┬──────┘
          │
          │ Success
          ▼
    ┌─────────────┐
    │ Save Token  │
    │ Decode JWT  │
    │ Format User │
    └─────┬───────┘
          │
          │ Check Role
          ▼
    ┌─────────────┐
    │ role === ?  │
    └──┬──────┬───┘
       │      │
       │      └─────────────────┐
       │                        │
       │ "mahasiswa"            │ "dosen" / "admin"
       ▼                        ▼
┌──────────────────┐    ┌──────────────────┐
│ MahasiswaMain    │    │   DosenMain      │
│ Screen           │    │   Screen         │
└──────────────────┘    └──────────────────┘
```

---

## 👨‍🎓 Mahasiswa Portal Structure

```
┌─────────────────────────────────────────────────────────────┐
│              MahasiswaMainScreen.js                          │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Header                                              │   │
│  │  [☰ Menu]  [Mahasiswa Badge]  [Avatar Dropdown]    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Screen Viewport (renderActiveScreen)               │   │
│  │                                                       │   │
│  │  currentScreen === 'dashboard'                       │   │
│  │    → <DashboardScreen />                            │   │
│  │                                                       │   │
│  │  currentScreen === 'program_studi'                   │   │
│  │    → <ProgramStudiScreen />                         │   │
│  │                                                       │   │
│  │  currentScreen === 'mata_kuliah'                     │   │
│  │    → <MataKuliahScreen />                           │   │
│  │                                                       │   │
│  │  currentScreen === 'sub_cpmk'                        │   │
│  │    → <SubCpmkScreen />                              │   │
│  │                                                       │   │
│  │  currentScreen === 'capaian'                         │   │
│  │    → <CapaianScreen />                              │   │
│  │                                                       │   │
│  │  currentScreen === 'profile'                         │   │
│  │    → <ProfileScreen />                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Sidebar (when sidebarOpen === true)                │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  [Logo] Sistem CPL - Portal Mahasiswa      │   │   │
│  │  ├─────────────────────────────────────────────┤   │   │
│  │  │  ▸ Dashboard                                │   │   │
│  │  │  ▸ Program Studi                            │   │   │
│  │  │  ▸ Mata Kuliah                              │   │   │
│  │  │  ▸ Sub-CPMK                                 │   │   │
│  │  │  ▸ Capaian Saya                             │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 👨‍🏫 Dosen Portal Structure

```
┌─────────────────────────────────────────────────────────────┐
│                DosenMainScreen.js                            │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Header                                              │   │
│  │  [☰ Menu]  [Dosen Pengajar]  [Avatar Dropdown]     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Screen Viewport (renderActiveScreen)               │   │
│  │                                                       │   │
│  │  currentScreen === 'dashboard'                       │   │
│  │    → <DashboardScreen />                            │   │
│  │                                                       │   │
│  │  currentScreen === 'prodi_cpl'                       │   │
│  │    → <ProdiCplScreen />                             │   │
│  │                                                       │   │
│  │  currentScreen === 'mata_kuliah'                     │   │
│  │    → <MataKuliahScreen />                           │   │
│  │                                                       │   │
│  │  currentScreen === 'sub_cpmk'                        │   │
│  │    → <SubCpmkScreen />                              │   │
│  │                                                       │   │
│  │  currentScreen === 'input_nilai'                     │   │
│  │    → <InputNilaiScreen />                           │   │
│  │                                                       │   │
│  │  currentScreen === 'capaian_mhs'                     │   │
│  │    → <CapaianScreen />                              │   │
│  │                                                       │   │
│  │  currentScreen === 'profile'                         │   │
│  │    → <ProfilDetailScreen />                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Sidebar (when sidebarOpen === true)                │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  [Logo] Sistem CPL - Portal Dosen          │   │   │
│  │  ├─────────────────────────────────────────────┤   │   │
│  │  │  ▸ Dashboard                                │   │   │
│  │  │  ▸ Program Studi & CPL                      │   │   │
│  │  │  ▸ Mata Kuliah                              │   │   │
│  │  │  ▸ Sub-CPMK                                 │   │   │
│  │  │  ▸ Input Nilai                              │   │   │
│  │  │  ▸ Capaian Mahasiswa                        │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 State Management Flow

### Internal Navigation (within DosenMain/MahasiswaMain)
```
User clicks sidebar menu item
         ↓
handleNavigation(screenKey)
         ↓
setCurrentScreen(screenKey)
         ↓
setSidebarOpen(false)
         ↓
renderActiveScreen() re-renders
         ↓
New screen component displayed
```

### Logout Flow
```
User clicks "Keluar" in profile dropdown
         ↓
handleLogout()
         ↓
await tokenStorage.remove()
         ↓
navigation.replace('Login')
         ↓
User back at LoginScreen
```

---

## 📊 Data Flow

```
┌──────────────────────────────────────────────────────────┐
│                    LoginScreen                            │
│                                                            │
│  1. User enters credentials                               │
│  2. Call authApi.login()                                  │
│  3. Receive token + user data                             │
│  4. Save token to AsyncStorage                            │
│  5. Format user object                                    │
│  6. Navigate with user data as params                     │
│                                                            │
│     navigation.replace('DosenMain', {                     │
│       user: {                                             │
│         id, name, email, role,                            │
│         entity_id, entity_type,                           │
│         avatar, badge                                     │
│       }                                                    │
│     })                                                     │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│              DosenMain / MahasiswaMain                    │
│                                                            │
│  const route = useRoute();                                │
│  const { user } = route.params || {};                     │
│                                                            │
│  useEffect(() => {                                        │
│    loadAllData(); // Load kelas, sub-cpmk, dashboard     │
│  }, []);                                                  │
│                                                            │
│  Pass data to child screens:                              │
│    <DashboardScreen user={user} />                        │
│    <MataKuliahScreen kelasList={kelasList} />            │
│    <SubCpmkScreen subCpmkList={subCpmkList} />           │
└──────────────────────────────────────────────────────────┘
```

---

## 🎯 Navigation Methods

### From LoginScreen
```javascript
// Navigate to dosen portal
navigation.replace('DosenMain', { user: formattedUser });

// Navigate to mahasiswa portal
navigation.replace('MahasiswaMain', { user: formattedUser });
```

### From DosenMain / MahasiswaMain
```javascript
// Logout (go back to login)
navigation.replace('Login');

// Internal navigation (within portal)
setCurrentScreen('dashboard');
setCurrentScreen('mata_kuliah');
// etc.
```

### Why `replace()` instead of `navigate()`?
- `replace()` removes current screen from stack
- Prevents back button from going to login after successful login
- Cleaner navigation history
- Better UX for authentication flow

---

## 🔍 Screen Lifecycle

### Login → Main Screen
```
1. LoginScreen mounts
2. User logs in
3. navigation.replace('DosenMain', { user })
4. LoginScreen unmounts
5. DosenMainScreen mounts
6. DosenMainScreen loads API data
7. Dashboard renders
```

### Internal Navigation
```
1. User clicks sidebar menu
2. handleNavigation('mata_kuliah')
3. setCurrentScreen('mata_kuliah')
4. renderActiveScreen() re-renders
5. Old screen component unmounts
6. New screen component mounts
```

### Logout
```
1. User clicks logout
2. handleLogout()
3. tokenStorage.remove()
4. navigation.replace('Login')
5. DosenMainScreen unmounts
6. LoginScreen mounts
```

---

## 📱 Component Hierarchy

```
App
└── AppNavigator
    └── NavigationContainer
        └── Stack.Navigator
            ├── LoginScreen
            ├── DosenMainScreen
            │   ├── Header
            │   ├── ScreenBackground
            │   │   └── renderActiveScreen()
            │   │       ├── DashboardScreen
            │   │       ├── ProdiCplScreen
            │   │       ├── MataKuliahScreen
            │   │       ├── SubCpmkScreen
            │   │       ├── InputNilaiScreen
            │   │       ├── CapaianScreen
            │   │       └── ProfilDetailScreen
            │   └── Sidebar
            └── MahasiswaMainScreen
                ├── Header
                ├── ScreenBackground
                │   └── renderActiveScreen()
                │       ├── DashboardScreen
                │       ├── ProgramStudiScreen
                │       ├── MataKuliahScreen
                │       ├── SubCpmkScreen
                │       ├── CapaianScreen
                │       └── ProfileScreen
                └── Sidebar
```

---

## ✅ Summary

### Key Points:
1. **3 Main Screens**: Login, DosenMain, MahasiswaMain
2. **Wrapper Pattern**: DosenMain and MahasiswaMain act as sub-apps
3. **Internal State**: Each wrapper manages its own screen state
4. **Data Passing**: User data passed via route.params
5. **Clean Navigation**: Use `replace()` for auth flow

### Benefits:
- ✅ Simple navigation stack (3 screens instead of 15+)
- ✅ Better memory management
- ✅ Cleaner code structure
- ✅ Easy to maintain
- ✅ Scalable for future features

---

**Navigation flow is now complete and ready to use! 🚀**
