# Quick Start Guide - HandyGH Mobile

## ✅ Installation Complete!

Your dependencies are installed. Follow these steps to run the app:

## Step 1: Find Your Computer's IP Address

The mobile app needs to connect to your Django backend. You need your computer's IP address (not localhost).

### On Windows:

1. Open Command Prompt
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your active network adapter
4. Example: `192.168.1.100`

### Quick Command:
```bash
ipconfig | findstr /i "IPv4"
```

## Step 2: Update .env File

Open `mobile/.env` and update the API_BASE_URL:

```env
# Change this:
API_BASE_URL=http://localhost:8000/api/v1

# To this (use YOUR IP address):
API_BASE_URL=http://192.168.1.100:8000/api/v1
```

**Important**: Replace `192.168.1.100` with YOUR actual IP address!

## Step 3: Start Django Backend

Open a **new terminal** and run:

```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

**Note**: The `0.0.0.0` is important - it allows connections from your network.

## Step 4: Start Mobile App

In the mobile directory, run:

```bash
npm start
```

Or simply double-click `start.bat`

## Step 5: Run on Device

Once Expo starts, you have 3 options:

### Option 1: Physical Device (Recommended)
1. Install **Expo Go** app from App Store or Play Store
2. Scan the QR code shown in terminal
3. App will load on your phone

### Option 2: Android Emulator
1. Install Android Studio
2. Create an Android Virtual Device (AVD)
3. Start the emulator
4. Press `a` in the Expo terminal

### Option 3: iOS Simulator (Mac only)
1. Install Xcode
2. Press `i` in the Expo terminal

## Troubleshooting

### "Network request failed"

**Problem**: App can't reach backend

**Solutions**:
1. Check `.env` has correct IP address
2. Verify backend is running on `0.0.0.0:8000`
3. Ensure phone and computer are on same WiFi
4. Check Windows Firewall isn't blocking port 8000

**Test backend is accessible**:
```bash
# On your phone's browser, visit:
http://YOUR_IP:8000/api/docs/
```

### "Unable to resolve module"

**Problem**: Missing dependencies

**Solution**:
```bash
npm install --legacy-peer-deps
```

### "Expo Go app shows error"

**Problem**: Metro bundler issue

**Solution**:
```bash
# Clear cache and restart
npm start -- --clear
```

### Port 8000 already in use

**Problem**: Another process using port 8000

**Solution**:
```bash
# Find and kill the process
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

## Testing the Setup

### 1. Test Backend API

Open browser and visit:
```
http://YOUR_IP:8000/api/docs/
```

You should see the Swagger API documentation.

### 2. Test Mobile Connection

Once the app loads on your device:
1. You should see "HandyGH Home Screen"
2. No network errors in console

## Next Steps

Now that setup is complete, you can:

1. **Build Authentication Screens**
   - Phone input screen
   - OTP verification screen

2. **Test OTP Flow**
   - Request OTP
   - Verify OTP
   - Login

3. **Build Home Screen**
   - Provider search
   - Category browsing

## Useful Commands

```bash
# Start development server
npm start

# Start with cache cleared
npm start -- --clear

# Run on Android
npm run android

# Run on iOS (Mac only)
npm run ios

# Check TypeScript
npm run type-check

# Lint code
npm run lint
```

## Development Workflow

1. **Make changes** to code in `src/`
2. **Save file** - app will hot reload automatically
3. **Check console** for errors
4. **Test on device** - shake device for dev menu

## Project Structure

```
mobile/
├── src/
│   ├── api/          # API calls (✅ Ready)
│   ├── store/        # Redux state (✅ Ready)
│   ├── types/        # TypeScript types (✅ Ready)
│   ├── constants/    # Theme & config (✅ Ready)
│   ├── screens/      # Build screens here
│   ├── components/   # Build components here
│   └── navigation/   # Navigation setup
├── App.tsx           # Entry point
└── .env              # Configuration
```

## Getting Help

- **Setup Issues**: Check this guide
- **API Issues**: See `backend/API_DOCUMENTATION.md`
- **React Native**: https://reactnative.dev/
- **Expo**: https://docs.expo.dev/

## Ready to Code! 🚀

Your mobile app is set up and ready for development!

**Next**: Start building the authentication screens or ask for help with any specific feature.
