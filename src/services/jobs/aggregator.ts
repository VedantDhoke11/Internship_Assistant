import { JobListing } from './types';
import { fetchLiveJobsFromAPIs } from './liveFetcher';

export interface AggregatorFilter {
  query?: string;
  source?: 'linkedin' | 'internshala' | 'unstop' | 'all';
  category?: string;
  type?: 'Remote' | 'Hybrid' | 'On-site' | 'all';
  location?: string;
  page?: number;
}

export async function aggregateJobs(filters: AggregatorFilter = {}): Promise<JobListing[]> {
  const { query, source = 'all', category, type = 'all', page = 1 } = filters;

  // Fetch ALL listings from the unified live fetcher (single call, not 3x)
  let listings = await fetchLiveJobsFromAPIs(query || '', page);

  // Deduplicate by ID to prevent duplicate React keys
  const seen = new Set<string>();
  listings = listings.filter((job) => {
    if (seen.has(job.id)) return false;
    seen.add(job.id);
    return true;
  });

  // Apply source filter
  if (source && source !== 'all') {
    listings = listings.filter((job) => job.source === source);
  }

  // Apply category filter
  if (category && category !== 'all') {
    const normCategory = category.toLowerCase();
    listings = listings.filter(
      (job) => job.category.toLowerCase() === normCategory
    );
  }

  // Apply type filter
  if (type && type !== 'all') {
    const normType = type.toLowerCase();
    listings = listings.filter(
      (job) => job.type.toLowerCase() === normType
    );
  }

  // Sort by date (newest first)
  return listings.sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
  );
}
