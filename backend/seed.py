"""
Seed script — creates the default admin user.
Run AFTER running: alembic upgrade head

Usage:
    cd backend
    python seed.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from app.models.user import User
from app.utils.security import hash_password
from app.config import settings


def seed():
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing = db.query(User).filter(User.username == settings.ADMIN_USERNAME).first()
        if existing:
            existing.email = settings.ADMIN_EMAIL
            existing.password_hash = hash_password(settings.ADMIN_PASSWORD)
            db.commit()
            print(f"[seed] [SUCCESS] Admin user '{settings.ADMIN_USERNAME}' credentials updated in database to match current .env settings.")
            return

        admin = User(
            username=settings.ADMIN_USERNAME,
            email=settings.ADMIN_EMAIL,
            password_hash=hash_password(settings.ADMIN_PASSWORD),
            role="admin",
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print(f"[seed] [SUCCESS] Admin user created:")
        print(f"       Username : {settings.ADMIN_USERNAME}")
        print(f"       Email    : {settings.ADMIN_EMAIL}")
        print(f"       Role     : admin")
        print(f"       Password : (as set in .env)")
    except Exception as e:
        db.rollback()
        print(f"[seed] [ERROR] Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
