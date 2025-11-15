# Upgrade Node.js to 20.19.4+

## Current Version
You have Node.js 20.19.1, but need 20.19.4 or higher.

## Option 1: Download from nodejs.org (Recommended for Windows)
1. Go to https://nodejs.org/
2. Download the **LTS version** (should be 20.19.4 or higher)
3. Run the installer
4. Restart your terminal/PowerShell
5. Verify: `node --version` (should show 20.19.4+)

## Option 2: Use nvm-windows
If you have nvm-windows installed:
```powershell
nvm install 20.19.4
nvm use 20.19.4
node --version
```

## After Upgrading Node

1. **Clean and reinstall dependencies:**
```bash
cd mobile
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

2. **Try EAS Build:**
```bash
eas build --platform android --profile development
```

This should now work! The build will take 10-15 minutes in the cloud.

## Alternative: Use Expo Go (No Node Upgrade Needed)
If you want to test immediately without upgrading:
```bash
npx expo start
# Scan QR code with Expo Go app on your phone
```

Note: Some native features won't work in Expo Go (biometrics, secure storage, etc.)
