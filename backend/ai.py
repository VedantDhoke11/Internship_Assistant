import os
import requests
import json
from dotenv import load_dotenv

# Load the parent directory's .env.local file
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env.local')
load_dotenv(dotenv_path)

GROQ_API_KEY = os.getenv('GROQ_API_KEY')

def get_ai_career_advice(user_profile: dict, resume_context: dict, applications_context: list, messages_history: list) -> dict:
    """
    Sends the user profile, resume content, application status, and full message history
    to the Groq Llama-3.3-70b model to generate context-aware career recommendations.
    """
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not configured in the environment. Please add it to your .env.local file.")

    name = user_profile.get("name", "Student")
    college = user_profile.get("college", "N/A")
    graduation_year = user_profile.get("graduationYear", "N/A")
    skills = ", ".join(user_profile.get("skills", [])) or "None provided"

    # Extract resume info
    parsed_text = resume_context.get("parsedText") or "No resume uploaded yet."
    ats_score = resume_context.get("atsScore") or "N/A"

    # Extract application details
    app_summary = "\n".join([
        f"- Title: {app.get('title')}, Company: {app.get('company')}, Status: {app.get('status')}, Applied At: {app.get('appliedAt')}"
        for app in applications_context
    ]) or "No applications tracked yet."

    system_prompt = f"""You are a premium AI Career Advisor inside "InternshipOS" - an internship search and application tracker.
Your job is to act as a supportive, hyper-focused, and knowledgeable mentor for the student.

STUDENT PROFILE:
- Name: {name}
- College: {college}
- Graduation Year: {graduation_year}
- Stated Skills: {skills}

RESUME CONTEXT (ATS Score: {ats_score}):
------------------
{parsed_text[:4000]}
------------------

APPLICATION HISTORY:
------------------
{app_summary}
------------------

GUIDELINES FOR YOUR RESPONSES:
1. Speak directly to {name.split(' ')[0]}.
2. Base your guidance heavily on their resume content, stated skills, and current application history.
3. Keep your replies concise, structured, and action-oriented. Use bold text, bullet points, and markdown for high readability.
4. Highlight skill gaps if they target high-demand roles, recommend specific portfolio projects, and offer strategic advice (e.g. ATS optimization, mock interviews, search strategies).
5. If the student hasn't uploaded a resume (i.e. Resume context says "No resume uploaded yet"), kindly guide them to upload their resume using the dashboard modal so you can analyze it.
6. Provide advice in a professional yet encouraging tone."""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    body = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt}
        ] + messages_history,
        "temperature": 0.7,
        "max_tokens": 2048
    }

    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers=headers,
        json=body,
        timeout=30
    )

    if response.status_code != 200:
        raise RuntimeError(f"Groq API returned error {response.status_code}: {response.text}")

    data = response.json()
    return data["choices"][0]["message"]

def get_resume_analysis(parsed_text: str, stated_skills: list) -> dict:
    """
    Evaluates the resume text using Groq's Llama model and returns structured JSON
    detailing overall feedback, missing keywords, and formatting improvement suggestions.
    """
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not configured in the environment. Please add it to your .env.local file.")

    system_prompt = """You are a senior technical recruiter and professional ATS optimizer.
Your job is to scan the student's resume text, evaluate it, and provide a highly detailed audit.

Evaluate the resume text and format your response as a strict JSON object with the following keys:
1. "feedback": A paragraph summarizing their resume's strengths and core weaknesses.
2. "missingKeywords": A list of 4-6 high-demand technical keywords or skills they should add based on their targeted engineering/business domain.
3. "improvements": A list of 3-4 specific bullet points with actionable suggestions (e.g. project metrics to add, layout suggestions, action verbs).
4. "atsScore": An integer between 30 and 95 (where 30 is poor match, 95 is excellent match) representing a realistic ATS score based on keyword match, formatting, and industry-standard resume criteria.

Ensure you return ONLY a raw JSON string (no markdown ticks, no prefix, no postfix) so it can be parsed immediately in Python."""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    user_prompt = f"""Stated Skills: {', '.join(stated_skills) or 'None provided'}
    
    Resume Content:
    {parsed_text[:4000]}"""

    body = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.5,
        "response_format": {"type": "json_object"}
    }

    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers=headers,
        json=body,
        timeout=30
    )

    if response.status_code != 200:
        raise RuntimeError(f"Groq API returned error {response.status_code}: {response.text}")

    data = response.json()
    content = data["choices"][0]["message"]["content"]
    
    try:
        return json.loads(content)
    except Exception as parse_err:
        print(f"Failed to parse Groq response content as JSON: {parse_err}. Content: {content}")
        return {
            "feedback": "Failed to parse structured ATS evaluation from Groq.",
            "missingKeywords": [],
            "improvements": []
        }
