# EAS Build - Cloud Build Solution

## The Problem
Local Android builds have complex Kotlin/Gradle version conflicts that are difficult to resolve on Windows.

## The Solution
Use **EAS Build** - Expo's cloud build service. It builds your app in the cloud with the correct environment.

## Setup Steps

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```
(Create a free account if you don't have one)

### 3. Configure EAS Build
```bash
cd mobile
eas build:configure
```

### 4. Build for Android
```bash
eas build --platform android --profile development
```

This will:
- Build your app in the cloud (takes ~10-15 minutes)
- Download the APK when done
- You can install it on your device

### 5. Install on Device
Once the build completes:
- Download the APK from the EAS dashboard
- Transfer to your Android device
- Install it
- Run `npx expo start --dev-client` on your computer
- Open the app on your device

## Advantages
✅ No local Android setup needed
✅ No Gradle/Kotlin issues
✅ Builds work consistently
✅ Free tier available (30 builds/month)
✅ Works on any OS

## For Quick Testing
If you just want to test the app quickly without native modules:
```bash
npx expo start --tunnel
```
Then use Expo Go app (but some features won't work)
