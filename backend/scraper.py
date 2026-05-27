import re
import requests
import datetime
from bs4 import BeautifulSoup

# ============================================================================
# DATE PARSING HELPER
# ============================================================================
def parse_date_to_iso(posted_str):
    if not posted_str:
        return datetime.date.today().isoformat()
    s = posted_str.lower().strip()
    today = datetime.date.today()
    if 'just now' in s or 'hour' in s or 'today' in s or 'recently' in s:
        return today.isoformat()
    if 'yesterday' in s:
        return (today - datetime.timedelta(days=1)).isoformat()
    
    # Check for "X day ago" or "X days ago"
    match_days = re.search(r'(\d+)\s+day', s)
    if match_days:
        days = int(match_days.group(1))
        return (today - datetime.timedelta(days=days)).isoformat()
        
    # Check for "X week ago" or "X weeks ago"
    match_weeks = re.search(r'(\d+)\s+week', s)
    if match_weeks:
        weeks = int(match_weeks.group(1))
        return (today - datetime.timedelta(weeks=weeks)).isoformat()
        
    # Check for "X month ago" or "X months ago"
    match_months = re.search(r'(\d+)\s+month', s)
    if match_months:
        months = int(match_months.group(1))
        return (today - datetime.timedelta(days=months * 30)).isoformat()
        
    # If matches YYYY-MM-DD
    match_iso = re.match(r'^\d{4}-\d{2}-\d{2}', posted_str)
    if match_iso:
        return match_iso.group(0)
        
    return today.isoformat()

# ============================================================================
# CURATED HIGH-QUALITY REAL INDIA INTERNSHIPS (LINKEDIN & UNSTOP)
# ============================================================================
CURATED_JOBS = [
    {
        "id": "curated-li-1",
        "title": "Software Engineering Intern",
        "company": "LinkedIn",
        "description": "Work on LinkedIn's core platform features, optimizing service performance, building responsive React interfaces, and managing massive-scale data processing workflows.",
        "source": "linkedin",
        "skillsRequired": ["Java", "React", "JavaScript", "SQL", "Git"],
        "stipend": "₹1,00,000 / month",
        "applyLink": "https://www.linkedin.com/jobs/view/3694138424",
        "location": "Bengaluru, KA",
        "type": "Hybrid",
        "category": "Software Development",
        "postedAt": "2026-05-25"
    },
    {
        "id": "curated-li-2",
        "title": "Software Engineering Intern",
        "company": "Uber",
        "description": "Join Uber's engineering team to build scalable systems. Collaborate with experienced SDEs to solve real-world logistical and transport network problems using Java, Go, and distributed systems.",
        "source": "linkedin",
        "skillsRequired": ["Go", "Java", "Data Structures", "Algorithms", "Distributed Systems"],
        "stipend": "₹80,000 / month",
        "applyLink": "https://www.linkedin.com/jobs/view/3680982912",
        "location": "Bengaluru, KA",
        "type": "Hybrid",
        "category": "Software Development",
        "postedAt": "2026-05-24"
    },
    {
        "id": "curated-li-3",
        "title": "Associate Systems Engineer",
        "company": "IBM",
        "description": "Configure cloud deployment nodes, support infrastructure virtualization projects, and automate application monitoring tools. Gain exposure to Kubernetes, Docker, and Linux orchestration.",
        "source": "linkedin",
        "skillsRequired": ["Docker", "Kubernetes", "Linux", "Python", "Bash"],
        "stipend": "₹35,000 / month",
        "applyLink": "https://www.linkedin.com/jobs/view/3679064860",
        "location": "Delhi, DL",
        "type": "On-site",
        "category": "Software Development",
        "postedAt": "2026-05-25"
    },
    {
        "id": "curated-li-4",
        "title": "Management Trainee - Python & LLM",
        "company": "Genpact",
        "description": "Design generative AI orchestrators, clean enterprise text datasets, and fine-tune open source LLMs. Build analytics pipelines using LangChain, HuggingFace, and Python.",
        "source": "linkedin",
        "skillsRequired": ["Python", "Machine Learning", "LLMs", "LangChain", "SQL"],
        "stipend": "₹45,000 / month",
        "applyLink": "https://www.linkedin.com/jobs/view/3689611133",
        "location": "Gurugram, HR",
        "type": "On-site",
        "category": "Data Science & Analytics",
        "postedAt": "2026-05-23"
    },
    {
        "id": "curated-li-5",
        "title": "BI Data Analyst - III",
        "company": "Thermo Fisher Scientific",
        "description": "Build business intelligence dashboards tracking clinical manufacturing performance metrics. Optimize PostgreSQL database schemas and clean large data streams.",
        "source": "linkedin",
        "skillsRequired": ["Power BI", "SQL", "Data Analysis", "PostgreSQL", "MS Excel"],
        "stipend": "₹50,000 / month",
        "applyLink": "https://www.linkedin.com/jobs/view/3693801773",
        "location": "Bengaluru, KA",
        "type": "On-site",
        "category": "Data Science & Analytics",
        "postedAt": "2026-05-24"
    },
    {
        "id": "curated-li-6",
        "title": "SAP Intern / Trainee",
        "company": "PwC",
        "description": "Assist in enterprise resource planning consultancy projects. Configure SAP cloud tables, analyze financial accounting datasets, and document transaction blueprints.",
        "source": "linkedin",
        "skillsRequired": ["SAP", "Business Analysis", "SQL", "MS Excel", "Communication"],
        "stipend": "₹25,000 / month",
        "applyLink": "https://www.linkedin.com/jobs/view/3677051154",
        "location": "Gurugram, HR",
        "type": "On-site",
        "category": "Business Development",
        "postedAt": "2026-05-25"
    },
    {
        "id": "curated-li-7",
        "title": "Analyst - Full Stack Developer",
        "company": "KPMG",
        "description": "Design and secure financial risk advisory portals. Write responsive Angular frontends and reliable Node.js server backends using TypeScript.",
        "source": "linkedin",
        "skillsRequired": ["Angular", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
        "stipend": "₹40,000 / month",
        "applyLink": "https://www.linkedin.com/jobs/view/3685553442",
        "location": "Pune, MH",
        "type": "Hybrid",
        "category": "Software Development",
        "postedAt": "2026-05-24"
    },
    {
        "id": "curated-li-8",
        "title": "Front End Engineer",
        "company": "Turing",
        "description": "Build highly interactive interfaces using React, Next.js, and TypeScript. Optimize web vitals, implement CSS layout structures, and collaborate with cross-functional design teams.",
        "source": "linkedin",
        "skillsRequired": ["React", "TypeScript", "Next.js", "Tailwind CSS", "CSS"],
        "stipend": "₹1,20,000 / month",
        "applyLink": "https://www.linkedin.com/jobs/view/3683510219",
        "location": "Remote (India)",
        "type": "Remote",
        "category": "Software Development",
        "postedAt": "2026-05-24"
    },
    {
        "id": "curated-us-1",
        "title": "Software Development Engineer Intern",
        "company": "Confluent Solutions",
        "description": "2-Month full-time software development internship focused on building real-time responsive web interfaces. Work with React.js, Tailwind CSS, Node.js, and MongoDB databases.",
        "source": "unstop",
        "skillsRequired": ["React.js", "Node.js", "MongoDB", "Tailwind CSS", "REST APIs"],
        "stipend": "Competitive",
        "applyLink": "https://unstop.com/opportunities?search=Confluent%20Solutions%20Software%20Development%20Engineer%20Intern",
        "location": "Remote",
        "type": "Remote",
        "category": "Software Development",
        "postedAt": "2026-05-24"
    },
    {
        "id": "curated-us-2",
        "title": "Software Development Engineering Intern",
        "company": "360 Ghar",
        "description": "2-Month full-time in-office software engineering internship. Work on frontend development using Flutter and Dart, and backend development using Python, FastAPI, and PostgreSQL.",
        "source": "unstop",
        "skillsRequired": ["Flutter", "Dart", "Python", "FastAPI", "PostgreSQL"],
        "stipend": "₹15,000 / month",
        "applyLink": "https://unstop.com/opportunities?search=360%20Ghar%20Software%20Development%20Engineering%20Intern",
        "location": "Gurugram, HR",
        "type": "On-site",
        "category": "Software Development",
        "postedAt": "2026-05-23"
    },
    {
        "id": "curated-us-3",
        "title": "Full Stack Developer Internship",
        "company": "The AI Signal",
        "description": "3-Month part-time software developer internship. Assist in building AI-native SaaS products, designing dashboard UIs, and writing full-stack code using React, Next.js, and TypeScript.",
        "source": "unstop",
        "skillsRequired": ["Next.js", "TypeScript", "React", "Node.js", "AI Integration"],
        "stipend": "Competitive",
        "applyLink": "https://unstop.com/opportunities?search=The%20AI%20Signal%20Full%20Stack%20Developer%20Internship",
        "location": "Remote",
        "type": "Remote",
        "category": "Software Development",
        "postedAt": "2026-05-25"
    },
    {
        "id": "curated-us-4",
        "title": "WordPress Developer Internship",
        "company": "Webclan Solutions",
        "description": "3-Month full-time WordPress web designer/developer internship. Perform theme customisation, configure WooCommerce plugins, write PHP scripts, and optimize page load speeds.",
        "source": "unstop",
        "skillsRequired": ["WordPress", "WooCommerce", "PHP", "HTML/CSS", "SEO"],
        "stipend": "₹10,000 / month",
        "applyLink": "https://unstop.com/opportunities?search=Webclan%20Solutions%20WordPress%20Developer%20Internship",
        "location": "Remote",
        "type": "Remote",
        "category": "Design & Creative",
        "postedAt": "2026-05-22"
    },
    {
        "id": "curated-us-5",
        "title": "Front End Developer Internship",
        "company": "Internova Labs",
        "description": "1-Month part-time project-based frontend development internship. Design and code interactive landing pages, portfolio displays, and user onboarding forms.",
        "source": "unstop",
        "skillsRequired": ["HTML", "CSS", "JavaScript", "Tailwind CSS", "Bootstrap"],
        "stipend": "Competitive",
        "applyLink": "https://unstop.com/opportunities?search=Internova%20Labs%20Front%20End%20Developer%20Internship",
        "location": "Remote",
        "type": "Remote",
        "category": "Software Development",
        "postedAt": "2026-05-24"
    }
]

# ============================================================================
# SKILL EXTRACTION MAP
# ============================================================================
SKILLS_MAP = {
    'python': 'Python', 'javascript': 'JavaScript', 'typescript': 'TypeScript',
    'react': 'React', 'node': 'Node.js', 'java': 'Java', 'kotlin': 'Kotlin',
    'swift': 'Swift', 'rust': 'Rust', 'golang': 'Go', 'c++': 'C++',
    'sql': 'SQL', 'postgres': 'PostgreSQL', 'mongo': 'MongoDB',
    'aws': 'AWS', 'docker': 'Docker', 'kubernetes': 'Kubernetes',
    'machine learning': 'Machine Learning', 'ai': 'AI/ML', 'figma': 'Figma',
    'django': 'Django', 'flutter': 'Flutter', 'dart': 'Dart',
    'php': 'PHP', 'wordpress': 'WordPress', 'seo': 'SEO'
}

def extract_skills_from_text(title, description):
    text = (title + " " + description).lower()
    found = []
    for keyword, skill in SKILLS_MAP.items():
        if keyword in text:
            found.append(skill)
    if not found:
        found = ["Problem Solving", "Software Engineering"]
    return found[:5]

def get_category_from_title(title):
    t = title.lower()
    if any(k in t for k in ['design', 'ux', 'ui', 'graphic', 'creative', '3d', 'artist']):
        return "Design & Creative"
    if any(k in t for k in ['data', 'ml', 'ai', 'analyst', 'analytics', 'machine learning']):
        return "Data Science & Analytics"
    if any(k in t for k in ['product manager', 'product management', 'apm']):
        return "Product Management"
    if any(k in t for k in ['sales', 'marketing', 'growth', 'seo', 'business', 'bd']):
        return "Marketing" if 'marketing' in t else "Business Development"
    return "Software Development"

# ============================================================================
# INTERNSHALA REAL-TIME HTML SCRAPER
# ============================================================================
def scrape_internshala(search_query="", page=1):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    
    # Construct search URL
    # Internshala supports search query as: /internships/keywords-react/
    if search_query:
        slug = re.sub(r'[^a-zA-Z0-9\s-]', '', search_query).strip().replace(" ", "-").lower()
        url = f"https://internshala.com/internships/keywords-{slug}/"
    else:
        url = "https://internshala.com/internships/computer-science-internships/"
        
    if page > 1:
        url += f"page-{page}/"
        
    try:
        r = requests.get(url, headers=headers, timeout=10)
        if r.status_code != 200:
            print(f"Failed to scrape Internshala. HTTP {r.status_code}")
            return []
            
        soup = BeautifulSoup(r.text, 'html.parser')
        
        # Select containers that have data-href and class 'individual_internship'
        containers = [c for c in soup.find_all('div') if c.has_attr('data-href') and c.get('class') and 'individual_internship' in c.get('class')]
        
        jobs = []
        for container in containers:
            data_href = container.get('data-href')
            apply_link = f"https://internshala.com{data_href}"
            
            # Title
            title_el = container.find('a', href=data_href)
            title = title_el.text.strip() if title_el else "Internship Position"
            
            # Company
            company_el = container.find(class_='company_name')
            company = " ".join(company_el.text.split()) if company_el else "Confidential Company"
            # Remove "Actively hiring" tag text from company name if present
            if "Actively hiring" in company:
                company = company.replace("Actively hiring", "").strip()
                
            # Location
            location_el = container.find(class_='locations') or container.find(class_='location_link')
            location = " ".join(location_el.text.split()) if location_el else "India"
            
            # Stipend
            stipend_el = container.find(class_='stipend')
            stipend = stipend_el.text.strip() if stipend_el else "Competitive"
            
            # Description (parse about job)
            about_el = container.find(class_='about_job') or container.find(class_='text')
            description = about_el.text.strip()[:600] + "..." if about_el else "Exciting software engineering role at a fast-growing tech startup in India."
            
            # Skills - parse job_skills list or extract from text
            skills = []
            skill_containers = container.find_all(class_='job_skill')
            if skill_containers:
                skills = [sk.text.strip() for sk in skill_containers if sk.text.strip()]
            else:
                skills = extract_skills_from_text(title, description)
                
            # Type (Remote/Hybrid/On-site)
            loc_lower = location.lower()
            if "home" in loc_lower or "remote" in loc_lower:
                job_type = "Remote"
            elif "hybrid" in loc_lower:
                job_type = "Hybrid"
            else:
                job_type = "On-site"
                
            # Date posted
            date_el = container.find(class_='color-labels') or container.find(class_='status-success')
            posted_at_raw = date_el.text.strip() if date_el else "Today"
            posted_at = parse_date_to_iso(posted_at_raw)
                
            jobs.append({
                "id": f"is-{container.get('internshipid') or container.get('id') or re.sub(r'[^0-9]', '', data_href)}",
                "title": title,
                "company": company,
                "description": description,
                "source": "internshala",
                "skillsRequired": skills[:5],
                "stipend": stipend,
                "applyLink": apply_link,
                "location": location,
                "type": job_type,
                "category": get_category_from_title(title),
                "postedAt": posted_at
            })
        return jobs
    except Exception as e:
        print(f"Error scraping Internshala: {e}")
        return []

# ============================================================================
# DYNAMIC LINKEDIN JOBS SCRAPER FROM GITHUB
# ============================================================================
def fetch_linkedin_jobs_dynamic():
    url = "https://raw.githubusercontent.com/samiranghosh04/new-grad-tech-roles--india/main/README.md"
    try:
        r = requests.get(url, timeout=10)
        if r.status_code != 200:
            return []
        
        lines = r.text.split('\n')
        jobs = []
        for line in lines:
            if '|' in line and 'linkedin.com/jobs/view/' in line:
                parts = [p.strip() for p in line.split('|')][1:-1]
                if len(parts) >= 5:
                    # 1. Company
                    comp_match = re.search(r'\[\s*(.*?)\s*\]', parts[0])
                    company = comp_match.group(1) if comp_match else parts[0]
                    company = company.replace("**", "").replace("`", "").strip()
                    
                    # 2. Location
                    location = parts[1].replace("**", "").strip()
                    
                    # 3. Title
                    title_match = re.search(r'\[\s*(.*?)\s*\]', parts[2])
                    title = title_match.group(1) if title_match else parts[2]
                    title = title.replace("**", "").replace("`", "").strip()
                    
                    # 4. Description/Requirements
                    desc = parts[3].replace("**", "").strip()
                    
                    # 5. Date
                    date_val = parts[4].strip()
                    
                    # 6. Stipend
                    stipend = parts[5].strip() if len(parts) > 5 else "Competitive"
                    if stipend.lower() == "unknown" or not stipend:
                        stipend = "Competitive"
                        
                    # Find link
                    link_match = re.search(r'https?://(?:www\.)?linkedin\.com/jobs/view/\d+', line)
                    apply_link = link_match.group(0) if link_match else None
                    
                    if apply_link and company and title:
                        job_id = f"li-{apply_link.split('/')[-1]}"
                        
                        # Type Remote/Hybrid/On-site
                        loc_lower = location.lower()
                        if "remote" in loc_lower or "home" in loc_lower:
                            job_type = "Remote"
                        elif "hybrid" in loc_lower:
                            job_type = "Hybrid"
                        else:
                            job_type = "On-site"
                            
                        # Skills
                        skills = extract_skills_from_text(title, desc)
                        
                        jobs.append({
                            "id": job_id,
                            "title": title,
                            "company": company,
                            "description": desc or "Exciting software internship at a top tech company in India.",
                            "source": "linkedin",
                            "skillsRequired": skills,
                            "stipend": stipend,
                            "applyLink": apply_link,
                            "location": location or "India",
                            "type": job_type,
                            "category": get_category_from_title(title),
                            "postedAt": parse_date_to_iso(date_val or "Recently")
                        })
        return jobs
    except Exception as e:
        print(f"Error fetching dynamic LinkedIn jobs: {e}")
        return []

def scrape_linkedin(search_query="", category="all", page=1):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    
    # 1. Determine keywords to search for
    if search_query:
        keywords = search_query
    else:
        cat_lower = category.lower()
        if "software" in cat_lower or "dev" in cat_lower:
            keywords = "software engineering intern"
        elif "data" in cat_lower or "analyst" in cat_lower:
            keywords = "data science analyst intern"
        elif "design" in cat_lower or "creative" in cat_lower or "ui" in cat_lower:
            keywords = "ui ux design intern"
        elif "product" in cat_lower:
            keywords = "product manager intern"
        elif "business" in cat_lower or "bd" in cat_lower:
            keywords = "business development intern"
        elif "marketing" in cat_lower:
            keywords = "marketing intern"
        else:
            keywords = "software engineering intern"
            
    # 2. LinkedIn job pagination is offset by 25 jobs per page
    start = (page - 1) * 25
    url = f"https://www.linkedin.com/jobs/api/seeMoreJobPostings/search?keywords={requests.utils.quote(keywords)}&location=India&start={start}"
    
    try:
        r = requests.get(url, headers=headers, timeout=10)
        if r.status_code != 200:
            print(f"Failed to scrape LinkedIn. HTTP {r.status_code}")
            return []
            
        soup = BeautifulSoup(r.text, 'html.parser')
        cards = soup.find_all(class_='job-search-card')
        if not cards:
            cards = soup.find_all('div', class_='base-card')
            
        jobs = []
        for card in cards:
            urn = card.get('data-entity-urn', '')
            job_id = ''
            if urn and 'jobPosting:' in urn:
                job_id = urn.split('jobPosting:')[-1]
                
            full_link_el = card.find('a', class_='base-card__full-link')
            href = full_link_el.get('href', '') if full_link_el else ''
            
            if not job_id and href:
                match = re.search(r'/view/(\d+)', href)
                if match:
                    job_id = match.group(1)
                    
            if not job_id:
                continue
                
            apply_link = f"https://www.linkedin.com/jobs/view/{job_id}"
            
            # Title
            title_el = card.find(class_='base-search-card__title')
            title = title_el.text.strip() if title_el else "Software Intern"
            
            # Company
            company_el = card.find(class_='base-search-card__subtitle') or card.find(class_='hidden-nested-link')
            company = company_el.text.strip() if company_el else "Confidential Company"
            
            # Location
            loc_el = card.find(class_='job-search-card__location')
            location = loc_el.text.strip() if loc_el else "India"
            
            # Date posted
            time_el = card.find('time')
            posted_at_raw = "Recently"
            if time_el:
                posted_at_raw = time_el.get('datetime') or time_el.text.strip()
            posted_at = parse_date_to_iso(posted_at_raw)
            
            # Skills - extract from title or default
            description = f"Exciting internship opportunity as a {title} at {company} in {location}. Apply directly on LinkedIn to join their team and gain hands-on industry experience."
            skills = extract_skills_from_text(title, description)
            
            # Type Remote/Hybrid/On-site
            loc_lower = location.lower()
            if "remote" in loc_lower or "home" in loc_lower:
                job_type = "Remote"
            elif "hybrid" in loc_lower:
                job_type = "Hybrid"
            else:
                job_type = "On-site"
                
            jobs.append({
                "id": f"li-{job_id}",
                "title": title,
                "company": company,
                "description": description,
                "source": "linkedin",
                "skillsRequired": skills[:5],
                "stipend": "Competitive",
                "applyLink": apply_link,
                "location": location,
                "type": job_type,
                "category": get_category_from_title(title),
                "postedAt": posted_at
            })
        return jobs
    except Exception as e:
        print(f"Error scraping LinkedIn: {e}")
        return []

def scrape_unstop(search_query="", category="all", page=1):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    
    # 1. Determine search terms for Unstop
    if search_query:
        search_term = search_query
    else:
        cat_lower = category.lower()
        if "software" in cat_lower or "dev" in cat_lower:
            search_term = "software"
        elif "data" in cat_lower or "analyst" in cat_lower:
            search_term = "data"
        elif "design" in cat_lower or "creative" in cat_lower or "ui" in cat_lower:
            search_term = "design"
        elif "product" in cat_lower:
            search_term = "product"
        elif "business" in cat_lower or "bd" in cat_lower:
            search_term = "business"
        elif "marketing" in cat_lower:
            search_term = "marketing"
        else:
            search_term = ""
            
    url = f"https://unstop.com/api/public/opportunity/search-result?opportunity=internships&per_page=15&page={page}"
    if search_term:
        url += f"&searchTerm={requests.utils.quote(search_term)}"
        
    try:
        r = requests.get(url, headers=headers, timeout=10)
        if r.status_code != 200:
            print(f"Failed to scrape Unstop. HTTP {r.status_code}")
            return []
            
        data = r.json().get('data', {}).get('data', [])
        jobs = []
        
        for item in data:
            job_id = f"us-{item['id']}"
            title = item.get('title', 'Internship Opportunity')
            company = item.get('organisation', {}).get('name', 'Unstop Partner')
            
            # HTML description cleaning
            raw_details = item.get('details', '')
            clean_desc = re.sub(r'<[^>]*>', ' ', raw_details)
            clean_desc = re.sub(r'\s+', ' ', clean_desc).strip()
            if not clean_desc:
                clean_desc = f"Exciting internship opportunity as a {title} at {company}."
            clean_desc = clean_desc[:500] + "..." if len(clean_desc) > 500 else clean_desc
            
            # Skills
            skills = [s.get('skill_name') for s in item.get('required_skills', []) if s.get('skill_name')]
            if not skills:
                skills = extract_skills_from_text(title, clean_desc)
                
            # Stipend
            job_d = item.get('jobDetail', {})
            stipend = "Competitive"
            if job_d:
                paid_unpaid = job_d.get('paid_unpaid', '').lower()
                if paid_unpaid == 'unpaid':
                    stipend = "Unpaid"
                elif paid_unpaid == 'paid':
                    min_sal = job_d.get('min_salary')
                    max_sal = job_d.get('max_salary')
                    if min_sal and max_sal:
                        if min_sal == max_sal:
                            stipend = f"₹{min_sal:,} / month"
                        else:
                            stipend = f"₹{min_sal:,} - ₹{max_sal:,} / month"
                    elif min_sal:
                        stipend = f"₹{min_sal:,} / month"
                    else:
                        stipend = "Paid"
            
            # Apply link
            apply_link = f"https://unstop.com/{item['public_url']}"
            
            # Location
            loc_list = item.get('locations', [])
            loc_strs = []
            for l in loc_list:
                parts = [l.get('city'), l.get('state')]
                loc_strs.append(", ".join(filter(None, parts)))
            location = "; ".join(filter(None, loc_strs)) if loc_strs else "India"
            
            # Type (Remote / Hybrid / On-site)
            job_type = "On-site"
            work_type = job_d.get('type', '').lower() if job_d else ''
            region = item.get('region', '').lower()
            if work_type == 'wfh' or region == 'online':
                job_type = "Remote"
                location = "Remote"
            elif work_type == 'hybrid':
                job_type = "Hybrid"
            elif work_type == 'in_office':
                job_type = "On-site"
                
            # Date posted
            posted_raw = item.get('approved_date') or item.get('updated_at') or ''
            posted_at = parse_date_to_iso(posted_raw[:10] if posted_raw else '')
            
            jobs.append({
                "id": job_id,
                "title": title,
                "company": company,
                "description": clean_desc,
                "source": "unstop",
                "skillsRequired": skills[:5],
                "stipend": stipend,
                "applyLink": apply_link,
                "location": location,
                "type": job_type,
                "category": get_category_from_title(title),
                "postedAt": posted_at
            })
        return jobs
    except Exception as e:
        print(f"Error scraping Unstop: {e}")
        return []

def get_linkedin_jobs():
    jobs = fetch_linkedin_jobs_dynamic()
    if not jobs:
        # Fallback to local curated list if GitHub is offline
        jobs = [j for j in CURATED_JOBS if j["source"] == "linkedin"]
    return jobs

# ============================================================================
# AGGREGATE & FILTER ALL JOBS
# ============================================================================
def get_all_jobs(query="", source="all", category="all", type_filter="all", page=1):
    raw_listings = []
    
    # 1. Fetch live scraped Internshala jobs if applicable
    if source == "all" or source == "internshala":
        raw_listings.extend(scrape_internshala(search_query=query, page=page))
        
    # 2. Fetch live parsed LinkedIn jobs if applicable
    if source == "all" or source == "linkedin":
        li_jobs = scrape_linkedin(search_query=query, category=category, page=page)
        if not li_jobs:
            print("Real-time LinkedIn scrape returned 0 results or failed, falling back to curated/GitHub list.")
            li_jobs = get_linkedin_jobs()
        raw_listings.extend(li_jobs)
        
    # 3. Get live Unstop jobs if applicable
    if source == "all" or source == "unstop":
        un_jobs = scrape_unstop(search_query=query, category=category, page=page)
        if not un_jobs:
            print("Real-time Unstop scrape returned 0 results or failed, falling back to curated list.")
            un_jobs = [j for j in CURATED_JOBS if j["source"] == "unstop"]
        raw_listings.extend(un_jobs)
        
    # Apply filters to listings
    filtered_listings = []
    for job in raw_listings:
        # Source filter (safety check)
        if source != "all" and job["source"] != source:
            continue
            
        # Category filter
        if category != "all" and job["category"].lower() != category.lower():
            continue
            
        # Job Type filter
        if type_filter != "all" and job["type"].lower() != type_filter.lower():
            continue
            
        # Search query filter
        if query:
            q = query.lower()
            match_title = q in job["title"].lower()
            match_company = q in job["company"].lower()
            match_desc = q in job["description"].lower()
            match_skills = any(q in sk.lower() for sk in job["skillsRequired"])
            if not (match_title or match_company or match_desc or match_skills):
                continue
                
        filtered_listings.append(job)
        
    # Sort listings date wise (newest first)
    filtered_listings.sort(key=lambda x: x.get('postedAt', ''), reverse=True)
    
    return filtered_listings
