import { PipelineNode } from '@/lib/engine/pipeline';
import { ToulminArgument } from '@/lib/engine/types';
import { generateObject } from 'ai';
import { getModel } from '@/lib/models/providers';
import { ToulminCritiqueSchema } from '@/lib/schemas';
import { v4 as uuidv4 } from 'uuid';

export const critiqueNode: PipelineNode = {
  name: 'critique',
  stage: 'critiquing',
  async execute(session, emit) {
    const model = getModel();
    const newArguments: ToulminArgument[] = [];

    if (!session.agents) return {};

    await Promise.all(
      session.agents.map(async (agent) => {
        try {
          const claimsContext = session.claims?.map(c => `[${c.id}] ${c.text}`).join('\n') || '';
          const evidenceContext = session.evidence?.map(e => `[${e.id}] ${e.content}`).join('\n') || '';
          
          const result = await generateObject({
            model,
            schema: ToulminCritiqueSchema,
            prompt: `You are ${agent.title}, acting as ${agent.persona}.\nPersona: ${agent.persona}\nObjectives: ${agent.objectives.join(', ')}\n\nProposition: ${session.proposition}\nSteelman: ${session.steelman || 'None'}\n\nClaims:\n${claimsContext}\n\nEvidence:\n${evidenceContext}\n\nProvide a formal Toulmin critique of the claims based on the evidence. Ensure all elements (claim, grounds, warrant, backing, qualifier, rebuttal) are present.`,
          });

          // Normally validate Toulmin structure here using toulmin-validator

          const critique = result.object.critique;
          const arg: ToulminArgument = {
            id: uuidv4(),
            agentId: agent.id,
            claimId: session.claims?.[0]?.id || '', // Fallback since schema doesn't specify
            position: critique.position,
            claim: critique.claim,
            grounds: [], // Fallback since schema doesn't specify
            warrant: critique.warrant,
            backing: critique.backing,
            qualifier: critique.qualifier,
            rebuttal: critique.rebuttal,
            quality: {
              hasGrounds: false,
              hasWarrant: !!critique.warrant,
              hasBacking: !!critique.backing,
              hasRebuttal: !!critique.rebuttal,
              evidenceStrength: 0,
              completeness: 0.5
            }
          };

          newArguments.push(arg);

          emit({
            type: 'argument_created',
            argument: arg,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error(`Error in critique for agent ${agent.id}:`, error);
        }
      })
    );

    return {
      arguments: [...(session.arguments || []), ...newArguments],
    };
  }
};
