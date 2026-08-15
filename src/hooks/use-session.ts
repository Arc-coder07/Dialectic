import { useState, useCallback, useRef } from 'react';
import { Session, SessionEvent, Claim, Assumption, Evidence, Agent, ToulminArgument, ArgumentNode, ArgumentEdge, DecisionProfile, EpistemicAudit, Experiment, ExecutionTrace } from '@/lib/engine/types';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const startSession = useCallback(async (proposition: string, context?: string, mode: string = 'default') => {
    setLoading(true);
    setError(null);
    setSession(null);

    try {
      // 1. Create the session
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposition, context, mode }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create session: ${await res.text()}`);
      }

      const { sessionId } = await res.json();

      // 2. Connect to SSE stream
      const eventSource = new EventSource(`/api/session/${sessionId}/stream`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (e) => {
        try {
          const event: SessionEvent = JSON.parse(e.data);
          
          setSession((prev) => {
            if (!prev) {
              // Initialize empty session if it's the first event
              return {
                id: sessionId,
                proposition,
                context,
                mode,
                status: 'idle',
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
            }

            // Deep clone to avoid mutation issues in React strict mode
            const current = { ...prev };

            switch (event.type) {
              case 'stage_start':
              case 'stage_complete':
                current.status = event.stage as any;
                break;
              case 'claims_extracted':
                current.claims = event.claims;
                break;
              case 'assumptions_extracted':
                current.assumptions = event.assumptions;
                break;
              case 'evidence_found':
                current.evidence = [...current.evidence, event.evidence];
                break;
              case 'agent_recruited':
                current.agents = [...current.agents, event.agent];
                break;
              case 'argument_created':
                current.arguments = [...current.arguments, event.argument];
                break;
              case 'conflict_detected':
                // Update claim status based on conflict
                const claim = current.claims.find(c => c.id === event.claimId);
                if (claim) claim.status = 'contradicted';
                break;
              case 'steelman_complete':
                current.steelman = event.steelman;
                break;
              case 'score_computed':
                if (event.scores) current.scores = event.scores;
                else if (event.payload?.decisionProfile) current.scores = event.payload.decisionProfile; // Fallback for previous subagent shape
                break;
              case 'audit_complete':
                if (event.audit) current.audit = event.audit;
                else if (event.payload) current.audit = event.payload; // Fallback
                break;
              case 'experiments_generated':
                if (event.experiments) current.experiments = event.experiments;
                else if (event.payload) current.experiments = event.payload; // Fallback
                break;
              case 'graph_update':
                if (event.nodes && event.edges) {
                  current.graph = { nodes: event.nodes, edges: event.edges };
                } else if (event.payload) {
                  current.graph = event.payload; // Fallback
                }
                break;
              case 'verdict':
                if (event.verdict) current.verdict = event.verdict;
                else if (event.payload) current.verdict = event.payload; // Fallback
                break;
              case 'error':
                setError(`Error in ${event.stage}: ${event.message}`);
                break;
              case 'complete':
                current.status = 'complete';
                eventSource.close();
                setLoading(false);
                break;
            }

            current.updatedAt = new Date().toISOString();
            return current;
          });
        } catch (err) {
          console.error('Error parsing SSE message:', err);
        }
      };

      eventSource.onerror = () => {
        console.error('SSE connection error');
        setError('Connection to session stream lost.');
        eventSource.close();
        setLoading(false);
      };

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const stopSession = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setLoading(false);
    }
  }, []);

  return { session, loading, error, startSession, stopSession };
}
