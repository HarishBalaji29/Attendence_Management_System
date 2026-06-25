"""
Detailed API test with error handling
"""
import requests
import traceback

BASE_URL = "http://localhost:8000"

print("\n" + "=" * 70)
print("DETAILED API TEST - LOGIN ENDPOINT")
print("=" * 70)

# Test login with detailed error handling
print("\n🔐 Testing Login Endpoint...")
try:
    payload = {"username": "admin", "password": "admin123"}
    print(f"  Request URL: POST {BASE_URL}/api/auth/login")
    print(f"  Payload: {payload}")
    
    res = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
    print(f"  Status Code: {res.status_code}")
    print(f"  Response Headers: {dict(res.headers)}")
    print(f"  Response Body (text): {res.text[:500]}")
    
    if res.status_code == 200:
        data = res.json()
        print(f"  ✓ Success!")
        print(f"    Access Token: {data.get('access_token', '???')[:50]}...")
        print(f"    Refresh Token: {data.get('refresh_token', '???')[:50]}...")
    else:
        print(f"  ✗ Error status {res.status_code}")
        try:
            print(f"  Response JSON: {res.json()}")
        except:
            print(f"  Could not parse response as JSON")
            
except Exception as e:
    print(f"  ✗ Exception: {type(e).__name__}: {e}")
    traceback.print_exc()

print("\n" + "=" * 70)
