import { PipelineNode } from '@/lib/engine/pipeline';
import { Session, SessionEvent, Claim, Assumption } from '@/lib/engine/types';
import { generateObject } from 'ai';
import { getModel } from '@/lib/models/providers';
import { ClaimExtractionSchema, AssumptionExtractionSchema } from '@/lib/schemas';
import { v4 as uuidv4 } from 'uuid';

export const decomposeNode: PipelineNode = {
  name: 'decompose',
  stage: 'decomposing',
  async execute(session, emit) {
    const model = getModel();

    // Extract claims
    const claimsResult = await generateObject({
      model,
      schema: ClaimExtractionSchema,
      prompt: `Extract 5-8 key claims from the following proposition. Context: ${session.context || 'None'}\n\nProposition: ${session.proposition}`,
    });

    const claims: Claim[] = claimsResult.object.claims.map((c: any) => ({
      id: uuidv4(),
      text: c.text,
      category: c.category || 'market',
      status: 'unverified',
      evidence: [],
      arguments: [],
      confidence: 0
    }));

    emit({ 
      type: 'claims_extracted', 
      claims,
      timestamp: new Date().toISOString() 
    });

    // Extract assumptions
    const assumptionsResult = await generateObject({
      model,
      schema: AssumptionExtractionSchema,
      prompt: `Extract 3-5 hidden assumptions from the following proposition. Context: ${session.context || 'None'}\n\nProposition: ${session.proposition}`,
    });

    const assumptions: Assumption[] = assumptionsResult.object.assumptions.map((a: any) => ({
      id: uuidv4(),
      text: a.text,
      criticality: a.criticality || 'important',
      status: 'untested',
      confidence: 0,
      relatedClaims: [],
      relatedEvidence: [],
      falsificationCondition: a.falsificationCondition || ''
    }));

    emit({ 
      type: 'assumptions_extracted', 
      assumptions,
      timestamp: new Date().toISOString() 
    });

    return { claims, assumptions };
  }
};
