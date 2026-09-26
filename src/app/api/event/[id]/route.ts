import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await context.params;
    
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        questions: {
          orderBy: { id: 'asc' }
        }
      }
    });

    if (!event || event.isArchived) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch event data' }, { status: 500 });
  }
}
