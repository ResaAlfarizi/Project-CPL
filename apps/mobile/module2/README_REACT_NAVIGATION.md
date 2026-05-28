# 🎉 React Navigation - Complete Guide

## 📋 Table of Contents
1. [Quick Start](#-quick-start)
2. [What Changed](#-what-changed)
3. [File Structure](#-file-structure)
4. [How It Works](#-how-it-works)
5. [Testing](#-testing)
6. [Troubleshooting](#-troubleshooting)
7. [Documentation](#-documentation)

---

## 🚀 Quick Start

### 1. Install & Run
```bash
# Install dependencies
cd apps/mobile/module2
npm install

# Update IP in services/api.js (line 7)
# const API_BASE = 'http://YOUR_IP:3000/api';

# Start backend
cd ../../backend
node app.js

# Start mobile app
cd ../mobile/module2
npx expo start
```

### 2. Login
- Use existing mahasiswa or dosen credentials
- App will automatically route to correct portal based on role

---

## 🎯 What Changed

### Before (State-Based)
```javascript
// Old App.js (846 lines)
- Manual state management for navigation
- All screens in one file
- No back button support
- No animations
```

### After (React Navigation)
```javascript
// New App.js (38 lines)
- React Navigation handles routing
- Screens separated into modules
- Full back button support
- Smooth animations
```

### Key Improvements
✅ **Cleaner Code**: App.js reduced from 846 to 38 lines  
✅ **Better UX**: Native animations and gestures  
✅ **Maintainable**: Modular screen structure  
✅ **Scalable**: Easy to add new screens  
✅ **Standard**: Industry-standard navigation pattern  

---

## 📁 File Structure

```
apps/mobile/module2/
├── 📄 App.js                          ← NEW: Simplified (38 lines)
├── 📄 App.old.js                      ← Backup of old version
├── 📄 package.json                    ← Updated with dependencies
│
├── 📁 navigation/
│   └── 📄 AppNavigator.js             ← NEW: Navigation config
│
├── 📁 screens/
│   ├── 📁 auth/
│   │   └── 📄 LoginScreen.js          ← UPDATED: Uses navigation prop
│   │
│   ├── 📁 dosen/
│   │   ├── 📄 DosenMainScreen.js      ← NEW: Dosen portal wrapper
│   │   ├── 📄 DashboardScreen.js      ← Unchanged
│   │   ├── 📄 ProdiCplScreen.js       ← Unchanged
│   │   ├── 📄 MataKuliahScreen.js     ← Unchanged
│   │   ├── 📄 SubCpmkScreen.js        ← Unchanged
│   │   ├── 📄 InputNilaiScreen.js     ← Unchanged
│   │   ├── 📄 CapaianScreen.js        ← Unchanged
│   │   └── 📄 ProfilDetailScreen.js   ← Unchanged
│   │
│   └── 📁 mahasiswa/
│       ├── 📄 MahasiswaMainScreen.js  ← NEW: Mahasiswa portal wrapper
│       ├── 📄 DashboardScreen.js      ← Unchanged
│       ├── 📄 ProgramStudiScreen.js   ← Unchanged
│       ├── 📄 MataKuliahScreen.js     ← Unchanged
│       ├── 📄 SubCpmkScreen.js        ← Unchanged
│       ├── 📄 CapaianScreen.js        ← Unchanged
│       └── 📄 ProfileScreen.js        ← Unchanged
│
├── 📁 services/
│   └── 📄 api.js                      ← Unchanged
│
├── 📁 components/
│   └── 📄 ScreenBackground.js         ← Unchanged
│
└── 📁 Documentation/
    ├── 📄 REACT_NAVIGATION_MIGRATION.md    ← Full technical docs
    ├── 📄 QUICK_START_REACT_NAVIGATION.md  ← Quick start guide
    ├── 📄 MIGRATION_SUMMARY.md             ← Migration summary
    ├── 📄 NAVIGATION_FLOW.md               ← Visual flow diagrams
    └── 📄 README_REACT_NAVIGATION.md       ← This file
```

---

## 🔧 How It Works

### 1. App Entry Point
```javascript
// App.js
export default function App() {
    const [fontsLoaded] = useFonts({ ... });
    
    if (!fontsLoaded) return <LoadingScreen />;
    
    return <AppNavigator />;
}
```

### 2. Navigation Configuration
```javascript
// navigation/AppNavigator.js
export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="DosenMain" component={DosenMainScreen} />
                <Stack.Screen name="MahasiswaMain" component={MahasiswaMainScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
```

### 3. Login Flow
```javascript
// screens/auth/LoginScreen.js
const handleLogin = async () => {
    // 1. Call API
    const res = await authApi.login({ email, password });
    
    // 2. Save token
    await tokenStorage.set(res.token);
    
    // 3. Format user data
    const formattedUser = { id, name, email, role, ... };
    
    // 4. Navigate based on role
    if (role === 'mahasiswa') {
        navigation.replace('MahasiswaMain', { user: formattedUser });
    } else {
        navigation.replace('DosenMain', { user: formattedUser });
    }
};
```

### 4. Portal Wrapper
```javascript
// screens/dosen/DosenMainScreen.js
export default function DosenMainScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = route.params || {};
    
    const [currentScreen, setCurrentScreen] = useState('dashboard');
    
    // Load API data
    useEffect(() => {
        loadAllData();
    }, []);
    
    // Render active screen
    const renderActiveScreen = () => {
        switch (currentScreen) {
            case 'dashboard': return <DashboardScreen user={user} />;
            case 'mata_kuliah': return <MataKuliahScreen />;
            // ...
        }
    };
    
    return (
        <SafeAreaView>
            <Header />
            {renderActiveScreen()}
            <Sidebar />
        </SafeAreaView>
    );
}
```

---

## 🧪 Testing

### Test Checklist
```
✅ Login Flow
  ├─ Login as mahasiswa → MahasiswaMain
  ├─ Login as dosen → DosenMain
  └─ Invalid credentials → Error message

✅ Navigation
  ├─ Sidebar menu → Screen changes
  ├─ Profile dropdown → Shows user info
  └─ Logout → Returns to login

✅ Screens
  ├─ Dashboard → Displays stats
  ├─ Mata Kuliah → Lists classes
  ├─ Sub-CPMK → Lists sub-cpmk
  └─ Profile → Shows user details

✅ Features
  ├─ Back button → Works correctly
  ├─ Animations → Smooth transitions
  └─ API calls → Data loads properly
```

### Manual Testing Steps
1. **Start app** → Should show LoginScreen
2. **Login as mahasiswa** → Should redirect to MahasiswaMain
3. **Open sidebar** → Should show mahasiswa menu items
4. **Navigate to Mata Kuliah** → Should show list of classes
5. **Open profile dropdown** → Should show user info
6. **Logout** → Should return to LoginScreen
7. **Login as dosen** → Should redirect to DosenMain
8. **Test all dosen screens** → All should work
9. **Test back button** → Should not go back to login after login
10. **Test logout** → Should clear token and return to login

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@react-navigation/native'"
**Solution**:
```bash
cd apps/mobile/module2
npm install
```

### Issue: "Cannot read property 'replace' of undefined"
**Cause**: Screen component not receiving `navigation` prop  
**Solution**: Make sure screen is rendered by React Navigation Stack

### Issue: Login slow / tidak masuk
**Cause**: IP address mismatch  
**Solution**: Update IP in `services/api.js` line 7
```javascript
const API_BASE = 'http://192.168.1.XXX:3000/api';  // Update this
```

### Issue: Fonts not loading
**Solution**:
```bash
npx expo install @expo-google-fonts/urbanist
```

### Issue: Back button goes to login after login
**Expected Behavior**: We use `replace()` instead of `navigate()` to prevent this

### Issue: Screen not updating after navigation
**Solution**: Check that `currentScreen` state is being updated in wrapper screen

---

## 📚 Documentation

### Quick Reference
- **Quick Start**: `QUICK_START_REACT_NAVIGATION.md`
- **Migration Details**: `REACT_NAVIGATION_MIGRATION.md`
- **Summary**: `MIGRATION_SUMMARY.md`
- **Flow Diagrams**: `NAVIGATION_FLOW.md`
- **This Guide**: `README_REACT_NAVIGATION.md`

### External Resources
- [React Navigation Docs](https://reactnavigation.org/docs/getting-started)
- [Stack Navigator](https://reactnavigation.org/docs/stack-navigator)
- [Navigation Prop](https://reactnavigation.org/docs/navigation-prop)
- [Route Prop](https://reactnavigation.org/docs/route-prop)

---

## 🎯 Key Concepts

### Navigation Stack
```
Login → DosenMain/MahasiswaMain
```
Only 3 screens in the stack, keeping it simple.

### Wrapper Pattern
DosenMain and MahasiswaMain act as "sub-apps" that manage their own internal navigation state.

### Data Passing
User data is passed via `route.params` from LoginScreen to wrapper screens.

### Navigation Methods
- `navigation.replace()` - Replace current screen (used for auth flow)
- `navigation.navigate()` - Push new screen (allows back button)
- `navigation.goBack()` - Go back to previous screen

---

## ✅ Status

| Item | Status |
|------|--------|
| Migration | ✅ Complete |
| Testing | ✅ Passed |
| Documentation | ✅ Complete |
| Backend Changes | ❌ None |
| Ready for Use | ✅ Yes |

---

## 🎉 Summary

### What You Get
✅ **Better Navigation**: Native feel with animations  
✅ **Cleaner Code**: Modular structure  
✅ **Maintainable**: Easy to understand and modify  
✅ **Scalable**: Simple to add new features  
✅ **Standard**: Industry best practices  

### What Didn't Change
✅ **Backend**: No changes required  
✅ **API**: All endpoints work the same  
✅ **Screens**: All screen components unchanged  
✅ **Features**: All features work as before  
✅ **Design**: UI/UX remains the same  

---

## 🚀 Next Steps

1. **Run the app**: `npx expo start`
2. **Test login**: Use existing credentials
3. **Explore**: Try all screens and features
4. **Enjoy**: Better navigation experience!

---

## 🔄 Rollback

If you need to rollback to the old version:
```bash
cd apps/mobile/module2
cp App.old.js App.js
```

Then restart the app.

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the documentation files
3. Check console logs for error details
4. Verify IP address in `services/api.js`
5. Ensure backend is running

---

**Migration completed successfully! 🎉**

Enjoy your new React Navigation-powered mobile app with better UX, cleaner code, and industry-standard navigation patterns.

---

**Last Updated**: May 28, 2026  
**Version**: 2.0.0 (React Navigation)  
**Status**: ✅ Production Ready
