import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/config/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        applications: {
          include: {
            internship: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Sort by updated date (newest updates first)
    const sortedApplications = user.applications.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return NextResponse.json({ applications: sortedApplications });
  } catch (error: unknown) {
    console.error('GET /api/applications error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, internship: internshipData, status } = body;

    if (!userEmail || !internshipData || !status) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
    }

    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // 2. Resolve apply link (ensure it is unique and non-empty)
    let applyLink = internshipData.applyLink;
    if (!applyLink || !applyLink.trim()) {
      applyLink = `https://manual-application.local/${user.id}-${Date.now()}`;
    }

    // 3. Find or create internship
    let internship = await prisma.internship.findFirst({
      where: {
        title: internshipData.title,
        company: internshipData.company,
        applyLink: applyLink,
      },
    });

    if (!internship) {
      internship = await prisma.internship.create({
        data: {
          title: internshipData.title,
          company: internshipData.company,
          description: internshipData.description || '',
          source: internshipData.source || 'manual',
          skillsRequired: internshipData.skillsRequired || [],
          stipend: internshipData.stipend || '',
          applyLink: applyLink,
        },
      });
    }

    // 4. Find or create application
    let application = await prisma.application.findFirst({
      where: {
        userId: user.id,
        internshipId: internship.id,
      },
    });

    if (application) {
      application = await prisma.application.update({
        where: { id: application.id },
        data: { status },
      });
    } else {
      application = await prisma.application.create({
        data: {
          userId: user.id,
          internshipId: internship.id,
          status,
        },
      });
    }

    return NextResponse.json({ success: true, application });
  } catch (error: unknown) {
    console.error('POST /api/applications error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, status, notes, resumeUsed } = body;

    if (!applicationId) {
      return NextResponse.json({ error: 'applicationId is required.' }, { status: 400 });
    }

    // Check if application exists
    const existing = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    }

    // Update data
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
        ...(resumeUsed !== undefined && { resumeUsed }),
      },
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error: unknown) {
    console.error('PATCH /api/applications error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id parameter is required.' }, { status: 400 });
    }

    const existing = await prisma.application.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    }

    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Application deleted successfully.' });
  } catch (error: unknown) {
    console.error('DELETE /api/applications error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
