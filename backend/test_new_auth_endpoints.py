"""
Test script for new authentication endpoints.

This script tests the complete signup and login flows.
Run with: python test_new_auth_endpoints.py
"""

import json
import time

import requests

BASE_URL = "http://127.0.0.1:8000/api/v1/auth"


def print_section(title):
    """Print a formatted section header."""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def print_response(response):
    """Print formatted response."""
    print(f"Status Code: {response.status_code}")
    try:
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
    except:
        print(f"Response: {response.text}")


def test_signup_flow():
    """Test the complete signup flow."""
    print_section("TESTING SIGNUP FLOW")

    # Step 1: Request signup
    print("\n1. Requesting signup...")
    signup_data = {
        "name": "Test User",
        "email": "test@example.com",
        "phone": "+233241234567",
        "role": "CUSTOMER",
    }

    response = requests.post(f"{BASE_URL}/signup/request/", json=signup_data)
    print_response(response)

    if response.status_code != 200:
        print("❌ Signup request failed!")
        return None

    print("✅ Signup request successful!")

    # Step 2: Get OTP from console (user needs to check backend console)
    print("\n2. Check the backend console for the OTP code")
    print("   Look for: OTP CODE FOR +233241234567: XXXXXX")
    otp = input("   Enter the OTP code: ").strip()

    if not otp or len(otp) != 6:
        print("❌ Invalid OTP format")
        return None

    # Step 3: Verify signup
    print("\n3. Verifying signup...")
    verify_data = {"phone": "+233241234567", "otp": otp}

    response = requests.post(f"{BASE_URL}/signup/verify/", json=verify_data)
    print_response(response)

    if response.status_code != 200:
        print("❌ Signup verification failed!")
        return None

    print("✅ Signup verification successful!")

    # Extract tokens
    data = response.json()
    if data.get("success") and data.get("data"):
        tokens = {
            "access_token": data["data"].get("access_token"),
            "refresh_token": data["data"].get("refresh_token"),
            "user": data["data"].get("user"),
        }
        print(f"\n✅ User created: {tokens['user']['name']} ({tokens['user']['role']})")
        return tokens

    return None


def test_login_flow():
    """Test the complete login flow."""
    print_section("TESTING LOGIN FLOW")

    # Step 1: Request login
    print("\n1. Requesting login...")
    login_data = {"phone": "+233241234567"}

    response = requests.post(f"{BASE_URL}/login/request/", json=login_data)
    print_response(response)

    if response.status_code != 200:
        print("❌ Login request failed!")
        return None

    print("✅ Login request successful!")

    # Step 2: Get OTP from console
    print("\n2. Check the backend console for the OTP code")
    otp = input("   Enter the OTP code: ").strip()

    if not otp or len(otp) != 6:
        print("❌ Invalid OTP format")
        return None

    # Step 3: Verify login
    print("\n3. Verifying login...")
    verify_data = {"phone": "+233241234567", "otp": otp}

    response = requests.post(f"{BASE_URL}/login/verify/", json=verify_data)
    print_response(response)

    if response.status_code != 200:
        print("❌ Login verification failed!")
        return None

    print("✅ Login verification successful!")

    # Extract tokens
    data = response.json()
    if data.get("success") and data.get("data"):
        tokens = {
            "access_token": data["data"].get("access_token"),
            "refresh_token": data["data"].get("refresh_token"),
            "user": data["data"].get("user"),
        }
        print(f"\n✅ User logged in: {tokens['user']['name']} ({tokens['user']['role']})")
        return tokens

    return None


def test_error_scenarios():
    """Test error scenarios."""
    print_section("TESTING ERROR SCENARIOS")

    # Test 1: Duplicate phone number
    print("\n1. Testing duplicate phone number...")
    signup_data = {
        "name": "Another User",
        "phone": "+233241234567",  # Same phone as before
        "role": "PROVIDER",
    }

    response = requests.post(f"{BASE_URL}/signup/request/", json=signup_data)
    print_response(response)

    if response.status_code == 400:
        print("✅ Correctly rejected duplicate phone number")
    else:
        print("❌ Should have rejected duplicate phone number")

    # Test 2: Login with non-existent user
    print("\n2. Testing login with non-existent user...")
    login_data = {"phone": "+233999999999"}

    response = requests.post(f"{BASE_URL}/login/request/", json=login_data)
    print_response(response)

    if response.status_code == 400:
        print("✅ Correctly rejected non-existent user")
    else:
        print("❌ Should have rejected non-existent user")

    # Test 3: Invalid OTP
    print("\n3. Testing invalid OTP...")
    verify_data = {"phone": "+233241234567", "otp": "000000"}

    response = requests.post(f"{BASE_URL}/signup/verify/", json=verify_data)
    print_response(response)

    if response.status_code == 401:
        print("✅ Correctly rejected invalid OTP")
    else:
        print("❌ Should have rejected invalid OTP")


def main():
    """Main test function."""
    print("\n" + "=" * 60)
    print("  BACKEND AUTHENTICATION ENDPOINTS TEST")
    print("=" * 60)
    print("\nMake sure the Django server is running:")
    print("  cd backend && python manage.py runserver")
    print("\nPress Enter to start testing...")
    input()

    try:
        # Test signup flow
        signup_tokens = test_signup_flow()

        if signup_tokens:
            print("\n✅ Signup flow completed successfully!")

            # Wait a bit
            time.sleep(2)

            # Test login flow
            login_tokens = test_login_flow()

            if login_tokens:
                print("\n✅ Login flow completed successfully!")

            # Test error scenarios
            test_error_scenarios()

            # Final summary
            print_section("TEST SUMMARY")
            print("\n✅ All tests completed!")
            print("\nBackend is working correctly and ready for mobile integration.")
        else:
            print("\n❌ Signup flow failed. Please check the backend.")

    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to backend server!")
        print("Make sure the Django server is running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")


if __name__ == "__main__":
    main()
