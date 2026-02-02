from app.core.security import get_password_hash, verify_password

class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash a password for storage.
        """
        return get_password_hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify a plain password against a hash.
        """
        return verify_password(plain_password, hashed_password)

# Create a singleton instance
auth_service = AuthService()
