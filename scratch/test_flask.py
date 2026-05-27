import requests
import json

def test():
    try:
        # Check basic resume route
        res = requests.get('http://127.0.0.1:5000/api/resume?userId=test', timeout=5)
        print("Status Code:", res.status_code)
        print("Response:", res.text)
    except Exception as e:
        print("Error connecting to Flask server:", e)

if __name__ == '__main__':
    test()
