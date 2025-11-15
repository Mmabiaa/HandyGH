# 🚨 URGENT FIX - Expo Go TurboModule Error

## The Error You're Seeing

```
[runtime not ready]: Invariant Violation: TurboModuleRegistry.getEnforcing(...): 
'PlatformConstants' could not be found.
```

## Root Cause

React Native 0.76.5 (which comes with Expo SDK 54) uses the **new architecture** by default, but **Expo Go doesn't support it yet**.

## IMMEDIATE FIX (2 minutes)

### Step 1: Stop the Server
Press `Ctrl+C` in your terminal

### Step 2: Downgrade Expo SDK

```bash
cd mobile

# Downgrade to Expo SDK 51 (stable with Expo Go)
npm install expo@~51.0.0

# Update React Native to compatible version
npm install react-native@0.74.5

# Update other Expo packages
npx expo install --fix
```

### Step 3: Clear Cache and Restart

```bash
# Clear all caches
rm -rf .expo
rm -rf node_modules/.cache
rm -rf /tmp/metro-*

# Start with clean cache
npx expo start --clear --tunnel
```

### Step 4: Scan QR Code

Open Expo Go on your iPhone and scan the new QR code.

## ✅ This Will Fix

- TurboModule errors
- PlatformConstants errors
- Runtime initialization errors
- All Expo Go compatibility issues

## Alternative: Use Development Build (Better Option)

If you want to keep React Native 0.76.5 and use all features:

```bash
cd mobile

# Install dev client
npx expo install expo-dev-client

# Build for iOS
npx expo run:ios
```

This creates a custom app with all native modules included.

## Which Option Should You Choose?

### Choose Downgrade (Option 1) if:
- ✅ You want to test quickly with Expo Go
- ✅ You don't want to wait for builds
- ✅ You're okay with slightly older React Native

### Choose Development Build (Option 2) if:
- ✅ You want the latest React Native features
- ✅ You want all native modules working
- ✅ You're building for production soon

## Quick Commands

### Option 1: Downgrade (Fastest)
```bash
cd mobile
npm install expo@~51.0.0 react-native@0.74.5
npx expo install --fix
rm -rf .expo node_modules/.cache
npx expo start --clear --tunnel
```

### Option 2: Development Build
```bash
cd mobile
npx expo install expo-dev-client
npx expo run:ios
```

## Expected Result

After following Option 1, you should see:
- ✅ No TurboModule errors
- ✅ App loads in Expo Go
- ✅ All screens work
- ✅ Error handling works (with Alert fallbacks)
- ✅ Navigation works
- ✅ Forms work

## Still Having Issues?

If you still see errors after downgrading:

```bash
cd mobile

# Nuclear option - full reinstall
rm -rf node_modules
rm -rf .expo
rm package-lock.json

npm install
npx expo start --clear --tunnel
```

## Need Help?

Check these files:
- `EXPO_GO_FIX.md` - Detailed explanation
- `QUICK_START.md` - Testing guide
- `TESTING_INSTRUCTIONS.md` - Full instructions

## Summary

**The fastest fix**: Downgrade to Expo SDK 51
**The best fix**: Create a development build

Both options will get your app running!
