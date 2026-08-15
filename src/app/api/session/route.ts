import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/engine/session';

export async function POST(req: NextRequest) {
  try {
    const { proposition, context, mode } = await req.json();
    
    if (!proposition?.trim()) {
      return NextResponse.json({ error: 'Proposition is required' }, { status: 400 });
    }
    
    const session = createSession(proposition.trim(), context, mode);
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
