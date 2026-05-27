import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const source = searchParams.get('source') || 'all';
    const category = searchParams.get('category') || 'all';
    const type = searchParams.get('type') || 'all';
    const page = searchParams.get('page') || '1';

    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (source) params.append('source', source);
    if (category) params.append('category', category);
    if (type) params.append('type', type);
    if (page) params.append('page', page);

    const response = await fetch(`http://localhost:5000/api/internships?${params.toString()}`);
    
    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Backend error: ${errText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('API /api/internships proxy error:', error);
    return NextResponse.json(
      { error: 'Python Flask backend is offline. Please make sure the backend server is running.' },
      { status: 503 }
    );
  }
}
