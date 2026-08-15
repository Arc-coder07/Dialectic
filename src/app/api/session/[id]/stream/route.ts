import { NextRequest } from 'next/server';
import { getSession } from '@/lib/engine/session';
import { createDialecticPipeline } from '@/lib/engine/pipeline';
import { createEventEmitter } from '@/lib/engine/events';
import { initializeTools } from '@/lib/tools/init';

export const maxDuration = 120; // Allow long-running analysis

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = getSession(id);
  
  if (!session) {
    return new Response('Session not found', { status: 404 });
  }
  
  initializeTools();
  
  const { stream, emit } = createEventEmitter();
  const pipeline = createDialecticPipeline();
  
  // Run pipeline in background (don't await)
  pipeline.run(session, emit).catch(err => {
    emit({ type: 'error', stage: 'pipeline', message: err.message || 'Unknown error', retryable: false });
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
