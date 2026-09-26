import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const correctEmail = process.env.ADMIN_EMAIL;
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctEmail || !correctPassword) {
      console.error("ADMIN_EMAIL or ADMIN_PASSWORD not set in environment variables");
      return NextResponse.json(
        { error: 'Server misconfiguration.' },
        { status: 500 }
      );
    }

    if (email === correctEmail && password === correctPassword) {
      // Success! In a real app we'd set an encrypted cookie here.
      return NextResponse.json({ message: 'Admin authenticated successfully' });
    } else {
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
