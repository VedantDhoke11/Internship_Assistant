import requests
import json
import psycopg2
from urllib.parse import urlparse, quote
import os
from dotenv import load_dotenv

# Load the parent directory's .env.local file
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.local')
load_dotenv(dotenv_path)
DATABASE_URL = os.getenv('DIRECT_URL') or os.getenv('DATABASE_URL')

def get_cleaned_db_url():
    url = DATABASE_URL
    if not url: return None
    if url.startswith('"') and url.endswith('"'): url = url[1:-1]
    if url.startswith("'") and url.endswith("'"): url = url[1:-1]
    if '?' in url: base_url, query_str = url.split('?', 1)
    else: base_url, query_str = url, ''
    if '://' in base_url: scheme, rest = base_url.split('://', 1)
    else: scheme, rest = 'postgresql', base_url
    if '@' in rest:
        creds, host_part = rest.rsplit('@', 1)
        if ':' in creds:
            username, password = creds.split(':', 1)
            encoded_password = quote(password)
            base_url = f"{scheme}://{username}:{encoded_password}@{host_part}"
        else: base_url = f"{scheme}://{creds}@{host_part}"
    if query_str: return f"{base_url}?{query_str}"
    return base_url

def test_endpoints():
    db_url = get_cleaned_db_url()
    print("Database URL resolved:", db_url is not None)
    
    # 1. Fetch a user ID and check if they have a resume
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        cur.execute("SELECT id, name, email FROM users LIMIT 1")
        user = cur.fetchone()
        if not user:
            print("No users found in database.")
            return
        user_id, name, email = user
        print(f"Testing with User: {name} (ID: {user_id}, Email: {email})")
        
        cur.execute("SELECT id, file_url FROM resumes WHERE user_id = %s LIMIT 1", (user_id,))
        resume = cur.fetchone()
        if resume:
            print(f"User has resume: {resume[1]} (ID: {resume[0]})")
        else:
            print("User has no resume in database.")
            
        cur.close()
        conn.close()
    except Exception as e:
        print("Database query failed:", e)
        return

    # 2. Test GET /api/resume
    try:
        res = requests.get(f'http://127.0.0.1:5000/api/resume?userId={user_id}')
        print("GET /api/resume Status:", res.status_code)
        print("GET /api/resume Body:", res.text)
    except Exception as e:
        print("GET /api/resume call failed:", e)

    # 3. Test POST /api/resume/analyze
    try:
        print("Calling POST /api/resume/analyze...")
        res = requests.post(
            'http://127.0.0.1:5000/api/resume/analyze',
            json={"userId": user_id},
            headers={"Content-Type": "application/json"}
        )
        print("POST /api/resume/analyze Status:", res.status_code)
        print("POST /api/resume/analyze Body:", res.text)
    except Exception as e:
        print("POST /api/resume/analyze call failed:", e)

    # 4. Test POST /api/ai-advisor
    try:
        print("Calling POST /api/ai-advisor...")
        res = requests.post(
            'http://127.0.0.1:5000/api/ai-advisor',
            json={
                "userId": user_id,
                "messages": [{"role": "user", "content": "Hi! Can you give me quick career advice?"}]
            },
            headers={"Content-Type": "application/json"}
        )
        print("POST /api/ai-advisor Status:", res.status_code)
        print("POST /api/ai-advisor Body:", res.text)
    except Exception as e:
        print("POST /api/ai-advisor call failed:", e)

if __name__ == '__main__':
    test_endpoints()
