import { PipelineNode } from '@/lib/engine/pipeline';
import { Evidence } from '@/lib/engine/types';
import { generateObject } from 'ai';
import { getModel } from '@/lib/models/providers';
import { EvidenceClassificationSchema } from '@/lib/schemas';
import { v4 as uuidv4 } from 'uuid';
import { tavily } from '@tavily/core';

export const researchNode: PipelineNode = {
  name: 'research',
  stage: 'researching',
  async execute(session, emit) {
    const model = getModel();
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY || '' });

    const newEvidence: Evidence[] = [];
    const updatedClaims = [...(session.claims || [])];

    await Promise.all(
      updatedClaims.map(async (claim) => {
        try {
          const searchResponse = await tvly.search(claim.text, {
            searchDepth: 'basic',
            maxResults: 3,
          });

          for (const result of searchResponse.results) {
            const classification = await generateObject({
              model,
              schema: EvidenceClassificationSchema,
              prompt: `Analyze this search result in relation to the claim: "${claim.text}"\n\nSearch result: ${result.title}\n${result.content}\n\nDoes this evidence support or attack the claim? Extract key quotes.`,
            });

            const sourceQuality = result.url.includes('.gov') || result.url.includes('.edu') ? 0.9 : 0.6;
            const freshness = 0.8; 
            const directness = classification.object.directnessScore || 0.5;
            const corroboration = 0.5; 

            const qualityScore = sourceQuality * 0.3 + freshness * 0.25 + directness * 0.25 + corroboration * 0.2;

            const ev: Evidence = {
              id: uuidv4(),
              content: result.content,
              sourceUrl: result.url,
              sourceTitle: result.title,
              sourceType: result.url.includes('.gov') || result.url.includes('.edu') ? 'primary' : 'aggregator',
              retrievedAt: new Date().toISOString(),
              contentHash: Buffer.from(result.content).toString('base64').substring(0, 32),
              retrievalMethod: 'tavily_search',
              scores: {
                sourceQuality,
                freshness,
                directness,
                corroboration
              },
              strength: qualityScore,
              supportsClaims: classification.object.supportsClaimIds.includes(claim.id) ? [claim.id] : [],
              attacksClaims: classification.object.attacksClaimIds.includes(claim.id) ? [claim.id] : []
            };

            newEvidence.push(ev);

            emit({
              type: 'evidence_found',
              evidence: ev,
              timestamp: new Date().toISOString()
            });
          }

          const supporting = newEvidence.filter(e => e.supportsClaims.includes(claim.id));
          const attacking = newEvidence.filter(e => e.attacksClaims.includes(claim.id));

          if (supporting.length > 0 && attacking.length === 0) {
            claim.status = 'supported';
          } else if (attacking.length > 0 && supporting.length === 0) {
            claim.status = 'contradicted';
          } else if (supporting.length > 0 && attacking.length > 0) {
            claim.status = 'weak';
          } else {
            claim.status = 'unverified';
          }
        } catch (error) {
          console.error(`Error researching claim ${claim.id}:`, error);
        }
      })
    );

    return {
      claims: updatedClaims,
      evidence: [...(session.evidence || []), ...newEvidence],
    };
  }
};
