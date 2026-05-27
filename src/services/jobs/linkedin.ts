import { JobListing } from './types';

// ============================================================================
// PRODUCTION INTEGRATION TEMPLATE (For Developer Reference)
// ============================================================================
// To connect to a live LinkedIn Job Feed, you have two primary production options:
//
// OPTION A: LinkedIn Talent Solutions API (Official)
// - Required: Formally apply for LinkedIn Partner status and obtain client credentials.
// - Reference: https://learn.microsoft.com/en-us/linkedin/talent/
//
// OPTION B: Third-Party Job Search API (RapidAPI - e.g., JSearch API)
// - Recommended for projects: Low cost, structured JSON payload, handles scraping/captchas.
// - Code Template:
//
// import axios from 'axios';
// export async function fetchLinkedInJobsLive(query: string = 'Software Intern'): Promise<JobListing[]> {
//   try {
//     const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
//       params: { query: `${query} in India`, page: '1', num_pages: '1' },
//       headers: {
//         'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
//         'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
//       }
//     });
//     return response.data.data.map((job: any) => ({
//       id: `linkedin-${job.job_id}`,
//       title: job.job_title,
//       company: job.employer_name,
//       description: job.job_description,
//       source: 'linkedin',
//       skillsRequired: job.job_required_skills || ['Software Engineering', 'Problem Solving'],
//       stipend: 'Negotiable / Unspecified',
//       applyLink: job.job_apply_link,
//       location: job.job_city ? `${job.job_city}, ${job.job_country}` : 'Remote',
//       type: job.job_employment_type === 'CONTRACTOR' ? 'Hybrid' : (job.job_is_remote ? 'Remote' : 'On-site'),
//       category: 'Software Development',
//       postedAt: new Date(job.job_posted_at_datetime_utc || Date.now()).toLocaleDateString()
//     }));
//   } catch (error) {
//     console.error('LinkedIn Live API Error:', error);
//     return [];
//   }
// }
// ============================================================================

// High-fidelity active mock listings representing realistic LinkedIn Internship postings
const MOCK_LINKEDIN_JOBS: JobListing[] = [
  {
    id: 'li-1',
    title: 'Software Engineering Intern (Backend)',
    company: 'Atlassian',
    description: 'Join the Jira Cloud Platform team to design, build, and deploy high-performance microservices. You will work with Java, Kotlin, Spring Boot, and AWS, participating in code reviews and architecture design sessions.',
    source: 'linkedin',
    skillsRequired: ['Java', 'Spring Boot', 'AWS', 'REST APIs', 'SQL'],
    stipend: '₹75,000 / month',
    applyLink: 'https://www.atlassian.com/careers',
    location: 'Bengaluru, KA',
    type: 'Hybrid',
    category: 'Software Development',
    postedAt: '2026-05-24'
  },
  {
    id: 'li-2',
    title: 'AI & Data Science Intern',
    company: 'Razorpay',
    description: 'Work with the risk and fraud analytics team to train anomaly detection models. You will clean transaction log datasets, write clean Python scripts using PyTorch and Scikit-Learn, and build vector search pipelines.',
    source: 'linkedin',
    skillsRequired: ['Python', 'PyTorch', 'SQL', 'Scikit-Learn', 'Pandas'],
    stipend: '₹60,000 / month',
    applyLink: 'https://razorpay.com/jobs',
    location: 'Remote',
    type: 'Remote',
    category: 'Data Science & Analytics',
    postedAt: '2026-05-23'
  },
  {
    id: 'li-3',
    title: 'Associate Product Manager Intern',
    company: 'Google',
    description: 'Design features that shape how millions of students use cloud workspaces. You will conduct user research, coordinate across design and engineering teams, draft PRDs (Product Requirement Documents), and define success metrics.',
    source: 'linkedin',
    skillsRequired: ['Product Strategy', 'SQL', 'Wireframing', 'Market Research', 'Data Analysis'],
    stipend: '₹1,00,000 / month',
    applyLink: 'https://careers.google.com',
    location: 'Hyderabad, TS',
    type: 'On-site',
    category: 'Product Management',
    postedAt: '2026-05-25'
  },
  {
    id: 'li-4',
    title: 'Frontend Engineering Intern (React)',
    company: 'Zepto',
    description: 'Help build the next-generation logistics and tracking dashboard. You will write highly responsive typescript react components, optimize CSS bundles, and utilize Tailwind CSS and shadcn/ui components.',
    source: 'linkedin',
    skillsRequired: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux Toolkit'],
    stipend: '₹50,000 / month',
    applyLink: 'https://www.zeptonow.com/careers',
    location: 'Mumbai, MH',
    type: 'Hybrid',
    category: 'Software Development',
    postedAt: '2026-05-22'
  },
  {
    id: 'li-5',
    title: 'UX/UI Designer Intern',
    company: 'CRED',
    description: 'Collaborate with the design system group to research and design premium, dark-mode-first user interfaces. You will build high-fidelity interactive prototypes in Figma and carry out usability testing sessions.',
    source: 'linkedin',
    skillsRequired: ['Figma', 'Prototyping', 'User Research', 'Typography', 'Visual Design'],
    stipend: '₹65,000 / month',
    applyLink: 'https://cred.club/careers',
    location: 'Bengaluru, KA',
    type: 'On-site',
    category: 'Design & Creative',
    postedAt: '2026-05-21'
  }
];

export async function fetchLinkedInJobs(searchQuery?: string): Promise<JobListing[]> {
  // Simulate network latency (250ms)
  await new Promise((resolve) => setTimeout(resolve, 250));

  if (!searchQuery) {
    return MOCK_LINKEDIN_JOBS;
  }

  const normalizedQuery = searchQuery.toLowerCase();
  return MOCK_LINKEDIN_JOBS.filter(
    (job) =>
      job.title.toLowerCase().includes(normalizedQuery) ||
      job.company.toLowerCase().includes(normalizedQuery) ||
      job.skillsRequired.some((skill) => skill.toLowerCase().includes(normalizedQuery)) ||
      job.category.toLowerCase().includes(normalizedQuery)
  );
}
