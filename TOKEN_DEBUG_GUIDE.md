# 🔍 Token Storage Debug Guide

## Problem
After login, the token is NULL in localStorage, causing all API calls to fail with "Token tidak ada" error.

## What I've Done
Added comprehensive logging to track the token flow through the entire authentication process:

### 1. **AuthContext.tsx** - Login Flow Logging
- ✅ Logs when login process starts
- ✅ Logs when API response is received
- ✅ Verifies token exists in response
- ✅ Logs token save operation
- ✅ Verifies token was actually saved to localStorage
- ✅ Logs token decode operation
- ✅ Logs redirect destination

### 2. **lib/auth.ts** - Storage Operations Logging
- ✅ Logs every `getToken()` call with token status
- ✅ Logs every `setToken()` call with token length
- ✅ Verifies token was saved correctly after `setToken()`
- ✅ Logs cookie setting operation
- ✅ Logs token removal operations

### 3. **lib/api.ts** - API Request Logging
- ✅ Logs every API request with endpoint and token status
- ✅ Warns if no token found when making API call
- ✅ Logs API response status and data
- ✅ Logs API errors with details

## How to Test

### Step 1: Clear Everything
1. Open browser DevTools (F12)
2. Go to **Application** tab → **Local Storage** → Clear all
3. Go to **Application** tab → **Cookies** → Clear all
4. Close DevTools Console to start fresh

### Step 2: Login
1. Go to `http://localhost:3001/login`
2. Open DevTools Console (F12)
3. Enter credentials:
   - Email: `mhs1@if.ac.id`
   - Password: `password123`
4. Click "Masuk"

### Step 3: Check Console Logs
You should see logs in this order:

```
🔐 Starting login process...
✅ Login API response received: { hasToken: true }
💾 Saving token to storage...
🔑 setToken called: { tokenLength: XXX, tokenPreview: "eyJhbGciOiJIUzI1NiIsInR..." }
✅ Token saved verification: { success: true, savedLength: XXX }
🍪 Cookie set
🔍 Token verification: { tokenSaved: true, tokenLength: XXX, tokenMatch: true }
🔓 Token decoded: { email: "mhs1@if.ac.id", role: "Mahasiswa" }
🎓 Redirecting to mahasiswa portal...
```

### Step 4: Check Capaian Page
1. After redirect to `/mahasiswa`, click "Capaian Mahasiswa" in sidebar
2. Check console for API request logs:

```
🔑 getToken: { hasToken: true, tokenLength: XXX, tokenPreview: "eyJhbGciOiJIUzI1NiIsInR..." }
🌐 API Request: { endpoint: "/capaian/mahasiswa/my-capaian", hasToken: true, tokenLength: XXX, url: "http://localhost:3000/api/v1/m2/capaian/mahasiswa/my-capaian" }
📥 API Response: { endpoint: "/capaian/mahasiswa/my-capaian", status: 200, ok: true, hasData: true }
```

## Expected Issues to Identify

### Issue 1: Token Not in Response
If you see:
```
✅ Login API response received: { hasToken: false }
```
**Problem**: Backend is not returning token in login response
**Solution**: Check backend login controller

### Issue 2: Token Not Saved
If you see:
```
✅ Token saved verification: { success: false, savedLength: 0 }
```
**Problem**: localStorage.setItem() is failing (browser privacy settings?)
**Solution**: Check browser settings, try different browser

### Issue 3: Token Lost After Redirect
If token exists after login but is NULL on capaian page:
```
🔍 Token verification: { tokenSaved: true, ... }
// ... after redirect ...
🔑 getToken: { hasToken: false, tokenLength: 0, tokenPreview: "null" }
```
**Problem**: Token is being cleared during navigation
**Solution**: Check middleware or navigation guards

### Issue 4: Wrong API URL
If you see:
```
🌐 API Request: { ..., url: "http://localhost:3001/api/v1/m2/..." }
```
**Problem**: Frontend is calling itself instead of backend
**Solution**: Check `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:3000`

## Quick Verification Commands

### Check localStorage in Console
```javascript
// Check if token exists
localStorage.getItem('auth_token')

// Check all localStorage items
Object.keys(localStorage).forEach(key => {
  console.log(key, localStorage.getItem(key)?.substring(0, 50));
});
```

### Check Cookies in Console
```javascript
document.cookie
```

### Manual API Test
```javascript
// Get token
const token = localStorage.getItem('auth_token');
console.log('Token:', token);

// Test API call
fetch('http://localhost:3000/api/v1/m2/capaian/mahasiswa/my-capaian', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log('API Response:', d))
.catch(e => console.error('API Error:', e));
```

## Next Steps After Testing

1. **Share Console Logs**: Copy all console logs from login to capaian page
2. **Check Network Tab**: Go to DevTools → Network → Filter by "Fetch/XHR" → Check:
   - Login request/response
   - Capaian request/response headers
3. **Check Application Tab**: 
   - Local Storage → Check if `auth_token` exists
   - Cookies → Check if `auth_token` cookie exists

## Files Modified
- ✅ `contexts/AuthContext.tsx` - Added login flow logging
- ✅ `lib/auth.ts` - Added storage operation logging
- ✅ `lib/api.ts` - Added API request logging

All changes are **non-breaking** - they only add console.log statements for debugging.
