import { JobListing } from './types';
import { fetchLiveJobsFromAPIs } from './liveFetcher';

// ============================================================================
// PRODUCTION HTML SCRAPING TEMPLATE (For Developer Reference)
// ============================================================================
// Internshala doesn't offer any open REST APIs. To extract listings dynamically,
// developers write server-side web scrapers.
// Below is a code blueprint using Axios and Cheerio (an HTML parser):
//
// import axios from 'axios';
// import * as cheerio from 'cheerio';
//
// export async function fetchInternshalaJobsLive(keyword: string = ''): Promise<JobListing[]> {
//   try {
//     // Construct matching search URL
//     const url = `https://internshala.com/internships/work-from-home-${keyword}-internships`;
//     const { data } = await axios.get(url, {
//       headers: {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
//       }
//     });
//     const $ = cheerio.load(data);
//     const jobs: JobListing[] = [];
//
//     $('.internship_meta').each((i, element) => {
//       const title = $(element).find('.profile').text().trim();
//       const company = $(element).find('.company_name').text().trim();
//       const location = $(element).find('.location_link').text().trim();
//       const stipend = $(element).find('.stipend').text().trim();
//       const href = $(element).find('.view_detail_button').attr('href');
//
//       jobs.push({
//         id: `internshala-${i}-${Date.now()}`,
//         title,
//         company,
//         description: `Dynamic internship vacancy fetched from Internshala. Location: ${location}. Stipend: ${stipend}.`,
//         source: 'internshala',
//         skillsRequired: ['Web Development', 'Javascript', 'Communication'],
//         stipend,
//         applyLink: `https://internshala.com${href}`,
//         location: location || 'Remote',
//         type: location.toLowerCase().includes('home') ? 'Remote' : 'On-site',
//         category: 'Software Development',
//         postedAt: new Date().toLocaleDateString()
//       });
//     });
//     return jobs;
//   } catch (error) {
//     console.error('Internshala Scraping Error:', error);
//     return [];
//   }
// }
// ============================================================================

// High-fidelity active mock listings representing realistic Internshala Internship postings
const MOCK_INTERNSHALA_JOBS: JobListing[] = [
  {
    id: 'is-1',
    title: 'Full Stack Web Development Intern',
    company: 'NextGen Solutions',
    description: 'We are seeking a Full Stack developer to build responsive SaaS platforms. You will work directly with Node.js, Express, and Next.js. You should understand RESTful principles and modern styling with CSS framework tools.',
    source: 'internshala',
    skillsRequired: ['Next.js', 'Node.js', 'Express.js', 'PostgreSQL', 'Tailwind CSS'],
    stipend: '₹20,000 / month',
    applyLink: 'https://internshala.com/internships',
    location: 'Remote (Work from Home)',
    type: 'Remote',
    category: 'Software Development',
    postedAt: '2026-05-24'
  },
  {
    id: 'is-2',
    title: 'Mobile App Development Intern (Flutter)',
    company: 'InnoTech Mobile Labs',
    description: 'Looking for a passionate Flutter intern to support our cross-platform consumer apps. You will build layouts, integrate native platform channels, structure states using Bloc/Provider, and implement push notifications.',
    source: 'internshala',
    skillsRequired: ['Flutter', 'Dart', 'Firebase', 'State Management', 'Git'],
    stipend: '₹18,000 / month',
    applyLink: 'https://internshala.com/internships',
    location: 'Pune, MH',
    type: 'On-site',
    category: 'Software Development',
    postedAt: '2026-05-23'
  },
  {
    id: 'is-3',
    title: 'Digital Marketing & Social Media Intern',
    company: 'VibeMedia Agency',
    description: 'Help manage search engine marketing and brand development strategies. You will design creative content outlines, coordinate SEO optimization keywords, audit traffic logs, and track campaign conversions.',
    source: 'internshala',
    skillsRequired: ['SEO', 'Content Strategy', 'Google Analytics', 'Social Media Marketing', 'Canva'],
    stipend: '₹12,000 / month',
    applyLink: 'https://internshala.com/internships',
    location: 'Remote (Work from Home)',
    type: 'Remote',
    category: 'Marketing',
    postedAt: '2026-05-25'
  },
  {
    id: 'is-4',
    title: 'Graphic Design Intern',
    company: 'Deco Studio',
    description: 'Design promotional banners, vector graphics, and brand design assets. You will coordinate with content teams to translate technical descriptions into beautiful, modern high-fidelity visual banners.',
    source: 'internshala',
    skillsRequired: ['Adobe Photoshop', 'Adobe Illustrator', 'Typography', 'Branding', 'Figma'],
    stipend: '₹15,000 / month',
    applyLink: 'https://internshala.com/internships',
    location: 'Delhi, DL',
    type: 'Hybrid',
    category: 'Design & Creative',
    postedAt: '2026-05-22'
  },
  {
    id: 'is-5',
    title: 'Business Development Intern (Sales)',
    company: 'EdTech Partners',
    description: 'Identify customer targets, handle client acquisition campaigns, and schedule product demonstrations. You will work on market analysis logs, compile response spreadsheets, and participate in daily lead reviews.',
    source: 'internshala',
    skillsRequired: ['Lead Generation', 'Client Communication', 'MS Excel', 'Market Research', 'Salesforce'],
    stipend: '₹10,000 + Incentives',
    applyLink: 'https://internshala.com/internships',
    location: 'Bengaluru, KA',
    type: 'On-site',
    category: 'Business Development',
    postedAt: '2026-05-20'
  }
];

export async function fetchInternshalaJobs(searchQuery?: string, page: number = 1): Promise<JobListing[]> {
  try {
    const liveJobs = await fetchLiveJobsFromAPIs(searchQuery || '', page);
    const filtered = liveJobs.filter((job) => job.source === 'internshala');
    if (filtered.length > 0) {
      return filtered;
    }
  } catch (e) {
    console.error('Internshala live fetch failed, falling back to mock:', e);
  }

  // Fallback to mock
  if (!searchQuery) {
    return MOCK_INTERNSHALA_JOBS;
  }

  const normalizedQuery = searchQuery.toLowerCase();
  return MOCK_INTERNSHALA_JOBS.filter(
    (job) =>
      job.title.toLowerCase().includes(normalizedQuery) ||
      job.company.toLowerCase().includes(normalizedQuery) ||
      job.skillsRequired.some((skill) => skill.toLowerCase().includes(normalizedQuery)) ||
      job.category.toLowerCase().includes(normalizedQuery)
  );
}
