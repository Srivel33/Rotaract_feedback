import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: { isArchived: false },
      orderBy: { date: 'desc' }
    });
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, location, date } = await request.json();

    if (!title || !location || !date) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        location,
        date: new Date(date)
      }
    });

    return NextResponse.json({ message: 'Event created successfully', event: newEvent });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, title, location, date, isLocked, isArchived } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        location,
        ...(date && { date: new Date(date) }),
        isLocked,
        isArchived
      }
    });

    return NextResponse.json({ message: 'Event updated', event: updatedEvent });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Soft delete to keep history
    await prisma.event.update({
      where: { id },
      data: { isArchived: true }
    });

    return NextResponse.json({ message: 'Event deleted (archived) successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
