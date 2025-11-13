# HandyGH Mobile - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
cd mobile
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
API_BASE_URL=http://YOUR_COMPUTER_IP:8000/api/v1
```

**Important**: Replace `YOUR_COMPUTER_IP` with your actual IP address (not localhost) so the mobile app can reach your Django backend.

**Find your IP:**
- **Windows**: `ipconfig` (look for IPv4 Address)
- **Mac/Linux**: `ifconfig` or `ip addr`

Example: `API_BASE_URL=http://192.168.1.100:8000/api/v1`

### Step 3: Start Django Backend

In a separate terminal:
```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

### Step 4: Start Mobile App

```bash
npm start
```

Then:
- Press `i` for iOS simulator (Mac only)
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## 📱 What's Been Created

### ✅ Project Structure
```
mobile/
├── src/
│   ├── api/              # API client (✅ Ready)
│   ├── store/            # Redux store (✅ Ready)
│   ├── types/            # TypeScript types (✅ Ready)
│   ├── constants/        # Theme & config (✅ Ready)
│   ├── components/       # UI components (⏳ Next)
│   ├── screens/          # App screens (⏳ Next)
│   ├── navigation/       # Navigation (⏳ Next)
│   └── hooks/            # Custom hooks (⏳ Next)
├── App.tsx               # Entry point (✅ Ready)
├── package.json          # Dependencies (✅ Ready)
└── tsconfig.json         # TypeScript config (✅ Ready)
```

### ✅ Core Features Implemented

1. **API Client** (`src/api/client.ts`)
   - Axios configuration
   - Auto token refresh
   - Request/response interceptors
   - Error handling

2. **Authentication API** (`src/api/auth.ts`)
   - OTP request
   - OTP verification
   - Token refresh
   - Logout

3. **Redux Store** (`src/store/`)
   - Auth slice with OTP flow
   - TypeScript types
   - Async thunks

4. **Theme System** (`src/constants/theme.ts`)
   - Color palette
   - Typography
   - Spacing
   - Shadows

5. **TypeScript Types** (`src/types/api.ts`)
   - All API models
   - Request/response types
   - Complete type safety

## 🎯 Next Steps

### Phase 1: Core Screens (Week 1)
- [ ] Create navigation structure
- [ ] Build authentication screens
  - [ ] Phone input screen
  - [ ] OTP verification screen
  - [ ] Role selection screen
- [ ] Build home screen
- [ ] Create common components

### Phase 2: Customer Features (Week 2-3)
- [ ] Provider search & discovery
- [ ] Provider details screen
- [ ] Booking creation flow
- [ ] Payment integration
- [ ] Booking management

### Phase 3: Provider Features (Week 4-5)
- [ ] Provider dashboard
- [ ] Service management
- [ ] Booking management
- [ ] Earnings tracking

### Phase 4: Shared Features (Week 6)
- [ ] Messaging system
- [ ] Notifications
- [ ] Reviews & ratings
- [ ] User profile

### Phase 5: Polish & Testing (Week 7-8)
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Testing
- [ ] Bug fixes

## 🛠 Development Commands

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Format code
npm run format
```

## 📦 Key Dependencies

### Core
- **React Native**: 0.73.0
- **Expo**: ~50.0.0
- **TypeScript**: 5.3.3

### UI
- **React Native Paper**: Material Design components
- **React Navigation**: Navigation library
- **React Native Vector Icons**: Icon library

### State Management
- **Redux Toolkit**: State management
- **RTK Query**: API caching

### Forms & Validation
- **React Hook Form**: Form management
- **Zod**: Schema validation

### Utilities
- **Axios**: HTTP client
- **date-fns**: Date utilities
- **AsyncStorage**: Local storage

## 🎨 Design System

### Colors
- **Primary**: #2563EB (Blue)
- **Secondary**: #10B981 (Green)
- **Accent**: #F59E0B (Amber)
- **Error**: #EF4444 (Red)

### Typography
- **Font Family**: Inter
- **Sizes**: 12px - 32px
- **Weights**: Regular (400), Medium (600), Bold (700)

## 🔐 Authentication Flow

```
1. User enters phone number
   ↓
2. App requests OTP from backend
   ↓
3. User receives SMS with OTP
   ↓
4. User enters OTP code
   ↓
5. App verifies OTP with backend
   ↓
6. Backend returns JWT tokens
   ↓
7. App stores tokens securely
   ↓
8. User is authenticated
```

## 📱 Testing on Physical Device

### Using Expo Go

1. Install Expo Go from App Store/Play Store
2. Run `npm start`
3. Scan QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

### Important Notes
- Ensure phone and computer are on same WiFi
- Use your computer's IP address in `.env`
- Backend must be accessible from network

## 🐛 Troubleshooting

### "Network request failed"
- Check `API_BASE_URL` in `.env`
- Ensure backend is running on `0.0.0.0:8000`
- Verify phone and computer are on same network
- Check firewall settings

### "Unable to resolve module"
- Clear cache: `expo start -c`
- Reinstall: `rm -rf node_modules && npm install`

### "Metro bundler not starting"
- Kill existing processes: `killall node`
- Restart: `npm start`

### iOS Simulator not opening
- Ensure Xcode is installed (Mac only)
- Run: `sudo xcode-select --switch /Applications/Xcode.app`

### Android Emulator not opening
- Ensure Android Studio is installed
- Create AVD in Android Studio
- Start emulator before running `npm run android`

## 📚 Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

## 🎯 Current Status

✅ **Completed**:
- Project structure
- API client with auth
- Redux store setup
- TypeScript configuration
- Theme system
- Core types

⏳ **In Progress**:
- Navigation setup
- Screen components
- UI components

📋 **Next Up**:
- Authentication screens
- Home screen
- Provider search

## 💡 Tips

1. **Use TypeScript**: All types are defined in `src/types/`
2. **Follow theme**: Use colors and typography from `src/constants/theme.ts`
3. **API calls**: Use Redux Toolkit Query for caching
4. **Components**: Keep them small and reusable
5. **Testing**: Write tests as you build

## 🤝 Need Help?

The project structure is ready! You can now:

1. **Start building screens** - Begin with auth screens
2. **Create components** - Build reusable UI components
3. **Implement features** - Follow the roadmap above
4. **Test on device** - Use Expo Go for quick testing

**Ready to build the next screen?** Let me know which feature you'd like to implement first! 🚀
