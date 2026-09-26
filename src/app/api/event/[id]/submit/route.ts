import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await context.params;
    const body = await request.json();
    const { email, answers } = body; // answers is { questionId: string, value: string }[]

    if (!email) {
      return NextResponse.json({ error: 'User email is required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized user' }, { status: 403 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event || event.isArchived) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.isLocked) {
      return NextResponse.json({ error: 'Feedback for this event is currently locked' }, { status: 403 });
    }

    const existingResponse = await prisma.response.findUnique({
      where: {
        eventId_userId: { eventId, userId: user.id }
      }
    });

    if (existingResponse) {
      return NextResponse.json({ error: 'You have already submitted feedback for this event' }, { status: 409 });
    }

    const newResponse = await prisma.response.create({
      data: {
        eventId,
        userId: user.id,
        answers: {
          create: answers.map((a: { questionId: string; value: string }) => ({
            questionId: a.questionId,
            value: a.value
          }))
        }
      }
    });

    return NextResponse.json({ message: 'Feedback submitted successfully!', response: newResponse });

  } catch (error) {
    console.error('Feedback submit error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
