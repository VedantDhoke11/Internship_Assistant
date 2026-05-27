import { JobListing } from './types';
import { fetchLinkedInJobs } from './linkedin';
import { fetchInternshalaJobs } from './internshala';
import { fetchUnstopJobs } from './unstop';

export interface AggregatorFilter {
  query?: string;
  source?: 'linkedin' | 'internshala' | 'unstop' | 'all';
  category?: string;
  type?: 'Remote' | 'Hybrid' | 'On-site' | 'all';
  location?: string;
}

export async function aggregateJobs(filters: AggregatorFilter = {}): Promise<JobListing[]> {
  const { query, source = 'all', category, type = 'all' } = filters;

  // Fetch jobs in parallel
  const fetches: Promise<JobListing[]>[] = [];

  if (source === 'all' || source === 'linkedin') {
    fetches.push(fetchLinkedInJobs(query));
  }
  if (source === 'all' || source === 'internshala') {
    fetches.push(fetchInternshalaJobs(query));
  }
  if (source === 'all' || source === 'unstop') {
    fetches.push(fetchUnstopJobs(query));
  }

  const results = await Promise.all(fetches);
  let aggregatedListings = results.flat();

  // Apply filters on the unified set
  if (category && category !== 'all') {
    const normCategory = category.toLowerCase();
    aggregatedListings = aggregatedListings.filter(
      (job) => job.category.toLowerCase() === normCategory
    );
  }

  if (type && type !== 'all') {
    const normType = type.toLowerCase();
    aggregatedListings = aggregatedListings.filter(
      (job) => job.type.toLowerCase() === normType
    );
  }

  // Sort by date (newest first)
  return aggregatedListings.sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
  );
}
