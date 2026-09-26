import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: { isArchived: false },
      orderBy: { date: 'desc' },
      include: {
        _count: {
          select: { responses: true }
        }
      }
    });
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, location, date, questions } = await request.json();

    if (!title || !location || !date) {
      return NextResponse.json({ error: 'Title, location, and date are required' }, { status: 400 });
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        location,
        date: new Date(date),
        questions: {
          create: questions && questions.length > 0 ? questions.map((q: any) => {
            let parsedOptions = null;
            if (Array.isArray(q.options)) {
              parsedOptions = JSON.stringify(q.options.filter(o => o.trim() !== ''));
            } else if (typeof q.options === 'string' && q.options.trim() !== '') {
              const optsArray = q.options.split(',').map((o: string) => o.trim()).filter((o:string) => o);
              parsedOptions = JSON.stringify(optsArray);
            }
            
            return {
              text: q.text,
              type: q.type,
              options: parsedOptions,
              isRequired: q.isRequired !== undefined ? q.isRequired : true
            };
          }) : []
        }
      }
    });

    return NextResponse.json({ message: 'Event created successfully', event: newEvent });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: error.message || 'Failed to create event' }, { status: 500 });
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

    // Hard delete the event as requested by user
    await prisma.event.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Event permanently deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
