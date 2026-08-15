import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/engine/session';
import { StructuredDefense } from '@/lib/engine/types';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = getSession(id);
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    const defense: StructuredDefense = await req.json();
    updateSession(id, { userDefense: defense, status: 'scoring' });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
