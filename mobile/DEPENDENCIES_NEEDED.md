# Additional Dependencies Required

The following dependencies need to be installed for the error handling and user feedback system:

## Required Packages

```bash
npm install react-native-toast-message react-native-restart
```

Or with yarn:

```bash
yarn add react-native-toast-message react-native-restart
```

## Package Details

### react-native-toast-message
- **Purpose**: Display toast notifications for errors and success messages
- **Version**: ^2.2.0 (recommended)
- **Documentation**: https://github.com/calintamas/react-native-toast-message

### react-native-restart
- **Purpose**: Restart the app (used in maintenance mode)
- **Version**: ^0.0.27 (recommended)
- **Documentation**: https://github.com/avishayil/react-native-restart

## Installation Steps

1. Install the packages:
   ```bash
   npm install react-native-toast-message react-native-restart
   ```

2. For iOS, install pods:
   ```bash
   cd ios && pod install && cd ..
   ```

3. Rebuild the app:
   ```bash
   npm run android
   # or
   npm run ios
   ```

## Usage

These packages are already integrated in the codebase:
- Toast messages are configured in `src/shared/components/Toast/ToastConfig.tsx`
- Toast is rendered in `App.tsx`
- Restart functionality is used in `src/features/shared/screens/MaintenanceScreen.tsx`
