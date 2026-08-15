import { Session, DecisionProfile, EpistemicAudit, Claim, Evidence, ToulminArgument, Assumption } from '@/lib/engine/types';
import { computeClaimConfidence } from './evidence-scorer';
import { validateArgument } from './toulmin-validator';
import { computeConsensusRatio, detectConflicts, detectAgentDisagreements } from './conflict-detector';

// Default weights — user can adjust these
export const DEFAULT_WEIGHTS = {
  evidenceStrength: 0.30,
  uncertainty: 0.25,
  argumentQuality: 0.20,
  corroboration: 0.15,
  feasibility: 0.10,
};

/**
 * Computes the full decision profile from session data deterministically.
 * Applies predefined weights to calculated confidence and quality metrics.
 * 
 * @param claims The array of claims.
 * @param evidence The array of evidence.
 * @param argumentsList The array of arguments.
 * @param assumptions The array of assumptions.
 * @param weights The weight map (uses DEFAULT_WEIGHTS if not provided).
 * @returns The generated DecisionProfile.
 */
export function computeDecisionProfile(
  claims: Claim[],
  evidence: Evidence[],
  argumentsList: ToulminArgument[],
  assumptions: Assumption[],
  weights: Record<string, number> = DEFAULT_WEIGHTS
): DecisionProfile {
  // Compute average claim confidence
  let avgConfidence = 0;
  if (claims.length > 0) {
    const totalConf = claims.reduce((sum, c) => {
      // Find evidence linked to this claim
      // Assuming Claim or Evidence has a way to link them; for now we pass all evidence as a placeholder
      // In a real implementation, you would filter `evidence` to only those supporting `c`
      return sum + computeClaimConfidence(evidence);
    }, 0);
    avgConfidence = totalConf / claims.length;
  }

  // Compute average argument quality
  let avgArgQuality = 0;
  if (argumentsList.length > 0) {
    const totalQuality = argumentsList.reduce((sum, arg) => {
      return sum + validateArgument(arg, evidence).completeness;
    }, 0);
    avgArgQuality = totalQuality / argumentsList.length;
  }

  // Calculate composite score based on weights
  const score = 
    (avgConfidence * weights.evidenceStrength) + 
    (avgArgQuality * weights.argumentQuality); // Extended logic would include other factors

  return {
    score,
    confidence: avgConfidence,
    factors: {
      evidenceStrength: avgConfidence,
      argumentQuality: avgArgQuality,
    },
    recommendation: score > 0.7 ? 'Proceed' : 'Needs Review',
    threshold: 0.7,
  } as any; // Typecasting since exact fields of DecisionProfile depend on types.ts
}

/**
 * Computes an epistemic audit to assess report quality, highlighting conflicts and disagreements.
 * 
 * @param claims The array of claims.
 * @param evidence The array of evidence.
 * @param argumentsList The array of arguments.
 * @param assumptions The array of assumptions.
 * @returns The generated EpistemicAudit.
 */
export function computeEpistemicAudit(
  claims: Claim[],
  evidence: Evidence[],
  argumentsList: ToulminArgument[],
  assumptions: Assumption[]
): EpistemicAudit {
  const consensusRatio = computeConsensusRatio(claims, argumentsList);
  const conflicts = detectConflicts(claims, evidence);
  
  // Find arguments that have poor structural completeness
  const weakArguments = argumentsList.filter(arg => {
    const quality = validateArgument(arg, evidence);
    return quality.completeness < 0.5;
  });

  return {
    overallReliability: consensusRatio,
    criticalConflicts: conflicts,
    weakArguments: weakArguments as any, 
    unverifiedClaims: claims.filter(c => false) as any, // Placeholder for unverified logic
  } as any; // Typecasting since exact fields of EpistemicAudit depend on types.ts
}
