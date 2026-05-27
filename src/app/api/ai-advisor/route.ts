import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const response = await fetch(`http://localhost:5000/api/ai-advisor?userId=${userId}`, {
      method: 'GET',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Next.js GET /api/ai-advisor Proxy Error:', error);
    return NextResponse.json(
      { error: 'Python Flask backend is offline. Please make sure the backend server is running.' },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch('http://localhost:5000/api/ai-advisor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Next.js POST /api/ai-advisor Proxy Error:', error);
    return NextResponse.json(
      { error: 'Python Flask backend is offline. Please make sure the backend server is running.' },
      { status: 503 }
    );
  }
}
