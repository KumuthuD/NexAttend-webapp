import asyncio
import httpx

async def test_summary():
    async with httpx.AsyncClient() as client:
        # Test 1: Basic call without filters
        print("--- Test 1: Basic summary ---")
        try:
            response = await client.get("http://127.0.0.1:8000/api/v1/analytics/summary")
            print(f"Status: {response.status_code}")
            print(f"Data: {response.json()}")
        except Exception as e:
            print(f"Failed to connect: {e}")

if __name__ == "__main__":
    asyncio.run(test_summary())
