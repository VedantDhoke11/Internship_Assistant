import os
import time
import json
import random
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv

import database as db
from parser import extract_text_from_pdf
from ai import get_ai_career_advice, get_resume_analysis

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.local')
load_dotenv(dotenv_path)

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
SUPABASE_BUCKET = os.getenv('SUPABASE_BUCKET_NAME') or 'Resume Storage'

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "time": time.time()}), 200

@app.route('/api/resume', methods=['GET'])
def get_resume():
    try:
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({"error": "userId query parameter is required"}), 400

        # Check user profile
        user = db.get_user_profile(user_id)
        if not user:
            return jsonify({"error": "User not found in database"}), 404

        resumes = db.check_user_resume(user_id)
        
        return jsonify({
            "hasResume": len(resumes) > 0,
            "resumes": resumes,
            "resume": resumes[0] if resumes else None
        }), 200
    except Exception as e:
        print(f"Flask GET /api/resume error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/resume', methods=['POST'])
def upload_resume():
    try:
        file = request.files.get('file')
        user_id = request.form.get('userId')

        if not file or not user_id:
            return jsonify({"error": "file and userId are required"}), 400

        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({"error": "Only PDF resumes are supported"}), 400

        # Verify user
        user = db.get_user_profile(user_id)
        if not user:
            return jsonify({"error": "User not found in database"}), 404

        # Read file bytes
        file_bytes = file.read()

        # Parse text content from PDF using our graceful parser
        # If the parsing throws an exception, parser.py catches it and returns ""
        parsed_text = extract_text_from_pdf(file_bytes)

        # Upload file to Supabase Storage
        if not SUPABASE_URL or not SUPABASE_KEY:
            return jsonify({"error": "Supabase credentials are not configured in parent .env.local"}), 500

        cleaned_filename = "".join([c if c.isalnum() or c in ".-_" else "_" for c in file.filename])
        file_path = f"{user_id}/{int(time.time())}-{cleaned_filename}"
        
        import urllib.parse
        encoded_bucket = urllib.parse.quote(SUPABASE_BUCKET)
        upload_url = f"{SUPABASE_URL}/storage/v1/object/{encoded_bucket}/{file_path}"
        headers = {
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/pdf"
        }

        # Upload binary file bytes directly to Supabase storage endpoint
        upload_res = requests.post(upload_url, data=file_bytes, headers=headers)
        if upload_res.status_code != 200:
            print(f"Supabase Storage Upload Error: {upload_res.status_code} - {upload_res.text}")
            return jsonify({"error": f"Failed to upload to Supabase Storage: {upload_res.text}"}), 500

        # Get public url
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{encoded_bucket}/{file_path}"

        # Insert metadata record into PostgreSQL resumes table
        ats_score = 0
        resume_record = db.create_resume_record(
            user_id=user_id,
            file_url=public_url,
            parsed_text=parsed_text,
            ats_score=ats_score
        )

        return jsonify({
            "message": "Resume uploaded successfully",
            "resume": resume_record
        }), 201
    except Exception as e:
        print(f"Flask POST /api/resume error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai-advisor', methods=['GET'])
def get_ai_advisor():
    try:
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({"error": "userId is required"}), 400

        raw_history = db.get_chat_history(user_id)
        messages = []
        if raw_history:
            try:
                messages = json.loads(raw_history)
            except Exception as parse_err:
                print(f"Failed to parse chat history JSON: {parse_err}")
                messages = [{"role": "assistant", "content": raw_history}]

        return jsonify({"messages": messages}), 200
    except Exception as e:
        print(f"Flask GET /api/ai-advisor error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai-advisor', methods=['POST'])
def chat_ai_advisor():
    try:
        req_data = request.get_json() or {}
        user_id = req_data.get('userId')
        messages = req_data.get('messages')

        if not user_id or not messages or not isinstance(messages, list):
            return jsonify({"error": "userId and messages list are required"}), 400

        # Fetch profile
        user_profile = db.get_user_profile(user_id)
        if not user_profile:
            return jsonify({"error": "User not found"}), 404

        # Fetch resumes
        resumes = db.check_user_resume(user_id)
        latest_resume = resumes[0] if resumes else {"parsedText": "No resume uploaded yet.", "atsScore": "N/A"}

        # Fetch applications
        applications = db.get_applications(user_id)

        # Call Groq API
        ai_response_message = get_ai_career_advice(
            user_profile=user_profile,
            resume_context=latest_resume,
            applications_context=applications,
            messages_history=messages
        )

        # Append response to messages history
        updated_history = messages + [ai_response_message]

        # Save to database
        db.save_chat_history(user_id, json.dumps(updated_history))

        return jsonify({
            "message": ai_response_message,
            "history": updated_history
        }), 200
    except Exception as e:
        print(f"Flask POST /api/ai-advisor error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/resume/analyze', methods=['POST'])
def analyze_resume_endpoint():
    try:
        req_data = request.get_json() or {}
        user_id = req_data.get('userId')

        if not user_id:
            return jsonify({"error": "userId is required"}), 400

        # Fetch profile for skills alignment
        user = db.get_user_profile(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Fetch resumes
        resumes = db.check_user_resume(user_id)
        if not resumes:
            return jsonify({"error": "No resume found in database. Please upload a resume first."}), 404

        latest_resume = resumes[0]
        parsed_text = latest_resume.get("parsedText") or ""

        # Call Groq to analyze the resume text content
        analysis = get_resume_analysis(parsed_text, user.get("skills", []))

        # Save real ATS score to database
        ats_score = analysis.get("atsScore", 0)
        db.update_resume_ats_score(latest_resume["id"], ats_score)

        return jsonify(analysis), 200
    except Exception as e:
        print(f"Flask POST /api/resume/analyze error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/internships', methods=['GET'])
def get_internships_endpoint():
    try:
        query = request.args.get('q', '')
        source = request.args.get('source', 'all')
        category = request.args.get('category', 'all')
        type_filter = request.args.get('type', 'all')
        page = int(request.args.get('page', '1'))
        
        from scraper import get_all_jobs
        listings = get_all_jobs(
            query=query,
            source=source,
            category=category,
            type_filter=type_filter,
            page=page
        )
        return jsonify({"listings": listings}), 200
    except Exception as e:
        print(f"Flask GET /api/internships error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Start the Flask development server on port 5000
    app.run(host='127.0.0.1', port=5000, debug=True)
