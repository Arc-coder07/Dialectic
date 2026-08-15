import { PipelineNode } from '@/lib/engine/pipeline';
import { GraphNode } from '@/lib/engine/types';

export const scoreNode: PipelineNode = {
  name: 'score',
  stage: 'scoring',
  async execute(session, emit) {
    // 1. Compute DecisionProfile deterministically (Simplified version)
    const supportScore = session.claims?.filter(c => c.status === 'supported').length || 0;
    const oppositionScore = session.claims?.filter(c => c.status === 'contradicted').length || 0;
    const total = (session.claims?.length || 1);
    
    const decisionProfile = {
      score: (supportScore - oppositionScore) / total,
      confidence: Math.min(1, (session.evidence?.length || 0) / 10),
      breakdown: {
        support: supportScore / total,
        opposition: oppositionScore / total,
        uncertainty: 1 - ((supportScore + oppositionScore) / total),
      }
    };

    // 2. Compute EpistemicAudit
    const epistemicAudit = {
      evidenceQuality: session.evidence?.reduce((acc, e) => acc + (e.qualityScore || 0), 0) / (session.evidence?.length || 1),
      logicalCoherence: 0.8, // Simplified
      diversityOfThought: (session.agents?.length || 0) / 3,
      blindspots: session.assumptions?.filter(a => a.status === 'untested').map(a => a.text) || [],
    };

    const scores = { decisionProfile, epistemicAudit };

    emit({
      type: 'score_computed',
      payload: scores,
      timestamp: new Date().toISOString()
    });

    emit({
      type: 'audit_complete',
      payload: epistemicAudit,
      timestamp: new Date().toISOString()
    });

    // 3. Build the argument graph
    const nodes: GraphNode[] = [];
    
    session.claims?.forEach(c => {
      nodes.push({ id: c.id, type: 'claim', label: c.text, data: c });
    });
    
    session.evidence?.forEach(e => {
      nodes.push({ id: e.id, type: 'evidence', label: e.sourceUrl, data: e });
    });
    
    session.arguments?.forEach(a => {
      nodes.push({ id: a.id, type: 'argument', label: a.toulmin?.claim || a.claim, data: a });
    });

    const graph = {
      nodes,
      edges: session.graph?.edges || [],
    };

    emit({
      type: 'graph_update',
      payload: graph,
      timestamp: new Date().toISOString()
    });

    return { scores, graph } as any;
  }
};
