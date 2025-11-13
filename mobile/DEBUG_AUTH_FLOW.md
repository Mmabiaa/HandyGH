# Debugging Authentication Flow

## Issue
When clicking "Send OTP" button, nothing happens.

## Debugging Steps

### 1. Check Console Logs
Open the Expo development console and look for these logs:
- `PhoneInputScreen mounted`
- `handleRequestOTP called with phone: +233XXXXXXXXX`
- `Phone validation passed, dispatching requestOTP...`
- `authAPI.requestOTP called with phone: +233XXXXXXXXX`

### 2. Check Backend Server
Make sure the Django backend is running:

```bash
cd backend
python manage.py runserver
```

The server should be running on `http://127.0.0.1:8000`

### 3. Test API Endpoint Manually
Test the OTP request endpoint using curl or Postman:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/otp/request/ \
  -H "Content-Type: application/json" \
  -d '{"phone": "+233123456789"}'
```

Expected response:
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### 4. Check Network Configuration

#### For Android Emulator:
The API URL should be `http://10.0.2.2:8000/api/v1` instead of `http://127.0.0.1:8000/api/v1`

Update `mobile/.env`:
```
API_BASE_URL=http://10.0.2.2:8000/api/v1
```

#### For iOS Simulator:
Use `http://127.0.0.1:8000/api/v1` or `http://localhost:8000/api/v1`

#### For Physical Device:
Use your computer's local IP address:
```
API_BASE_URL=http://192.168.1.XXX:8000/api/v1
```

To find your IP:
- Windows: `ipconfig`
- Mac/Linux: `ifconfig` or `ip addr`

### 5. Check Redux State
Add Redux DevTools or check the console logs to see if:
- The action is being dispatched
- The loading state changes
- Any errors are captured

### 6. Common Issues

#### Issue: Button not responding
**Solution:** Check if the button is disabled. The button is disabled when:
- `isLoading` is true
- `phone` is empty

#### Issue: Network request fails
**Solution:** 
1. Check if backend is running
2. Verify API URL in `.env` file
3. Check network connectivity
4. Look for CORS errors in browser console

#### Issue: Phone validation fails
**Solution:** Make sure phone number is in format `+233XXXXXXXXX` (exactly 13 characters)

### 7. Quick Fix: Bypass Validation for Testing

Temporarily modify `PhoneInputScreen.tsx` to test without validation:

```typescript
const handleRequestOTP = async () => {
  console.log('Button clicked!');
  Alert.alert('Test', 'Button is working!');
};
```

If this alert shows, the button is working and the issue is with the API call.

### 8. Check App.tsx Provider Setup

Make sure the Redux store is properly provided in `App.tsx`:

```typescript
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';

// In the return:
<Provider store={store}>
  <PersistGate loading={null} persistor={persistor}>
    {/* Your app content */}
  </PersistGate>
</Provider>
```

## Next Steps

1. Check the console logs when you click "Send OTP"
2. Verify the backend is running
3. Test the API endpoint manually
4. Update the API URL based on your device type
5. Report back with any error messages you see

## Expected Flow

1. User enters phone: `+233123456789`
2. User clicks "Send OTP"
3. Console logs: "handleRequestOTP called..."
4. Redux dispatches `requestOTP` action
5. API call to `/auth/otp/request/`
6. Backend sends OTP via SMS (or logs it in development)
7. Success alert appears
8. Navigate to OTP verification screen

## Development Mode Backend

If the backend is in development mode, it might not actually send SMS. Check the backend console for the OTP code:

```
OTP for +233123456789: 123456
```
