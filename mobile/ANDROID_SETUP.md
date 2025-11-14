# 🤖 Android Setup Guide for Windows

## Prerequisites

You need Android Studio installed to run the Android emulator.

### Step 1: Install Android Studio

1. Download from: https://developer.android.com/studio
2. Run the installer
3. During setup, make sure to install:
   - ✅ Android SDK
   - ✅ Android SDK Platform
   - ✅ Android Virtual Device (AVD)

### Step 2: Set Up Environment Variables

Add these to your Windows environment variables:

```
ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk
```

Add to PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

### Step 3: Create an Android Virtual Device (AVD)

1. Open Android Studio
2. Click "More Actions" → "Virtual Device Manager"
3. Click "Create Device"
4. Select a phone (e.g., Pixel 5)
5. Download a system image (e.g., Android 13 - API 33)
6. Click "Finish"

## 🚀 Quick Start (If Already Set Up)

### Option A: Start Emulator First (Recommended)

1. Open Android Studio
2. Click "Device Manager"
3. Click ▶️ next to your virtual device
4. Wait for emulator to boot
5. Run:
   ```bash
   cd mobile
   npx expo run:android
   ```

### Option B: Let Expo Start Emulator

```bash
cd mobile
npx expo run:android
```

Expo will try to start the emulator automatically.

## ✅ What You'll Get

- ✅ Full app with all features
- ✅ Real Toast notifications
- ✅ All animations working
- ✅ Hot reload
- ✅ All error handling features
- ✅ No limitations!

## 🔧 Troubleshooting

### "SDK location not found"

Set ANDROID_HOME environment variable:
```
ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk
```

### "No devices found"

1. Open Android Studio
2. Start an emulator manually
3. Try again

### "Build failed"

```bash
cd mobile/android
./gradlew clean
cd ..
npx expo run:android
```

### "Port 8081 already in use"

```bash
# Kill the process
npx kill-port 8081
# Or restart your computer
```

## 📱 Alternative: Use Physical Android Device

1. Enable Developer Options on your Android phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging
3. Connect phone via USB
4. Run:
   ```bash
   cd mobile
   npx expo run:android
   ```

## 🎯 First Time Setup Checklist

- [ ] Android Studio installed
- [ ] Android SDK installed
- [ ] ANDROID_HOME environment variable set
- [ ] PATH updated with Android tools
- [ ] Virtual device created
- [ ] Emulator can start successfully

## 🚀 Ready to Test?

Once setup is complete:

```bash
cd mobile
npx expo run:android
```

The app will build (takes 5-10 minutes first time) and install on the emulator!

## 💡 Tips

- **First build is slow** (5-10 minutes) - subsequent builds are faster
- **Keep emulator running** - don't close it between tests
- **Hot reload works** - code changes update automatically
- **Use Ctrl+M** in emulator to open dev menu

## Next Steps

1. Install Android Studio if you haven't
2. Create a virtual device
3. Run `npx expo run:android`
4. Test all your error handling features!
