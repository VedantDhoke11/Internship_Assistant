import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch('http://localhost:5000/api/resume/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Next.js POST /api/resume/analyze Proxy Error:', error);
    return NextResponse.json(
      { error: 'Python Flask backend is offline. Please make sure the backend server is running.' },
      { status: 503 }
    );
  }
}
