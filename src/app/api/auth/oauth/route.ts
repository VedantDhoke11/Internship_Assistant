import { NextResponse } from 'next/server';
import { prisma } from '@/lib/config/prisma';
import { hashPassword } from '@/lib/utils/password';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, college, graduationYear } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Find user in database
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // 2. If user does not exist, register them dynamically
    if (!user) {
      const dummyPasswordHash = hashPassword('oauth_mock_password_hash_123');
      user = await prisma.user.create({
        data: {
          name: name || 'OAuth User',
          email: email.toLowerCase().trim(),
          passwordHash: dummyPasswordHash,
          college: college || 'OAuth Academy',
          graduationYear: Number(graduationYear) || 2027,
          skills: [],
        },
      });
    }

    // 3. Check if user has uploaded a resume
    const resumeCount = await prisma.resume.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      message: 'OAuth sign-in successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        college: user.college,
        graduationYear: user.graduationYear,
        skills: user.skills,
        hasResume: resumeCount > 0,
      },
    });
  } catch (error) {
    console.error('OAuth sign-in route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
