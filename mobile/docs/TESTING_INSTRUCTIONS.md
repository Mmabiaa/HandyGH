# Testing Instructions for Expo Go

## Current Error Fix

The error "Error while parsing JSON - Unexpected end of JSON input" in PeriodFilter.tsx is a Metro bundler cache issue. Follow these steps:

## Step 1: Install Missing Dependencies

First, install the required packages for the error handling system:

```bash
cd mobile
npm install react-native-toast-message react-native-restart
```

## Step 2: Clear Metro Bundler Cache

Clear the Metro bundler cache to fix the JSON parsing error:

```bash
# Stop the current Expo server (Ctrl+C)

# Clear all caches
npx expo start --clear

# Or use these alternative commands:
# npm start -- --reset-cache
# npx react-native start --reset-cache
```

## Step 3: Start Expo with Tunnel Mode

For testing on your iPhone with Expo Go, use tunnel mode:

```bash
npx expo start --tunnel
```

This will:
- Clear the cache
- Start the development server
- Create a tunnel for your iPhone to connect

## Step 4: Scan QR Code

1. Open Expo Go app on your iPhone
2. Scan the QR code displayed in the terminal
3. Wait for the app to load

## Alternative: Use Development Build

If Expo Go has limitations, you can create a development build:

```bash
# Install expo-dev-client if not already installed
npx expo install expo-dev-client

# Create a development build
npx expo run:ios
```

## Troubleshooting

### If you still see the JSON parsing error:

1. **Delete node_modules and reinstall:**
   ```bash
   rm -rf node_modules
   npm install
   ```

2. **Clear all caches:**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Clear Metro cache
   rm -rf .expo
   rm -rf node_modules/.cache
   
   # Clear watchman cache (if installed)
   watchman watch-del-all
   ```

3. **Restart with clean slate:**
   ```bash
   npx expo start --clear --tunnel
   ```

### If dependencies fail to install:

Some packages might not work with Expo Go. You have two options:

**Option 1: Use mocks (already in place)**
The app will work with the mock implementations already created:
- `src/shared/utils/toastMock.ts`
- `src/shared/utils/restartMock.ts`

**Option 2: Create a development build**
```bash
npx expo prebuild
npx expo run:ios
```

## Testing the Error Handling Features

Once the app is running, you can test:

1. **Error Boundary**: Trigger a React error to see the error boundary
2. **Form Validation**: Try the login/signup forms with invalid data
3. **Network Errors**: Turn off WiFi to see network error handling
4. **Success Feedback**: Complete any action to see success messages
5. **Offline Mode**: Test offline functionality with airplane mode

## Known Limitations with Expo Go

Expo Go has some limitations:
- Some native modules might not work
- Biometric authentication might be limited
- Some haptic feedback features might not work

For full functionality, use a development build with `expo-dev-client`.

## Quick Commands Reference

```bash
# Clear cache and start
npx expo start --clear --tunnel

# Install dependencies
npm install react-native-toast-message react-native-restart

# Full clean restart
rm -rf node_modules .expo
npm install
npx expo start --clear --tunnel

# Create development build (for full features)
npx expo install expo-dev-client
npx expo run:ios
```

## Current App Status

✅ All error handling features implemented
✅ TypeScript errors resolved
✅ Mock implementations in place for missing packages
⚠️ Need to install: react-native-toast-message, react-native-restart
⚠️ Need to clear Metro cache

After following these steps, your app should load successfully on Expo Go!
