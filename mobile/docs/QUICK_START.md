# Quick Start Guide - Testing on Expo Go

## The Issue
You're seeing: `ERROR src\features\provider\components\PeriodFilter.tsx: Error while parsing JSON - Unexpected end of JSON input`

This is a **Metro bundler cache issue**, not a code problem.

## Quick Fix (3 Steps)

### Step 1: Stop Current Server
Press `Ctrl+C` in your terminal to stop the current Expo server.

### Step 2: Clear Cache and Restart
Run this command:
```bash
cd mobile
npx expo start --clear --tunnel
```

### Step 3: Scan QR Code
1. Open **Expo Go** app on your iPhone
2. Scan the QR code from the terminal
3. Wait for the app to load

## That's It!

The app should now load successfully on your iPhone.

---

## If You Still See Errors

### Option A: Full Clean (Recommended)
```bash
cd mobile

# Delete cache folders
rm -rf .expo
rm -rf node_modules/.cache

# Restart with clean cache
npx expo start --clear --tunnel
```

### Option B: Nuclear Option (If Option A fails)
```bash
cd mobile

# Delete everything and reinstall
rm -rf node_modules
rm -rf .expo
npm install

# Start fresh
npx expo start --clear --tunnel
```

---

## What Changed?

✅ **Installed packages**: `react-native-toast-message` and `react-native-restart`
✅ **Updated imports**: Removed mock implementations
✅ **Fixed Toast config**: Now uses real Toast components
✅ **All TypeScript errors resolved**

---

## Testing the New Features

Once the app loads, you can test:

1. **Error Handling**: Try invalid form inputs to see validation errors
2. **Success Messages**: Complete any action to see success toasts
3. **Network Errors**: Turn off WiFi to see network error handling
4. **Offline Mode**: Test with airplane mode

---

## Alternative: Use the Scripts

### On Mac/Linux:
```bash
cd mobile
chmod +x test-expo.sh
./test-expo.sh
```

### On Windows:
```bash
cd mobile
test-expo.bat
```

---

## Common Issues

### "Cannot find module 'react-native-toast-message'"
The packages are already installed. Just clear the cache:
```bash
npx expo start --clear
```

### "Tunnel connection failed"
Try without tunnel:
```bash
npx expo start --clear
```
Then use the LAN connection instead.

### "App keeps crashing"
Check the error in Expo Go. If it's about missing modules, try:
```bash
npm install
npx expo start --clear
```

---

## Need More Help?

Check these files:
- `TESTING_INSTRUCTIONS.md` - Detailed testing guide
- `DEPENDENCIES_NEEDED.md` - Package installation info
- `src/shared/errors/README.md` - Error handling documentation

---

## Quick Commands Cheat Sheet

```bash
# Clear cache and start
npx expo start --clear --tunnel

# Full clean restart
rm -rf .expo node_modules/.cache && npx expo start --clear

# Nuclear option
rm -rf node_modules .expo && npm install && npx expo start --clear
```

**Pro Tip**: The `--tunnel` flag is important for testing on iPhone when you're not on the same network!
