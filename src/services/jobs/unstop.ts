import { JobListing } from './types';

// ============================================================================
// PRODUCTION JSON INTERCEPTION TEMPLATE (For Developer Reference)
// ============================================================================
// Unstop maps listings dynamically using REST endpoints.
// To integrate live opportunities, you can fetch directly from their public APIs
// or intercept responses using Puppeteer:
//
// import puppeteer from 'puppeteer';
//
// export async function fetchUnstopOpportunitiesLive(): Promise<JobListing[]> {
//   try {
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();
//     const jobs: JobListing[] = [];
//
//     // Intercept fetch responses directly
//     page.on('response', async (response) => {
//       const url = response.url();
//       if (url.includes('api.unstop.com/public/opportunity/search')) {
//         try {
//           const json = await response.json();
//           const data = json.data?.data || [];
//           data.forEach((opp: any) => {
//             jobs.push({
//               id: `unstop-${opp.id}`,
//               title: opp.title,
//               company: opp.organisation?.name || 'Unstop Partner',
//               description: opp.description || 'Competition and Internship opportunity.',
//               source: 'unstop',
//               skillsRequired: opp.filters?.map((f: any) => f.name) || ['Coding', 'Analytics'],
//               stipend: opp.prizes_worth ? `Prize: ${opp.prizes_worth}` : 'Unspecified',
//               applyLink: `https://unstop.com/o/${opp.public_url || opp.id}`,
//               location: opp.venue || 'Online',
//               type: opp.venue?.toLowerCase().includes('online') ? 'Remote' : 'On-site',
//               category: 'Coding Competition',
//               postedAt: new Date(opp.created_at || Date.now()).toLocaleDateString()
//             });
//           });
//         } catch (e) {
//           // Handle parse error
//         }
//       }
//     });
//
//     await page.goto('https://unstop.com/internships', { waitUntil: 'networkidle2' });
//     await browser.close();
//     return jobs;
//   } catch (error) {
//     console.error('Unstop Live Fetch Error:', error);
//     return [];
//   }
// }
// ============================================================================

// High-fidelity active mock listings representing realistic Unstop Internship & Hackathon postings
const MOCK_UNSTOP_JOBS: JobListing[] = [
  {
    id: 'us-1',
    title: 'Technology Analyst & Operations Intern',
    company: 'Goldman Sachs',
    description: 'Goldman Sachs is hosting its Engineering Hiring Program on Unstop. Selected applicants join global tech divisions. Operations involve analyzing big data pipelines, managing service clusters, and optimizing query speeds.',
    source: 'unstop',
    skillsRequired: ['Data Structures', 'Algorithms', 'SQL', 'Python', 'System Design'],
    stipend: '₹80,000 / month',
    applyLink: 'https://unstop.com/internships',
    location: 'Bengaluru, KA',
    type: 'On-site',
    category: 'Software Development',
    postedAt: '2026-05-24'
  },
  {
    id: 'us-2',
    title: 'Amazon ML Summer School Opportunity',
    company: 'Amazon India',
    description: 'A prestigious machine learning curriculum program followed by interview shortlists for ML intern positions. Includes extensive lectures on Deep Learning, NLP, Computer Vision, and hands-on coding challenges.',
    source: 'unstop',
    skillsRequired: ['Machine Learning', 'Linear Algebra', 'Python', 'Probability', 'Algorithms'],
    stipend: '₹1,20,000 / month (Intern stipend)',
    applyLink: 'https://unstop.com/internships',
    location: 'Remote',
    type: 'Remote',
    category: 'Data Science & Analytics',
    postedAt: '2026-05-25'
  },
  {
    id: 'us-3',
    title: 'National Coding Hackathon & Internship Track',
    company: 'TCS Group',
    description: 'National Level Hackathon hosted on Unstop. Top performers receive cash rewards and direct interviews for Digital & Ninja software engineering internship profiles.',
    source: 'unstop',
    skillsRequired: ['C++', 'Java', 'Python', 'Problem Solving', 'Data Structures'],
    stipend: '₹40,000 / month (Intern stipend)',
    applyLink: 'https://unstop.com/internships',
    location: 'Online / Mumbai',
    type: 'Hybrid',
    category: 'Software Development',
    postedAt: '2026-05-23'
  },
  {
    id: 'us-4',
    title: 'Product Design Hackathon (UI/UX Case Study)',
    company: 'Flipkart India',
    description: ' Flipkart Design Challenge on Unstop. Propose a dark-mode checkout experience that increases conversion by 5%. Finalists present to design heads and receive direct internship offers.',
    source: 'unstop',
    skillsRequired: ['Figma', 'Product UX', 'Wireframing', 'User Flows', 'A/B Testing'],
    stipend: '₹45,000 / month (Intern stipend)',
    applyLink: 'https://unstop.com/internships',
    location: 'Online',
    type: 'Remote',
    category: 'Design & Creative',
    postedAt: '2026-05-22'
  },
  {
    id: 'us-5',
    title: 'Consulting & Strategy Intern Program',
    company: 'McKinsey & Company',
    description: 'Case study solving and business analysis hackathon on Unstop. Candidates present strategy decks targeting operational cost minimization for SaaS frameworks. Top teams receive direct internship offers.',
    source: 'unstop',
    skillsRequired: ['Business Analysis', 'Market Strategy', 'Financial Modeling', 'MS PowerPoint', 'Data Interpretation'],
    stipend: '₹90,000 / month (Intern stipend)',
    applyLink: 'https://unstop.com/internships',
    location: 'Gurugram, HR',
    type: 'On-site',
    category: 'Business Development',
    postedAt: '2026-05-20'
  }
];

export async function fetchUnstopJobs(searchQuery?: string): Promise<JobListing[]> {
  // Simulate network latency (250ms)
  await new Promise((resolve) => setTimeout(resolve, 250));

  if (!searchQuery) {
    return MOCK_UNSTOP_JOBS;
  }

  const normalizedQuery = searchQuery.toLowerCase();
  return MOCK_UNSTOP_JOBS.filter(
    (job) =>
      job.title.toLowerCase().includes(normalizedQuery) ||
      job.company.toLowerCase().includes(normalizedQuery) ||
      job.skillsRequired.some((skill) => skill.toLowerCase().includes(normalizedQuery)) ||
      job.category.toLowerCase().includes(normalizedQuery)
  );
}
