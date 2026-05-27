export interface JobListing {
  id: string;
  title: string;
  company: string;
  description: string;
  source: 'linkedin' | 'internshala' | 'unstop';
  skillsRequired: string[];
  stipend?: string;
  applyLink: string;
  location: string;
  type: 'Remote' | 'Hybrid' | 'On-site';
  category: string;
  postedAt: string;
  /** The actual origin API that this listing was fetched from */
  originApi?: 'arbeitnow' | 'himalayas' | 'greenhouse';
}
