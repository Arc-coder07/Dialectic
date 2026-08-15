import { Session, SessionEvent, SessionStatus } from './types';
import { decomposeNode } from '@/lib/nodes/decompose';
import { researchNode } from '@/lib/nodes/research';
import { steelmanNode } from '@/lib/nodes/steelman';
import { recruitNode } from '@/lib/nodes/recruit';
import { critiqueNode } from '@/lib/nodes/critique';
import { crossExamineNode } from '@/lib/nodes/cross-examine';
import { scoreNode } from '@/lib/nodes/score';
import { synthesizeNode } from '@/lib/nodes/synthesize';

export interface PipelineNode {
  name: string;
  stage: SessionStatus;
  execute: (session: Session, emit: (event: SessionEvent) => void) => Promise<Partial<Session>>;
}

export class Pipeline {
  private nodes: PipelineNode[] = [];
  
  addNode(node: PipelineNode): this {
    this.nodes.push(node);
    return this;
  }
  
  async run(session: Session, emit: (event: SessionEvent) => void): Promise<Session> {
    let currentSession = { ...session };

    for (const node of this.nodes) {
      emit({ type: 'stage_start', stage: node.stage, timestamp: new Date().toISOString() });
      currentSession.status = node.stage;
      
      let attempts = 0;
      let success = false;
      
      while (attempts < 3 && !success) {
        try {
          const updates = await node.execute(currentSession, emit);
          currentSession = { ...currentSession, ...updates };
          success = true;
        } catch (error) {
          attempts++;
          console.error(`Error in node ${node.name} (attempt ${attempts}):`, error);
          if (attempts >= 3) {
            emit({ 
              type: 'error', 
              message: error instanceof Error ? error.message : String(error), 
              stage: node.stage,
              retryable: false,
              timestamp: new Date().toISOString()
            });
            // Graceful degradation: continue to next node even after 3 failures
          } else {
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
          }
        }
      }
      
      emit({ type: 'stage_complete', stage: node.stage, timestamp: new Date().toISOString() });
    }
    
    currentSession.status = 'complete';
    return currentSession;
  }
}

export function createDialecticPipeline(): Pipeline {
  const pipeline = new Pipeline();
  
  pipeline
    .addNode(decomposeNode)
    .addNode(researchNode)
    .addNode(steelmanNode)
    .addNode(recruitNode)
    .addNode(critiqueNode)
    .addNode(crossExamineNode)
    .addNode(scoreNode)
    .addNode(synthesizeNode);
    
  return pipeline;
}
