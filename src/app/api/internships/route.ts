import { NextRequest, NextResponse } from 'next/server';
import { aggregateJobs, AggregatorFilter } from '@/services/jobs/aggregator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || undefined;
    const source = (searchParams.get('source') as 'linkedin' | 'internshala' | 'unstop' | 'all') || undefined;
    const category = searchParams.get('category') || undefined;
    const type = (searchParams.get('type') as 'Remote' | 'Hybrid' | 'On-site' | 'all') || undefined;

    const filters: AggregatorFilter = {
      query,
      source,
      category,
      type,
    };

    const listings = await aggregateJobs(filters);
    return NextResponse.json({ listings });
  } catch (error: unknown) {
    console.error('API /api/internships error:', error);
    return NextResponse.json(
      { error: 'Failed to aggregate internship listings.' },
      { status: 500 }
    );
  }
}
