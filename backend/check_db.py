"""
Check database for admin user
"""
from app.database import SessionLocal
from app.models.user import User
from app.utils.security import verify_password

db = SessionLocal()
try:
    admin = db.query(User).filter(User.username == "admin").first()
    if admin:
        print("✓ Admin user found!")
        print(f"  ID: {admin.id}")
        print(f"  Username: {admin.username}")
        print(f"  Email: {admin.email}")
        print(f"  Role: {admin.role}")
        print(f"  Is Active: {admin.is_active}")
        print(f"  Password Hash: {admin.password_hash[:50]}...")
        
        # Test password verification
        is_valid = verify_password("admin123", admin.password_hash)
        print(f"  Password Verification (admin123): {is_valid}")
    else:
        print("✗ Admin user NOT found!")
        
    # List all users
    all_users = db.query(User).all()
    print(f"\nTotal users in DB: {len(all_users)}")
    for user in all_users:
        print(f"  - {user.username} ({user.role})")
finally:
    db.close()
