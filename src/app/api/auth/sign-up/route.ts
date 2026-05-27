import { NextResponse } from 'next/server';
import { prisma } from '@/lib/config/prisma';
import { hashPassword } from '@/lib/utils/password';
import { validateEmail, validatePassword } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, college, graduationYear } = body;

    // Validate request parameters
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!password || !validatePassword(password)) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (!college || !college.trim()) {
      return NextResponse.json({ error: 'College is required' }, { status: 400 });
    }
    
    const year = Number(graduationYear);
    if (isNaN(year) || year < new Date().getFullYear() - 5 || year > new Date().getFullYear() + 10) {
      return NextResponse.json({ error: 'Invalid graduation year' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email is already in use.' }, { status: 400 });
    }

    // Create password hash
    const passwordHash = hashPassword(password);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        college: college.trim(),
        graduationYear: year,
        skills: [],
      },
    });

    // Return created user (excluding password hash for security)
    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          college: user.college,
          graduationYear: user.graduationYear,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Sign up API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
