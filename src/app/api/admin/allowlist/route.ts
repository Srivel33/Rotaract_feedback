import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const emails = await prisma.allowedEmail.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ emails });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch allowlist' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const newEmail = await prisma.allowedEmail.create({
      data: { email }
    });

    return NextResponse.json({ message: 'Email added to allowlist', newEmail });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email is already in the allowlist' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to add email' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    await prisma.allowedEmail.delete({
      where: { email }
    });

    return NextResponse.json({ message: 'Email removed successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove email' }, { status: 500 });
  }
}
