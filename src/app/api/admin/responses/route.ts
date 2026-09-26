import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const responses = await prisma.response.findMany({
      include: {
        user: true,
        event: true,
        answers: {
          include: {
            question: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ responses });
  } catch (error) {
    console.error("Fetch responses error:", error);
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
  }
}
