import asyncio
import httpx
import os

async def test_export():
    print("Testing /export/csv endpoint...")
    async with httpx.AsyncClient() as client:
        # We assume the uvicorn server is running on localhost:8000
        # If not running, we'll just catch the exception
        try:
            url = "http://localhost:8000/api/v1/export/csv"
            print(f"Requesting: {url}")
            response = await client.get(url)
            
            if response.status_code == 200:
                print("Success! CSV Received.")
                print(f"Content-Type: {response.headers.get('Content-Type')}")
                print(f"Content-Length: {len(response.content)} bytes")
                
                # Save to a temp file to verify
                with open("test_export_result.csv", "wb") as f:
                    f.write(response.content)
                print("CSV saved to test_export_result.csv")
                
                # Print first few lines
                first_lines = response.content.decode('utf-8').splitlines()[:5]
                print("First 5 lines:")
                for line in first_lines:
                    print(line)
            else:
                print(f"Failed with status code: {response.status_code}")
                print(response.text)
        except Exception as e:
            print(f"Error connecting to server: {e}")
            print("Make sure the uvicorn server is running (uvicorn app.main:app)")

if __name__ == "__main__":
    asyncio.run(test_export())
