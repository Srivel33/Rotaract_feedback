import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        responses: {
          select: { eventId: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const completedEventIds = new Set(user.responses.map(r => r.eventId));

    const events = await prisma.event.findMany({
      where: { 
        isArchived: false,
        isLocked: false
      },
      orderBy: { date: 'desc' }
    });

    const eventsWithStatus = events.map(event => ({
      id: event.id,
      title: event.title,
      location: event.location,
      date: event.date,
      isCompleted: completedEventIds.has(event.id)
    }));

    return NextResponse.json({ events: eventsWithStatus });
  } catch (error) {
    console.error('Error fetching user events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
