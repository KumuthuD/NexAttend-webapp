
import asyncio
import httpx
from datetime import datetime

async def test_session_results():
    base_url = "http://localhost:8000/api/v1"
    
    # 1. Start a session
    # Note: This assumes a classroom with ID 'test_classroom' exists or handles the error
    async with httpx.AsyncClient() as client:
        # First, ensure we have a classroom or mock the DB
        # For simplicity in this test, we'll try to get an existing session if possible, 
        # but the best way is to run a full integration test.
        
        # Let's try to start a session for a known classroom (or any ID)
        print("Starting attendance session...")
        start_resp = await client.post(
            f"{base_url}/attendance/start",
            json={"classroom_id": "test_classroom_id"}
        )
        
        if start_resp.status_code != 201 and start_resp.status_code != 200:
            print(f"Failed to start session: {start_resp.text}")
            # If start fails because classroom doesn't exist, we can't easily fix it here without more setup
            return

        session_data = start_resp.json()
        session_id = session_data["_id"]
        print(f"Session started with ID: {session_id}")
        
        # 2. Get session results
        print(f"Fetching results for session: {session_id}...")
        results_resp = await client.get(f"{base_url}/attendance/session/{session_id}")
        
        if results_resp.status_code == 200:
            print("Successfully retrieved session results!")
            data = results_resp.json()
            print(f"Session ID: {data['_id']}")
            print(f"Status: {data['status']}")
            print(f"Records count: {len(data['records'])}")
        else:
            print(f"Failed to retrieve results: {results_resp.status_code}")
            print(results_resp.text)

if __name__ == "__main__":
    # This script requires the backend to be running
    try:
        asyncio.run(test_session_results())
    except Exception as e:
        print(f"Error running test: {e}")
