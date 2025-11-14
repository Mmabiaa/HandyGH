# How to Run the HandyGH Mobile App

## Fixed Issues

I've fixed the bundling errors you were experiencing:

1. ✅ Configured the project to work with Expo
2. ✅ Updated `babel.config.js` to use `babel-preset-expo`
3. ✅ Updated `index.js` to use `registerRootComponent` from Expo
4. ✅ Fixed `app.json` configuration
5. ✅ Installed `babel-preset-expo` package

## Running the App

### Option 1: Start with Expo (Recommended)

```bash
cd mobile
npx expo start --clear
```

This will:
- Clear the Metro bundler cache
- Start the Expo development server
- Show a QR code you can scan with Expo Go app

### Option 2: Start on a Specific Port

If port 8081 is busy:

```bash
npx expo start --clear --port 8082
```

### Option 3: Run on Android

```bash
npx expo start --android
```

### Option 4: Run on iOS (Mac only)

```bash
npx expo start --ios
```

## Scanning with Your Phone

1. Install **Expo Go** app on your phone:
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Make sure your phone and computer are on the same WiFi network

3. Open Expo Go and scan the QR code shown in the terminal

## Troubleshooting

### "Port 8081 is being used"

Kill the process using the port:

**Windows:**
```bash
netstat -ano | findstr :8081
taskkill /F /PID <PID_NUMBER>
```

Or use a different port:
```bash
npx expo start --port 8082
```

### "Runtime not ready: ReferenceError"

This was caused by the incorrect Babel configuration. It's now fixed with `babel-preset-expo`.

### Clear Cache

If you still see bundling errors:

```bash
# Clear Expo cache
npx expo start --clear

# Or clear all caches
rm -rf node_modules
rm -rf .expo
npm install
npx expo start --clear
```

### Metro Bundler Issues

If Metro bundler has issues:

```bash
# Reset Metro bundler
npx react-native start --reset-cache
```

## What Was Changed

### 1. `babel.config.js`
Changed from `@react-native/babel-preset` to `babel-preset-expo` for Expo compatibility.

### 2. `index.js`
Changed from `AppRegistry.registerComponent` to `registerRootComponent` for Expo.

### 3. `app.json`
Added proper Expo configuration with app metadata.

### 4. Installed Dependencies
Added `babel-preset-expo` as a dev dependency.

## Next Steps

Once the app starts successfully:

1. You should see the Splash Screen
2. Then the Welcome Screen with "Get Started" button
3. The authentication flow is now fully implemented with:
   - Phone number input with Ghana validation
   - OTP verification
   - Role selection (Customer/Provider)
   - Profile setup
   - Token management and auto-refresh
   - Session monitoring

## Testing Authentication

The authentication hooks and utilities are now implemented:

- `useAuth` - Authentication state management
- `useOTP` - OTP request and verification
- `useSession` - Session monitoring
- Token auto-refresh on expiration
- Comprehensive error handling

You can test the authentication flow by:
1. Entering a Ghana phone number (+233 XX XXX XXXX)
2. Requesting an OTP code
3. Verifying the OTP
4. Selecting your role
5. Setting up your profile

## Development

To run tests:

```bash
npm test
```

To run specific test suites:

```bash
npm test -- auth
```

To check TypeScript:

```bash
npm run typecheck
```

## Need Help?

If you encounter any issues:

1. Check the terminal output for specific error messages
2. Try clearing all caches (see above)
3. Make sure all dependencies are installed: `npm install`
4. Ensure you're using Node.js version 18 or higher
