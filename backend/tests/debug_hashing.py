from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def test():
    password = "testpassword"
    try:
        hashed = pwd_context.hash(password)
        print(f"Hashed: {hashed}")
        verified = pwd_context.verify(password, hashed)
        print(f"Verified: {verified}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test()
