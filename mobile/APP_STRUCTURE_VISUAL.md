# HandyGH Mobile App - Visual Structure

## 🎯 Complete App Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         APP ENTRY POINT                          │
│                            App.tsx                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ROOT NAVIGATOR                              │
│                     AppNavigator.tsx                             │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Auth Stack  │  │Customer Stack│  │Provider Stack│         │
│  │  (8 screens) │  │ (32 screens) │  │ (34 screens) │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Flow (8 Screens)

```
┌──────────────────────────────────────────────────────────────┐
│                    AUTH NAVIGATOR                             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Welcome Screen                                           │
│     ↓                                                         │
│  2. Phone Input Screen                                       │
│     ↓                                                         │
│  3. OTP Verification Screen                                  │
│     ↓                                                         │
│  4. Role Selection Screen                                    │
│     ├─────────────────┬─────────────────┐                   │
│     ▼                 ▼                 ▼                    │
│  5. Profile Setup  6. Provider      7. Verification         │
│     (Customer)        Onboarding       Screen                │
│                       (Provider)                             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## 👤 Customer App Structure (32 Screens)

```
┌────────────────────────────────────────────────────────────────────┐
│                    CUSTOMER BOTTOM TABS                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │   HOME      │  │  BOOKINGS   │  │  MESSAGES   │  │ PROFILE  │ │
│  │  (10 scr)   │  │   (9 scr)   │  │   (2 scr)   │  │ (12 scr) │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────┘ │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Home Tab Stack (10 Screens)
```
Home Main
  ├── Service Categories
  ├── Provider List
  │   └── Provider Detail
  │       ├── Service Selection
  │       ├── Provider Reviews
  │       └── Provider Gallery
  ├── Search
  ├── Map View
  └── Filter (Modal)
```

### Bookings Tab Stack (9 Screens)
```
Booking List
  └── Booking Details
      ├── Booking Status
      ├── Booking Chat
      ├── Reschedule
      ├── Cancel Booking (Modal)
      ├── Review Submission (Modal)
      ├── Payment Receipt
      └── Invoice
```

### Messages Tab Stack (2 Screens)
```
Chat List
  └── Chat
```

### Profile Tab Stack (12 Screens)
```
Profile Main
  ├── Profile Edit
  ├── Booking History
  ├── Favorites
  ├── Settings
  │   ├── Notifications
  │   ├── Security
  │   ├── Payment Methods
  │   ├── Address Book
  │   └── Language
  ├── Help & Support
  └── About
```

### Booking Flow Modals (12 Screens)
```
Provider Detail
  ↓
Booking Create (Modal)
  ↓
Date/Time Selection
  ↓
Location Selection
  ↓
Service Customization
  ↓
Booking Summary
  ↓
Payment Method
  ├── Mobile Money Payment
  └── Manual Payment
  ↓
Booking Confirmation
  ↓
Service Execution
  ↓
Service History
```

## 🛠️ Provider App Structure (34 Screens)

```
┌────────────────────────────────────────────────────────────────────────┐
│                      PROVIDER BOTTOM TABS                               │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │DASHBOARD │  │ CALENDAR │  │ SERVICES │  │ MESSAGES │  │PROFILE │ │
│  │ (7 scr)  │  │  (3 scr) │  │  (5 scr) │  │  (2 scr) │  │(11 scr)│ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### Dashboard Tab Stack (7 Screens)
```
Dashboard Main
  ├── Booking Requests
  │   └── Booking Details
  ├── Earnings
  ├── Performance Analytics
  ├── Status Update (Modal)
  └── Payment Request (Modal)
```

### Calendar Tab Stack (3 Screens)
```
Calendar Main
  ├── Availability Management
  └── Availability Setup
```

### Services Tab Stack (5 Screens)
```
Service List
  ├── Service Management
  ├── Service Catalog Setup
  ├── Pricing Management
  └── Portfolio
```

### Messages Tab Stack (2 Screens)
```
Chat List
  └── Chat
```

### Profile Tab Stack (11 Screens)
```
Profile Main
  ├── Provider Profile Setup
  ├── Reviews Management
  ├── Documents
  ├── Banking
  ├── Settings
  ├── Team Management
  ├── Expense Tracking
  ├── Tax
  ├── Provider Support
  └── Verification
```

## 🎨 Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    UI COMPONENTS                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Common Components                                           │
│  ├── Button (Primary, Secondary, Outline)                   │
│  ├── Input (Text, Email, Phone, Password)                   │
│  ├── LoadingSpinner                                          │
│  └── ErrorBoundary                                           │
│                                                              │
│  Card Components                                             │
│  ├── ServiceCard                                             │
│  ├── ProviderCard                                            │
│  └── BookingCard                                             │
│                                                              │
│  To Be Built                                                 │
│  ├── CategoryCard                                            │
│  ├── ReviewCard                                              │
│  ├── RatingInput                                             │
│  ├── DateTimePicker                                          │
│  ├── LocationPicker                                          │
│  ├── PaymentMethodSelector                                  │
│  ├── StatusTimeline                                          │
│  ├── ChatBubble                                              │
│  ├── ImageGallery                                            │
│  ├── BottomSheet                                             │
│  └── ActionSheet                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🗂️ Folder Structure

```
mobile/
├── src/
│   ├── api/                      # API Layer
│   │   ├── client.ts            # Axios instance
│   │   ├── auth.ts              # Auth endpoints
│   │   ├── providers.ts         # Provider endpoints
│   │   └── bookings.ts          # Booking endpoints
│   │
│   ├── components/               # UI Components
│   │   ├── common/              # Shared components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── cards/               # Card components
│   │       ├── ServiceCard.tsx
│   │       ├── ProviderCard.tsx
│   │       └── BookingCard.tsx
│   │
│   ├── constants/                # Constants
│   │   ├── theme.ts             # Colors, typography
│   │   └── config.ts            # App config
│   │
│   ├── features/                 # Feature Modules
│   │   ├── auth/                # Authentication
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── store/
│   │   └── provider/            # Provider features
│   │       ├── hooks/
│   │       ├── services/
│   │       └── types/
│   │
│   ├── navigation/               # Navigation
│   │   ├── AppNavigator.tsx     # Root navigator
│   │   ├── AuthNavigator.tsx    # Auth flow
│   │   ├── CustomerNavigator.tsx # Customer app
│   │   ├── ProviderNavigator.tsx # Provider app
│   │   ├── linking.ts           # Deep linking
│   │   └── types.ts             # Navigation types
│   │
│   ├── screens/                  # Screen Components
│   │   ├── auth/                # 8 screens
│   │   ├── booking/             # 12 screens
│   │   ├── customer/            # 21 screens
│   │   ├── provider/            # 23 screens
│   │   └── shared/              # 9 screens
│   │
│   ├── store/                    # Redux Store
│   │   ├── index.ts             # Store config
│   │   └── slices/              # Redux slices
│   │       ├── authSlice.ts
│   │       └── userSlice.ts
│   │
│   ├── types/                    # TypeScript Types
│   │   └── api.ts               # API types
│   │
│   └── utils/                    # Utilities
│       ├── errorHandler.ts
│       └── secureStorage.ts
│
├── scripts/                      # Build Scripts
│   ├── generateScreens.js
│   └── generateBookingFlowScreens.js
│
├── App.tsx                       # Entry Point
├── app.json                      # Expo config
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript config
```

## 🔄 Data Flow

```
┌──────────────┐
│   Screen     │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│  React Query │────▶│  API Client  │
│  (useQuery)  │     │  (Axios)     │
└──────┬───────┘     └──────┬───────┘
       │                    │
       ▼                    ▼
┌──────────────┐     ┌──────────────┐
│   Component  │     │   Backend    │
│   Re-render  │     │   API        │
└──────────────┘     └──────────────┘

┌──────────────┐
│   Screen     │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│    Redux     │────▶│    MMKV      │
│   Dispatch   │     │  (Storage)   │
└──────┬───────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│   Global     │
│   State      │
└──────────────┘
```

## 📊 Screen Distribution

```
Total: 77 Screens

Auth Flow:        ████████ 8 screens (10%)
Customer Journey: ████████████████████████████████ 32 screens (42%)
Provider Journey: ██████████████████████████████████ 34 screens (44%)
Shared Screens:   ████ 9 screens (12%)

Note: Some screens are shared between Customer and Provider
```

## 🎯 Implementation Priority

```
Priority 1 (Week 1-2): Foundation ✅ COMPLETE
├── Navigation architecture
├── Screen structure
├── Type definitions
└── Basic components

Priority 2 (Week 2-3): Customer Discovery
├── Service categories
├── Provider listing
├── Search & filters
└── Map view

Priority 3 (Week 3-4): Booking Flow
├── Booking creation
├── Date/time selection
├── Location selection
└── Payment integration

Priority 4 (Week 4-5): Provider Features
├── Dashboard
├── Service management
├── Calendar
└── Analytics

Priority 5 (Week 5-6): Real-time Features
├── Chat system
├── Notifications
├── Live tracking
└── Status updates

Priority 6 (Week 6-7): Polish & Launch
├── Animations
├── Performance
├── Testing
└── App store submission
```

---

**This visual guide provides a complete overview of the HandyGH mobile app architecture.**
