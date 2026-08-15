import { Session, SessionStatus } from './types';
import { v4 as uuidv4 } from 'uuid';

// In-memory session store (v1.0 — will be replaced by SQLite in v1.1)
const sessions = new Map<string, Session>();

// Create a new session from a proposition
export function createSession(proposition: string, context?: string, mode?: string): Session {
  const session: Session = {
    id: uuidv4(),
    status: 'idle',
    proposition,
    context,
    mode: mode || 'default',
    steelman: '',
    claims: [],
    assumptions: [],
    evidence: [],
    experiments: [],
    agents: [],
    arguments: [],
    graph: { nodes: [], edges: [] },
    scores: null,
    audit: null,
    trace: { events: [], totalDuration: 0, totalTokens: 0, totalCost: 0, totalLlmCalls: 0, totalToolCalls: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    verdict: '',
  };
  
  sessions.set(session.id, session);
  return session;
}

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

export function updateSession(id: string, updates: Partial<Session>): Session {
  const session = sessions.get(id);
  if (!session) {
    throw new Error(`Session with id ${id} not found`);
  }
  
  const updated = {
    ...session,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  sessions.set(id, updated);
  return updated;
}

export function deleteSession(id: string): void {
  sessions.delete(id);
}
