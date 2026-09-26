import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, email } = body;

    if (!name || !role || !email) {
      return NextResponse.json(
        { error: 'Name, role, and email are required.' },
        { status: 400 }
      );
    }

    // 1. Check if the email exists in the AllowedEmail table
    const isAllowed = await prisma.allowedEmail.findUnique({
      where: { email }
    });

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'This email is not authorized. Please ask the Admin to grant you access.' },
        { status: 401 }
      );
    }

    // 2. Upsert the user into the database
    // This updates their name and role if they changed it, or creates them if they are new.
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, role },
      create: { name, email, role }
    });

    // 3. In a real production app, we would set a secure HttpOnly cookie here to maintain the session.
    // For this demonstration, we'll return the user object to store in local state/storage.
    
    return NextResponse.json({
      message: 'Login successful!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login.' },
      { status: 500 }
    );
  }
}
