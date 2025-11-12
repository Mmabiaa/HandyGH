"""
Comprehensive authentication flow test with real OTP generation.

Run: python test_auth_flow.py
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"
PHONE = "+233241234567"


def print_section(title):
    """Print formatted section header."""
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}")


def print_response(response, show_full=True):
    """Print formatted response."""
    print(f"Status: {response.status_code}")
    if show_full:
        try:
            print(f"Response:\n{json.dumps(response.json(), indent=2)}")
        except:
            print(f"Response: {response.text}")


def test_otp_request():
    """Test OTP request."""
    print_section("1. REQUEST OTP")
    print(f"Phone: {PHONE}")
    
    response = requests.post(
        f"{BASE_URL}/auth/otp/request/",
        json={"phone": PHONE}
    )
    
    print_response(response)
    
    if response.status_code != 200:
        print("\n❌ OTP request failed!")
        sys.exit(1)
    
    print("\n✅ OTP sent successfully!")
    print("\n📱 Check the server console for the OTP code")
    return True


def get_otp_from_user():
    """Get OTP from user input."""
    print_section("2. ENTER OTP")
    print("Check the server console for the OTP code.\n")
    
    otp = input("Enter the 6-digit OTP code: ").strip()
    
    if not otp.isdigit() or len(otp) != 6:
        print("\n❌ Invalid OTP format! Must be 6 digits.")
        sys.exit(1)
    
    return otp


def test_otp_verify(otp):
    """Test OTP verification."""
    print_section("3. VERIFY OTP")
    print(f"Phone: {PHONE}")
    print(f"OTP: {otp}")
    
    response = requests.post(
        f"{BASE_URL}/auth/otp/verify/",
        json={"phone": PHONE, "otp": otp}
    )
    
    print_response(response)
    
    if response.status_code != 200:
        print("\n❌ OTP verification failed!")
        sys.exit(1)
    
    data = response.json()['data']
    print("\n✅ Authentication successful!")
    print(f"\n👤 User: {data['user']['phone']} ({data['user']['role']})")
    
    return data['access_token'], data['refresh_token']


def test_token_refresh(refresh_token):
    """Test token refresh."""
    print_section("4. REFRESH TOKEN")
    
    response = requests.post(
        f"{BASE_URL}/auth/token/refresh/",
        json={"refresh_token": refresh_token}
    )
    
    print_response(response, show_full=False)
    
    if response.status_code == 200:
        print("\n✅ Token refreshed successfully!")
        return response.json()['data']['refresh_token']
    return refresh_token


def test_logout(access_token, refresh_token):
    """Test logout."""
    print_section("5. LOGOUT")
    
    response = requests.post(
        f"{BASE_URL}/auth/logout/",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"refresh_token": refresh_token}
    )
    
    print_response(response, show_full=False)
    
    if response.status_code == 200:
        print("\n✅ Logged out successfully!")


def main():
    """Run complete authentication flow test."""
    print("\n" + "="*70)
    print("  HandyGH Authentication Flow Test")
    print("="*70)
    
    try:
        test_otp_request()
        otp = get_otp_from_user()
        access_token, refresh_token = test_otp_verify(otp)
        new_refresh_token = test_token_refresh(refresh_token)
        test_logout(access_token, new_refresh_token)
        
        print_section("✅ ALL TESTS PASSED!")
        print("\n🎉 Authentication system working!")
        print("\nNext: http://localhost:8000/api/docs/")
        print("="*70 + "\n")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Server not running!")
        print("Run: python manage.py runserver")
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted")
    except Exception as e:
        print(f"\n❌ Error: {e}")


if __name__ == '__main__':
    main()
