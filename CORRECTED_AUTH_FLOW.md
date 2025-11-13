# Corrected Authentication Flow Implementation

## Problem
The current implementation auto-creates users with only phone numbers during OTP verification, missing critical user information (name, email, role).

## Solution
Implement a proper signup/login flow with pending user verification.

---

## Backend Changes Required

### 1. Create PendingUser Model
**File:** `backend/apps/authentication/models.py`

```python
class PendingUser(models.Model):
    """Temporary user data during signup verification"""
    phone = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    role = models.CharField(max_length=20, choices=[('CUSTOMER', 'Customer'), ('PROVIDER', 'Provider')])
    status = models.CharField(max_length=20, default='pending_verification')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()  # 24 hours from creation
```

### 2. New Endpoints

#### POST `/api/v1/auth/signup/request/`
**Purpose:** Initiate signup process
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+233241234567",
  "role": "CUSTOMER"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "message": "OTP sent to your phone",
    "expires_in_minutes": 10,
    "pending_user_id": "uuid"
  }
}
```
**Logic:**
1. Validate all fields
2. Check if phone already exists in User table → return error
3. Create/update PendingUser record
4. Generate and send OTP
5. Return success

#### POST `/api/v1/auth/signup/verify/`
**Purpose:** Verify OTP and create user account
**Request:**
```json
{
  "phone": "+233241234567",
  "otp": "123456"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+233241234567",
      "role": "CUSTOMER"
    }
  }
}
```
**Logic:**
1. Verify OTP
2. Find PendingUser by phone
3. Create actual User from PendingUser data
4. Delete PendingUser record
5. Generate JWT tokens
6. Return tokens and user data

#### POST `/api/v1/auth/login/request/`
**Purpose:** Request OTP for existing user login
**Request:**
```json
{
  "phone": "+233241234567"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "message": "OTP sent to your phone",
    "expires_in_minutes": 10,
    "user_exists": true
  }
}
```
**Logic:**
1. Check if user exists with this phone
2. If not exists → return error "No account found"
3. Generate and send OTP
4. Return success

#### POST `/api/v1/auth/login/verify/`
**Purpose:** Verify OTP and log in existing user
**Request:**
```json
{
  "phone": "+233241234567",
  "otp": "123456"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "user": { ... }
  }
}
```
**Logic:**
1. Verify OTP
2. Find User by phone
3. Generate JWT tokens
4. Return tokens and user data

---

## Mobile App Changes Required

### 1. Update Navigation Types
**File:** `mobile/src/navigation/types.ts`

```typescript
export type AuthStackParamList = {
  Onboarding: undefined;
  Welcome: undefined;  // New: Choose Signup or Login
  Signup: undefined;   // New: Signup form
  Login: undefined;    // New: Login (phone only)
  OTPVerification: { 
    phone: string;
    flow: 'signup' | 'login';  // Track which flow
  };
  RoleSelection: undefined;  // Keep for edge cases
};
```

### 2. Create Welcome Screen
**File:** `mobile/src/screens/auth/WelcomeScreen.tsx`

**UI:**
- App logo and tagline
- "Sign Up" button (primary)
- "Log In" button (secondary)
- Terms and privacy links

### 3. Create Signup Screen
**File:** `mobile/src/screens/auth/SignupScreen.tsx`

**Form Fields:**
- Full Name (required)
- Email (optional)
- Phone Number (required, +233 format)
- Role selection (Customer/Provider)
- Terms checkbox

**Validation:**
- Name: min 2 characters
- Email: valid format if provided
- Phone: Ghana format (+233XXXXXXXXX)
- Terms: must be checked

**Flow:**
1. User fills form
2. Click "Continue"
3. Call `/api/v1/auth/signup/request/`
4. Navigate to OTP screen with flow='signup'

### 4. Create Login Screen
**File:** `mobile/src/screens/auth/LoginScreen.tsx`

**Form Fields:**
- Phone Number only

**Flow:**
1. User enters phone
2. Click "Send OTP"
3. Call `/api/v1/auth/login/request/`
4. Navigate to OTP screen with flow='login'

### 5. Update OTP Verification Screen
**File:** `mobile/src/screens/auth/OTPVerificationScreen.tsx`

**Changes:**
- Accept `flow` parameter ('signup' or 'login')
- Call different endpoint based on flow:
  - Signup: `/api/v1/auth/signup/verify/`
  - Login: `/api/v1/auth/login/verify/`
- Both return same response format (tokens + user)

### 6. Update Auth Navigator
**File:** `mobile/src/navigation/AuthNavigator.tsx`

```typescript
<Stack.Screen name="Onboarding" component={OnboardingScreen} />
<Stack.Screen name="Welcome" component={WelcomeScreen} />
<Stack.Screen name="Signup" component={SignupScreen} />
<Stack.Screen name="Login" component={LoginScreen} />
<Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
```

### 7. Update Redux Auth Slice
**File:** `mobile/src/store/slices/authSlice.ts`

**New Actions:**
- `signupRequest` - POST to `/auth/signup/request/`
- `signupVerify` - POST to `/auth/signup/verify/`
- `loginRequest` - POST to `/auth/login/request/`
- `loginVerify` - POST to `/auth/login/verify/`

**Remove:**
- Old `requestOTP` and `verifyOTP` (replace with specific signup/login actions)

### 8. Update API Client
**File:** `mobile/src/api/auth.ts`

```typescript
export const authAPI = {
  // Signup flow
  signupRequest: async (data: SignupData) => { ... },
  signupVerify: async (phone: string, otp: string) => { ... },
  
  // Login flow
  loginRequest: async (phone: string) => { ... },
  loginVerify: async (phone: string, otp: string) => { ... },
  
  // Existing
  refreshToken: async (refreshToken: string) => { ... },
  logout: async (refreshToken: string) => { ... },
};
```

---

## Implementation Order

### Phase 1: Backend (Do First)
1. Create PendingUser model and migration
2. Create new serializers
3. Create new views
4. Update URLs
5. Test with Postman/curl

### Phase 2: Mobile (After Backend Works)
1. Update types
2. Create Welcome screen
3. Create Signup screen
4. Create Login screen
5. Update OTP screen
6. Update Redux slice
7. Update API client
8. Update navigation
9. Test end-to-end

---

## Testing Checklist

### Backend Tests
- [ ] Signup request creates PendingUser
- [ ] Signup request sends OTP
- [ ] Signup verify creates User from PendingUser
- [ ] Signup verify returns JWT tokens
- [ ] Login request only works for existing users
- [ ] Login verify authenticates existing user
- [ ] Duplicate phone numbers are rejected
- [ ] OTP expiration works correctly
- [ ] Rate limiting works

### Mobile Tests
- [ ] Welcome screen navigation works
- [ ] Signup form validation works
- [ ] Signup OTP flow completes
- [ ] Login OTP flow completes
- [ ] Tokens are stored securely
- [ ] Auto-login on app restart works
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] Network errors are handled

---

## Migration Strategy

### For Existing Users
If there are already users in the database:
1. They can continue to log in using the login flow
2. No data migration needed
3. New users use the signup flow

### Backward Compatibility
- Keep old OTP endpoints temporarily
- Add deprecation warnings
- Remove after mobile app is updated

---

## Security Considerations

1. **PendingUser Cleanup**
   - Auto-delete expired pending users (cron job)
   - Expire after 24 hours

2. **Rate Limiting**
   - Signup: 3 attempts per phone per hour
   - Login: 5 attempts per phone per hour
   - OTP verify: 5 attempts per OTP

3. **Validation**
   - Phone number format
   - Email format
   - Name length
   - Role must be valid

4. **OTP Security**
   - 6-digit numeric
   - 10-minute expiration
   - Single use only
   - Hashed in database

---

## UI/UX Improvements

### Welcome Screen
- Modern, clean design
- Clear value proposition
- Easy choice between signup/login

### Signup Screen
- Progressive disclosure (one field at a time?)
- Inline validation
- Clear error messages
- Password-free messaging

### Login Screen
- Simple, fast
- "Don't have an account?" link
- Remember phone number option

### OTP Screen
- Large, easy-to-tap input boxes
- Auto-submit when complete
- Resend with countdown
- Edit phone number option

---

## Next Steps

1. **Review this plan** - Make sure it meets your requirements
2. **Implement backend** - Create models, views, serializers
3. **Test backend** - Use Postman to verify all endpoints
4. **Implement mobile** - Create screens and update logic
5. **Test end-to-end** - Complete signup and login flows
6. **Polish UI** - Make it look professional
7. **Deploy** - Update production

---

## Questions to Confirm

1. Should email be required or optional during signup?
2. Should we allow users to change their role later?
3. What happens if a user starts signup but never verifies?
4. Should we send a welcome email after signup?
5. Do you want social login (Google/Facebook) in the future?

