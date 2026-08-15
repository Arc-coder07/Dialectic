import { PipelineNode } from '@/lib/engine/pipeline';
import { ToulminArgument, ArgumentEdge } from '@/lib/engine/types';
import { generateObject } from 'ai';
import { getModel } from '@/lib/models/providers';
import { CrossExaminationSchema } from '@/lib/schemas';
import { v4 as uuidv4 } from 'uuid';

export const crossExamineNode: PipelineNode = {
  name: 'cross_examine',
  stage: 'cross_examining',
  async execute(session, emit) {
    const model = getModel();
    const newArguments: ToulminArgument[] = [];
    const newEdges: ArgumentEdge[] = [...(session.graph?.edges || [])];

    if (!session.agents || !session.arguments) return {};

    await Promise.all(
      session.agents.map(async (agent) => {
        try {
          const otherArgs = session.arguments!.filter(a => a.agentId !== agent.id);
          if (otherArgs.length === 0) return;

          const argsContext = otherArgs.map(a => `[${a.id}] ${a.claim}`).join('\n');
          
          const result = await generateObject({
            model,
            schema: CrossExaminationSchema,
            prompt: `You are ${agent.title}, ${agent.persona}.\n\nReview these arguments from other agents:\n${argsContext}\n\nChallenge the weakest arguments by generating critical questions.`,
          });

          for (const q of result.object.questions) {
            const arg: ToulminArgument = {
              id: uuidv4(),
              agentId: agent.id,
              claimId: q.targetClaimId,
              position: 'attacks',
              claim: q.question,
              grounds: [],
              warrant: q.reasoning,
              backing: '',
              qualifier: 'possibly',
              rebuttal: '',
              quality: { hasGrounds: false, hasWarrant: true, hasBacking: false, hasRebuttal: false, evidenceStrength: 0, completeness: 0.25 }
            };

            newArguments.push(arg);

            emit({
              type: 'argument_created',
              argument: arg,
              timestamp: new Date().toISOString()
            });

            newEdges.push({
              source: arg.id,
              target: q.targetClaimId,
              type: 'questions',
              strength: 0.5
            });
          }
        } catch (error) {
          console.error(`Error in cross-examination for agent ${agent.id}:`, error);
        }
      })
    );

    // Normally run conflict detection (detectConflicts) here
    // ...

    return {
      arguments: [...session.arguments, ...newArguments],
      graph: {
        nodes: session.graph?.nodes || [],
        edges: newEdges,
      }
    };
  }
};
