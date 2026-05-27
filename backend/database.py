import os
import uuid
from contextlib import contextmanager
import psycopg2
from dotenv import load_dotenv

# Load the parent directory's .env.local file
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.local')
load_dotenv(dotenv_path)

from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode, quote

# Prefer DIRECT_URL (direct DB connection on port 5432) over DATABASE_URL (PgBouncer pooler on port 6543)
DATABASE_URL = os.getenv('DIRECT_URL') or os.getenv('DATABASE_URL')

def get_cleaned_db_url():
    url = DATABASE_URL
    if not url:
        return None
    # Strip enclosing quotes if present
    if url.startswith('"') and url.endswith('"'):
        url = url[1:-1]
    if url.startswith("'") and url.endswith("'"):
        url = url[1:-1]
    
    try:
        # 1. Split base URL and query parameters
        if '?' in url:
            base_url, query_str = url.split('?', 1)
        else:
            base_url, query_str = url, ''
            
        # 2. Parse and reconstruct credentials, percent-encoding the password
        # This fixes standard libpq parser errors when password contains '@' (like Badlapur@11)
        if '://' in base_url:
            scheme, rest = base_url.split('://', 1)
        else:
            scheme, rest = 'postgresql', base_url
            
        if '@' in rest:
            creds, host_part = rest.rsplit('@', 1)
            if ':' in creds:
                username, password = creds.split(':', 1)
                # Percent-encode the password to escape special characters like '@'
                encoded_password = quote(password)
                base_url = f"{scheme}://{username}:{encoded_password}@{host_part}"
            else:
                base_url = f"{scheme}://{creds}@{host_part}"
        
        # 3. Filter query options (keep only standard PostgreSQL libpq options)
        query_params = parse_qsl(query_str)
        supported_options = ['sslmode', 'connect_timeout', 'application_name', 'keepalives']
        cleaned_params = [(k, v) for k, v in query_params if k.lower() in supported_options]
        
        if cleaned_params:
            new_query = urlencode(cleaned_params)
            return f"{base_url}?{new_query}"
        else:
            return base_url
    except Exception as e:
        print(f"Warning: Failed to clean DATABASE_URL, using raw string: {e}")
        return url

@contextmanager
def get_db_connection():
    url = get_cleaned_db_url()
    if not url:
        raise ValueError("DATABASE_URL is not set in environment variables.")
    conn = psycopg2.connect(url)
    try:
        yield conn
    finally:
        conn.close()

def get_user_profile(user_id: str):
    """Fetches user profile information including university and skills."""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, name, email, college, graduation_year, skills FROM users WHERE id = %s",
                (user_id,)
            )
            row = cur.fetchone()
            if row:
                return {
                    "id": row[0],
                    "name": row[1],
                    "email": row[2],
                    "college": row[3],
                    "graduationYear": row[4],
                    "skills": row[5] if row[5] is not None else []
                }
            return None

def check_user_resume(user_id: str):
    """Fetches user resumes ordered by date."""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, file_url, ats_score, created_at, parsed_text FROM resumes WHERE user_id = %s ORDER BY created_at DESC",
                (user_id,)
            )
            rows = cur.fetchall()
            resumes = [{
                "id": r[0],
                "fileUrl": r[1],
                "atsScore": r[2],
                "createdAt": r[3].isoformat() if r[3] else None,
                "parsedText": r[4]
            } for r in rows]
            return resumes

def create_resume_record(user_id: str, file_url: str, parsed_text: str, ats_score: int):
    """Creates a new resume entry in the database."""
    resume_id = str(uuid.uuid4())
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO resumes (id, user_id, file_url, parsed_text, ats_score, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
                RETURNING id, file_url, ats_score, created_at
                """,
                (resume_id, user_id, file_url, parsed_text, ats_score)
            )
            conn.commit()
            row = cur.fetchone()
            return {
                "id": row[0],
                "fileUrl": row[1],
                "atsScore": row[2],
                "createdAt": row[3].isoformat() if row[3] else None
            }

def update_resume_ats_score(resume_id: str, ats_score: int):
    """Updates the ATS score of a resume in the database."""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE resumes SET ats_score = %s, updated_at = NOW() WHERE id = %s",
                (ats_score, resume_id)
            )
            conn.commit()
            return True

def get_chat_history(user_id: str):
    """Loads saved message history JSON for the career advisor chat."""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT recommendation FROM ai_insights WHERE user_id = %s ORDER BY generated_at DESC LIMIT 1",
                (user_id,)
            )
            row = cur.fetchone()
            if row:
                return row[0]
            return None

def save_chat_history(user_id: str, messages_json: str):
    """Saves or updates the message history JSON for the career advisor chat."""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id FROM ai_insights WHERE user_id = %s ORDER BY generated_at DESC LIMIT 1",
                (user_id,)
            )
            row = cur.fetchone()
            if row:
                insight_id = row[0]
                cur.execute(
                    "UPDATE ai_insights SET recommendation = %s, generated_at = NOW() WHERE id = %s",
                    (messages_json, insight_id)
                )
            else:
                insight_id = str(uuid.uuid4())
                cur.execute(
                    "INSERT INTO ai_insights (id, user_id, recommendation, generated_at) VALUES (%s, %s, %s, NOW())",
                    (insight_id, user_id, messages_json)
                )
            conn.commit()
            return True

def get_applications(user_id: str):
    """Fetches tracked applications to provide context for AI recommendations."""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT a.status, i.title, i.company, a.applied_at
                FROM applications a
                JOIN internships i ON a.internship_id = i.id
                WHERE a.user_id = %s
                """,
                (user_id,)
            )
            rows = cur.fetchall()
            return [{
                "status": r[0],
                "title": r[1],
                "company": r[2],
                "appliedAt": r[3].isoformat() if r[3] else None
            } for r in rows]
