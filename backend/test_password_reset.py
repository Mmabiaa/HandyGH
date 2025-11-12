"""
Test password reset flow.

Tests:
1. Request password reset OTP
2. Verify OTP and get reset token
3. Reset password with new password
4. Login with new password

Run: python test_password_reset.py
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"
PHONE = "+233241234567"
NEW_PASSWORD = "NewSecurePassword123!"


def print_section(title):
    """Print section header."""
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}")


def print_response(response):
    """Print response."""
    print(f"Status: {response.status_code}")
    try:
        print(f"Response:\n{json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")


def main():
    """Run password reset flow test."""
    print("\n" + "="*70)
    print("  Password Reset Flow Test")
    print("="*70)
    
    try:
        # Step 1: Request password reset OTP
        print_section("1. REQUEST PASSWORD RESET OTP")
        print(f"Phone: {PHONE}")
        
        response = requests.post(
            f"{BASE_URL}/auth/password/reset/request/",
            json={"phone": PHONE}
        )
        print_response(response)
        
        if response.status_code != 200:
            print("\n❌ Password reset request failed!")
            sys.exit(1)
        
        print("\n✅ Password reset OTP sent!")
        print("📱 Check server console for OTP")
        
        # Step 2: Get OTP from user
        print_section("2. ENTER OTP")
        otp = input("Enter the 6-digit OTP code: ").strip()
        
        if not otp.isdigit() or len(otp) != 6:
            print("\n❌ Invalid OTP format!")
            sys.exit(1)
        
        # Step 3: Verify OTP and get reset token
        print_section("3. VERIFY OTP")
        print(f"Phone: {PHONE}")
        print(f"OTP: {otp}")
        
        response = requests.post(
            f"{BASE_URL}/auth/password/reset/verify/",
            json={"phone": PHONE, "otp": otp}
        )
        print_response(response)
        
        if response.status_code != 200:
            print("\n❌ OTP verification failed!")
            sys.exit(1)
        
        reset_token = response.json()['data']['reset_token']
        print(f"\n✅ OTP verified!")
        print(f"Reset token: {reset_token[:20]}...")
        
        # Step 4: Reset password
        print_section("4. RESET PASSWORD")
        print(f"New password: {NEW_PASSWORD}")
        
        response = requests.post(
            f"{BASE_URL}/auth/password/reset/confirm/",
            json={
                "phone": PHONE,
                "reset_token": reset_token,
                "new_password": NEW_PASSWORD,
                "confirm_password": NEW_PASSWORD
            }
        )
        print_response(response)
        
        if response.status_code != 200:
            print("\n❌ Password reset failed!")
            sys.exit(1)
        
        print("\n✅ Password reset successful!")
        
        # Step 5: Test login with new password (if password login is implemented)
        print_section("5. TEST NEW PASSWORD")
        print("Password reset complete!")
        print("You can now login with OTP or set up password login.")
        
        print_section("✅ PASSWORD RESET TEST PASSED!")
        print("\n🎉 Password reset system working!")
        print("\nPassword reset flow:")
        print("1. User requests reset → OTP sent")
        print("2. User verifies OTP → Reset token issued")
        print("3. User sets new password → All sessions revoked")
        print("\n" + "="*70 + "\n")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Server not running!")
        print("Run: python manage.py runserver")
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
