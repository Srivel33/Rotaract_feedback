import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id;
    const body = await request.json();
    const { email, rating, emoji, feedback } = body;

    if (!email) {
      return NextResponse.json({ error: 'User email is required' }, { status: 401 });
    }

    // Check if user exists (they must have logged in and been on allowlist)
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized user' }, { status: 403 });
    }

    // Check if event exists and is not locked/archived
    let event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { questions: true }
    });

    if (!event || event.isArchived) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.isLocked) {
      return NextResponse.json({ error: 'Feedback for this event is currently locked' }, { status: 403 });
    }

    // Ensure questions exist (JIT creation for legacy events)
    if (event.questions.length === 0) {
      await prisma.question.createMany({
        data: [
          { eventId, text: "How was your overall experience?", type: "RATING" },
          { eventId, text: "How would you rate the organization?", type: "EMOJI" },
          { eventId, text: "Any highlights or suggestions?", type: "TEXT" }
        ]
      });
      // reload event with questions
      event = await prisma.event.findUnique({ where: { id: eventId }, include: { questions: true } });
    }

    // Check if response already exists (to prevent duplicates)
    const existingResponse = await prisma.response.findUnique({
      where: {
        eventId_userId: { eventId, userId: user.id }
      }
    });

    if (existingResponse) {
      return NextResponse.json({ error: 'You have already submitted feedback for this event' }, { status: 409 });
    }

    // Map questions to answers
    const ratingQ = event!.questions.find(q => q.type === 'RATING');
    const emojiQ = event!.questions.find(q => q.type === 'EMOJI');
    const textQ = event!.questions.find(q => q.type === 'TEXT');

    const answersData = [];
    if (ratingQ && rating) answersData.push({ questionId: ratingQ.id, value: rating.toString() });
    if (emojiQ && emoji) answersData.push({ questionId: emojiQ.id, value: emoji });
    if (textQ && feedback) answersData.push({ questionId: textQ.id, value: feedback });

    // Create the Response and Answers in a transaction
    const newResponse = await prisma.response.create({
      data: {
        eventId,
        userId: user.id,
        answers: {
          create: answersData
        }
      }
    });

    return NextResponse.json({ message: 'Feedback submitted successfully!', response: newResponse });

  } catch (error) {
    console.error('Feedback submit error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
