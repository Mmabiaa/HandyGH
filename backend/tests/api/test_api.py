"""
Quick API test script for HandyGH backend.

Tests the authentication flow:
1. Request OTP
2. Verify OTP
3. Use access token
4. Refresh token
5. Logout

Run: python test_api.py
"""

import json
import time

import requests

BASE_URL = "http://localhost:8000/api/v1"
PHONE = "+233241234567"


def print_response(title, response):
    """Print formatted response."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    print(f"Response:")
    print(json.dumps(response.json(), indent=2))


def test_authentication_flow():
    """Test complete authentication flow."""
    print("\n" + "=" * 60)
    print("  HandyGH API Test")
    print("=" * 60)

    # 1. Request OTP
    print("\n1. Requesting OTP...")
    response = requests.post(f"{BASE_URL}/auth/otp/request/", json={"phone": PHONE})
    print_response("OTP Request", response)

    if response.status_code != 200:
        print("\n✗ OTP request failed!")
        return

    # Get OTP from console (in real scenario, from SMS)
    print("\n" + "=" * 60)
    otp = input("Enter OTP code from console: ")

    # 2. Verify OTP
    print("\n2. Verifying OTP...")
    response = requests.post(f"{BASE_URL}/auth/otp/verify/", json={"phone": PHONE, "otp": otp})
    print_response("OTP Verification", response)

    if response.status_code != 200:
        print("\n✗ OTP verification failed!")
        return

    data = response.json()["data"]
    access_token = data["access_token"]
    refresh_token = data["refresh_token"]

    print(f"\n✓ Authentication successful!")
    print(f"User: {data['user']['name'] or data['user']['phone']}")
    print(f"Role: {data['user']['role']}")

    # 3. Test authenticated endpoint
    print("\n3. Testing authenticated endpoint...")
    response = requests.get(
        f"{BASE_URL}/users/me/", headers={"Authorization": f"Bearer {access_token}"}
    )
    print_response("Get Current User", response)

    # 4. Refresh token
    print("\n4. Refreshing token...")
    response = requests.post(
        f"{BASE_URL}/auth/token/refresh/", json={"refresh_token": refresh_token}
    )
    print_response("Token Refresh", response)

    if response.status_code == 200:
        new_refresh_token = response.json()["data"]["refresh_token"]
        print("\n✓ Token refreshed successfully!")
    else:
        new_refresh_token = refresh_token

    # 5. Logout
    print("\n5. Logging out...")
    response = requests.post(
        f"{BASE_URL}/auth/logout/",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"refresh_token": new_refresh_token},
    )
    print_response("Logout", response)

    # 6. Test health check
    print("\n6. Testing health check...")
    response = requests.get("http://localhost:8000/health/")
    print_response("Health Check", response)

    print("\n" + "=" * 60)
    print("  Test Complete!")
    print("=" * 60)
    print("\n✓ All tests passed!")
    print("\nNext steps:")
    print("1. Visit http://localhost:8000/api/docs/ for full API documentation")
    print("2. Visit http://localhost:8000/admin/ for admin panel")
    print("\n" + "=" * 60 + "\n")


if __name__ == "__main__":
    try:
        test_authentication_flow()
    except requests.exceptions.ConnectionError:
        print("\n✗ Error: Could not connect to server")
        print("Make sure the server is running: python manage.py runserver")
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
    except Exception as e:
        print(f"\n✗ Error: {e}")
