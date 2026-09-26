import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    const responses = await prisma.response.findMany({
      where: eventId ? { eventId } : undefined,
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
