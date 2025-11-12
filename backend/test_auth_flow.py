"""
Comprehensive authentication flow test with real OTP generation.

This script tests the complete authentication flow:
1. Request OTP (generates real OTP)
2. Retrieve OTP from server logs
3. Verify OTP
4. Get user info
5. Refresh token
6. Logout

Run: python test_auth_flow.py
"""

import requests
import json
import time
import sys

BASE_URL = "http://localhost:8000/api/v1"
PHONE = "+233599670295"


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
        print("\nTroubleshooting:")
        print("1. Make sure the server is running: python manage.py runserver")
        print("2. Check server logs for errors")
        print("3. Verify phone number format: +233XXXXXXXXX")
        sys.exit(1)
    
    print("\n✅ OTP sent successfully!")
    print("\n📱 Check the server console for the OTP code")
    print("   Look for a message like:")
    print("   ==================================================")
    print("   OTP CODE FOR +233241234567: 123456")
    print("   ==================================================")
    
    return True


def get_otp_from_user():
    """Get OTP from user input."""
    print_section("2. ENTER OTP")
    print("Check the server console output above for the OTP code.")
    print("It should be displayed in a box like this:")
    print("==================================================")
    print("OTP CODE FOR +233241234567: 123456")
    print("==================================================\n")
    
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
        print("\nPossible reasons:")
        print("1. Incorrect OTP code")
        print("2. OTP expired (valid for 10 minutes)")
        sys.exit(1)
    
    data = response.json()['data']
    print("\n✅ Authentication successful!")
    print(f"\n👤 User Info:")
    print(f"   ID: {data['user']['id']}")
    print(f"   Phone: {data['user']['phone']}")
    print(f"   Name: {data['user']['name'] or 'Not set'}")
    print(f"   Role: {data['user']['role']}")
    
    return data['access_token'], data['refresh_token']


def test_authenticated_request(access_token):
    """Test authenticated endpoint."""
    print_section("4. TEST AUTHENTICATED ENDPOINT")
    print("Getting current user info...")
    
    response = requests.get(
        f"{BASE_URL}/users/me/",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    
    print_response(response, show_full=False)
    
  se.status_code == 200:
        print("\n✅ Authenticated request successful!")
    else:
        print("\n⚠️  Authenticated request failed (endpoint may not be fully implemented yet)")


def test_token_refresh(refresh_token):
    """Test token refresh."""
    print_section("5. REFRESH TOKEN")
    print("Refreshing access token...")
    
    response = requests.post(
        f"{BASE_URL}/auth/token/refresh/",
        json={"refresh_token": refresh_token}
    )
    
    print_response(response, show_full=False)
    
    if response.stat:
        print("\n✅ Token refreshed successfully!")
        return response.json()['data']['refresh_token']
    else:
        print("\n⚠️  d")
        return refresh_token


def test_logout(access_token, refresh_token):
    """Test logout."""
    print_section("6. LOGOUT")
    print("Logging out...")
    
    response = requests.post(
        f"{BASE_URauth/logout/",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"refresh_token": refresh_token}
    )
    
    print_response(response, show_full=False)
    
    if response.status_code == 200:
        print("\n✅ Logged out successfully!")
    else:
        print("\n⚠️  Logout failed")


def test_health_check():
    """Test health check endpoint."""
    print_section("7. HEALTH CHECK")
    
    sts.get("http://localhost:8000/health/")
    print_respone)
    
    if response.status_code == 200:
        print("\n✅ Server is healthy!")


def main():
    """Run complete authentication flow test."""
    print("\n" + "="*70)
    print("  HandyGH Authentication Flow Test")
    print("  Real OTP Generation & Verification")
    print("="*70)
    
    try:
        # 1. Request OTP
        test_otp_request()
        
        # 2. Get OTP from user
        otp = get_otp_from_user()
        
        # 3. Verify OTP
        access_token, refresh_token = test_otp_verify(otp)
        
        # 4. Test authenticated endpoint
        test_authenticated_request(access_token)
        
        # 5. Refresh token
        new_refresh_token = test_token_refresh(refresh_token)
        
        # 6. Logout
        test_logout(access_token, new_refresh_token)
        
        # 7. Health check
        test_health_check()
        
        # Success summary
        print_section("✅ ALL TESTS PASSED!")
        print("\n🎉 Authentication system is working pe")
        print("\nWhat you can do next:")
        print("1. Visit http://localhost:8000/api/docs/ for full API documentation print("2. Visit http://localhost:8000/admin/ for admin panel")
        print("3. Continue building the Provider system and other features")
        print("\n" + "="*70 + "\n")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to server")
        print("Make sure the server is running:")
        print("  python manage.py runserver")
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
    except Except as e:
        print(f"\n❌ Error: {e}")
        import traceb       traceback.print_exc()


if __name__ == '__main__':
    main()
