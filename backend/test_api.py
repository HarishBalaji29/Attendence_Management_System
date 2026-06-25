"""
Quick API Test Script
Tests the main endpoints to ensure the system is working
"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("=" * 70)
print("ATTENDANCE SYSTEM - API TESTING")
print("=" * 70)

# Test 1: Health check
print("\n✓ Test 1: Health Check")
try:
    res = requests.get(f"{BASE_URL}/health")
    print(f"  Status: {res.status_code}")
    print(f"  Response: {res.json()}")
except Exception as e:
    print(f"  ✗ Error: {e}")

# Test 2: Root endpoint
print("\n✓ Test 2: Root Endpoint")
try:
    res = requests.get(f"{BASE_URL}/")
    print(f"  Status: {res.status_code}")
    print(f"  Response: {res.json()}")
except Exception as e:
    print(f"  ✗ Error: {e}")

# Test 3: Login with admin credentials
print("\n✓ Test 3: Admin Login")
try:
    payload = {"username": "admin", "password": "admin123"}
    res = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
    print(f"  Status: {res.status_code}")
    if res.status_code == 200:
        data = res.json()
        print(f"  Access Token: {data['access_token'][:50]}...")
        print(f"  Token Type: {data.get('token_type', 'Bearer')}")
        access_token = data['access_token']
        
        # Test 4: Get current user with token
        print("\n✓ Test 4: Get Current User")
        headers = {"Authorization": f"Bearer {access_token}"}
        res = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        print(f"  Status: {res.status_code}")
        user = res.json()
        print(f"  Username: {user['username']}")
        print(f"  Email: {user['email']}")
        print(f"  Role: {user['role']}")
        
        # Test 5: Get dashboard stats
        print("\n✓ Test 5: Dashboard Stats")
        res = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=headers)
        print(f"  Status: {res.status_code}")
        if res.status_code == 200:
            stats = res.json()
            print(f"  Total Employees: {stats.get('total_employees', 0)}")
            print(f"  Active Employees: {stats.get('active_employees', 0)}")
            print(f"  Present Today: {stats.get('present_today', 0)}")
            print(f"  Absent Today: {stats.get('absent_today', 0)}")
        
        # Test 6: List employees
        print("\n✓ Test 6: List Employees")
        res = requests.get(f"{BASE_URL}/api/employees?page=1&page_size=10", headers=headers)
        print(f"  Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            print(f"  Total Employees: {data.get('total', 0)}")
            print(f"  Employees on page: {len(data.get('items', []))}")
        
        # Test 7: List attendance records
        print("\n✓ Test 7: List Attendance Records")
        res = requests.get(f"{BASE_URL}/api/attendance?page=1&page_size=10", headers=headers)
        print(f"  Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            print(f"  Total Records: {data.get('total', 0)}")
            print(f"  Records on page: {len(data.get('items', []))}")
        
        # Test 8: List attendance requests (new feature)
        print("\n✓ Test 8: List Attendance Requests (New Feature)")
        res = requests.get(f"{BASE_URL}/api/attendance-requests/my-requests?page=1", headers=headers)
        print(f"  Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            print(f"  Total Requests: {data.get('total', 0)}")
            print(f"  Requests on page: {len(data.get('items', []))}")
        
        print("\n✓ Test 9: API Documentation")
        print(f"  Swagger UI: {BASE_URL}/docs")
        print(f"  ReDoc: {BASE_URL}/redoc")
        
    else:
        print(f"  Error: {res.json()}")
except Exception as e:
    print(f"  ✗ Error: {e}")

print("\n" + "=" * 70)
print("TESTING COMPLETE")
print("=" * 70)
print("\n📱 Frontend URL: http://localhost:5174")
print("🔗 API Docs: http://localhost:8000/docs")
print("📧 Login with: admin / admin123")
print("\n✨ System is ready for testing!")
