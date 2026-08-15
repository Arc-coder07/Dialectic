import { z } from 'zod';

export const ClaimExtractionSchema = z.object({
  claims: z.array(
    z.object({
      text: z.string().describe('The core assertion made in the claim.'),
      category: z.enum([
        'market',
        'financial',
        'technical',
        'regulatory',
        'competitive',
        'operational',
        'user_need',
      ]).describe('The domain category of the claim.'),
      falsificationCondition: z.string().optional().describe('What specific evidence or scenario would prove this claim false?'),
    })
  ).describe('A list of individual claims extracted from the proposition.'),
});

export type ClaimExtraction = z.infer<typeof ClaimExtractionSchema>;

export const AssumptionExtractionSchema = z.object({
  assumptions: z.array(
    z.object({
      text: z.string().describe('The unstated belief or premise required for the proposition to be true.'),
      criticality: z.enum(['critical', 'important', 'minor']).describe('How crucial this assumption is to the overall proposition.'),
      falsificationCondition: z.string().describe('What condition or evidence would invalidate this assumption?'),
    })
  ).describe('A list of assumptions implicit in the proposition.'),
});

export type AssumptionExtraction = z.infer<typeof AssumptionExtractionSchema>;

export const AgentRecruitmentSchema = z.object({
  agents: z.array(
    z.object({
      persona: z.string().describe('A distinct persona or role for the agent (e.g., "Skeptical Financial Analyst").'),
      title: z.string().describe('The formal title of the agent.'),
      background: z.string().describe('The relevant background or expertise area.'),
      objectives: z.array(z.string()).describe('Specific objectives for this agent in evaluating the proposition.'),
      whatWouldChangeMind: z.array(z.string()).describe('Criteria or evidence that would make the agent change its stance.'),
    })
  ).describe('A diverse set of specialized agents to evaluate the proposition from different angles.'),
});

export type AgentRecruitment = z.infer<typeof AgentRecruitmentSchema>;

export const ToulminCritiqueSchema = z.object({
  critique: z.object({
    position: z.enum(['supports', 'attacks']).describe('Whether this argument supports or attacks the claim.'),
    claim: z.string().describe('The specific claim being argued.'),
    warrant: z.string().describe('The underlying reasoning that connects the grounds to the claim.'),
    backing: z.string().describe('Additional context or principles supporting the warrant.'),
    qualifier: z.enum(['certainly', 'probably', 'possibly', 'unlikely']).describe('The degree of certainty for this argument.'),
    rebuttal: z.string().describe('Conditions under which the claim might not hold true, or exceptions to the rule.'),
  }).describe('A complete argument following the Toulmin model structure.'),
});

export type ToulminCritique = z.infer<typeof ToulminCritiqueSchema>;

export const CrossExaminationSchema = z.object({
  questions: z.array(
    z.object({
      targetClaimId: z.string().describe('The ID of the claim being questioned.'),
      question: z.string().describe('A probing question addressing a weakness, gap, or contradiction.'),
      reasoning: z.string().describe('Why this question is critical to resolve.'),
    })
  ).describe('A set of cross-examination questions targeting vulnerable points.'),
});

export type CrossExamination = z.infer<typeof CrossExaminationSchema>;

export const SteelmanSchema = z.object({
  steelman: z.string().describe('A reconstructed, strongest possible version of the original proposition, addressing initial weaknesses.'),
});

export type Steelman = z.infer<typeof SteelmanSchema>;

export const SynthesisSchema = z.object({
  verdict: z.string().describe('The final, synthesized judgment on the original proposition based on all evidence and arguments.'),
  experiments: z.array(
    z.object({
      hypothesis: z.string().describe('The hypothesis to test.'),
      method: z.string().describe('How to test the hypothesis practically.'),
      successCriteria: z.array(z.string()).describe('Metrics or outcomes indicating the hypothesis is true.'),
      failureCriteria: z.array(z.string()).describe('Metrics or outcomes indicating the hypothesis is false.'),
      estimatedCost: z.string().describe('Estimated cost in time or money (e.g., "$500", "2 weeks").'),
      estimatedTime: z.string().describe('Estimated duration to run the experiment.'),
    })
  ).describe('Proposed experiments to resolve remaining critical uncertainties.'),
});

export type Synthesis = z.infer<typeof SynthesisSchema>;

export const EvidenceClassificationSchema = z.object({
  relevance: z.boolean().describe('Whether this evidence is actually relevant to the claims in question.'),
  supportsClaimIds: z.array(z.string()).describe('IDs of claims this evidence supports.'),
  attacksClaimIds: z.array(z.string()).describe('IDs of claims this evidence attacks or contradicts.'),
  directnessScore: z.number().min(0).max(1).describe('How directly this evidence addresses the claim (0 to 1).'),
  sourceQualityTaxonomy: z.enum(['primary', 'aggregator', 'opinion', 'calculation', 'academic', 'user_input']).describe('The classification of the source type.'),
});

export type EvidenceClassification = z.infer<typeof EvidenceClassificationSchema>;
