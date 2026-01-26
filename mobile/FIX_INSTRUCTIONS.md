# Fix Instructions for "main has not been registered" Error

## Step-by-Step Fix

### 1. Stop Metro Bundler
If Metro is running, stop it (Ctrl+C in the terminal where it's running).

### 2. Clean Install Dependencies

**Windows PowerShell:**
```powershell
cd mobile
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

**Windows CMD:**
```cmd
cd mobile
rmdir /s /q node_modules
del package-lock.json
npm install
```

**Mac/Linux:**
```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
```

### 3. Clear All Caches

**Clear Metro cache:**
```bash
npx expo start --clear
```

**Or manually clear caches:**
```bash
# Clear Metro cache
rm -rf .metro
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-map-*

# Clear Expo cache
npx expo start -c
```

### 4. Restart Development Server

```bash
npx expo start --clear
```

Then press `a` for Android or `w` for web.

## What Was Fixed

1. ✅ **expo-font version** - Pinned to `~11.10.3` (compatible with Expo 50)
2. ✅ **axios Node crypto** - Metro resolver uses browser build
3. ✅ **Path aliases** - Added babel-plugin-module-resolver
4. ✅ **Missing assets** - Updated app.json to use favicon.png

## If Still Not Working

1. **Check if you're in the correct directory:**
   ```bash
   pwd  # Should show: .../AppVote/mobile
   ```

2. **Verify dependencies installed correctly:**
   ```bash
   npm list expo-font
   # Should show: expo-font@11.10.3
   ```

3. **Check for syntax errors:**
   ```bash
   npm run type-check
   ```

4. **Try resetting Expo:**
   ```bash
   npx expo install --fix
   ```

## About the Screen Capture Permission Error

The `DETECT_SCREEN_CAPTURE` permission error is a **harmless warning** from a native module. It won't prevent your app from running. You can safely ignore it.
