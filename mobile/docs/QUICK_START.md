# HandyGH Mobile - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. iOS Setup (macOS only)
```bash
cd ios
pod install
cd ..
```

### 3. Run the App

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

## 📋 Common Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start Metro bundler |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm test` | Run tests |
| `npm run typecheck` | Check TypeScript types |
| `npm run lint` | Check code quality |

## 🏗️ Project Structure

```
mobile/
├── src/
│   ├── core/          # API, navigation, storage, theme
│   ├── features/      # auth, booking, customer, provider
│   └── shared/        # components, hooks, utils, types
├── android/           # Android native code
├── ios/               # iOS native code
└── App.tsx            # Root component
```

## 🎯 Path Aliases

Use clean imports with configured aliases:

```typescript
import { Button } from '@shared/components/Button';
import { useAuth } from '@features/auth/hooks/useAuth';
import { apiClient } from '@core/api/client';
```

## 🔧 Technology Stack

- **Framework:** React Native 0.76.5
- **Language:** TypeScript 5.7+ (strict mode)
- **Navigation:** React Navigation 6.x
- **State:** Zustand + React Query
- **Animations:** Reanimated 3.x
- **Storage:** MMKV + Keychain

## 📚 Documentation

- **README.md** - Project overview
- **SETUP.md** - Detailed setup guide
- **PROJECT_STRUCTURE.md** - Architecture details
- **VERIFICATION.md** - Setup verification

## 🐛 Troubleshooting

### Metro bundler won't start
```bash
npm start -- --reset-cache
```

### iOS build fails
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Android build fails
```bash
cd android
./gradlew clean
cd ..
```

## ✅ Verification

Check everything is working:

```bash
npm run typecheck  # Should pass
npm run lint       # Should pass with 2 warnings
npm test           # Should pass 2/2 tests
```

## 📖 Next Steps

1. Review the implementation plan: `.kiro/specs/react-native-mobile-app/tasks.md`
2. Start with Task 2: Implement design system foundation
3. Follow the task list sequentially

## 🎨 Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Format with Prettier
- Write tests for business logic
- Use functional components with hooks

## 🔐 Requirements

- **Performance:** 60fps animations, <500ms screen load
- **Accessibility:** WCAG 2.1 AA compliance
- **Security:** Secure storage, biometric auth
- **Offline:** Intelligent caching and sync

## 💡 Tips

- Use React.memo for performance
- Prefer FlashList over FlatList
- Use Reanimated for animations
- Keep components small and focused
- Write tests as you go

---

**Ready to build?** Start with `npm start` and happy coding! 🎉
