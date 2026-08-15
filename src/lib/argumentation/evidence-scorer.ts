import { Evidence } from '@/lib/engine/types';

/**
 * Determines the source quality score based on the source type.
 * @param type The type of the source.
 * @returns A score between 0 and 1.
 */
export function sourceQualityScore(type: Evidence['sourceType']): number {
  switch (type) {
    case 'primary': return 0.9;
    case 'calculation': return 0.95;
    case 'academic': return 0.85;
    case 'aggregator': return 0.7;
    case 'user_input': return 0.5;
    case 'opinion': return 0.4;
    default: return 0.5;
  }
}

/**
 * Computes freshness score using exponential decay from publication/retrieval date.
 * @param dateStr ISO date string.
 * @returns A score between 0 and 1.
 */
export function computeFreshness(dateStr: string | undefined): number {
  if (!dateStr) return 0.5;
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 0.5;
  
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Exponential decay: Math.exp(-daysOld / 365)
  // Maps 0 days to 1.0, 365 days to ~0.37
  return Math.exp(-diffDays / 365);
}

/**
 * Computes overall evidence strength as a weighted composite.
 * Formula: sourceQuality × 0.30 + freshness × 0.25 + directness × 0.25 + corroboration × 0.20
 * @param scores The individual score components.
 * @returns The overall composite score.
 */
export function computeEvidenceStrength(scores: Evidence['scores']): number {
  if (!scores) return 0;
  return (
    ((scores.sourceQuality ?? 0.5) * 0.30) +
    ((scores.freshness ?? 0.5) * 0.25) +
    ((scores.directness ?? 0.5) * 0.25) +
    ((scores.corroboration ?? 0.5) * 0.20)
  );
}

/**
 * Scores all evidence components and updates the composite score deterministically.
 * @param evidence The evidence object to score.
 * @returns The updated evidence object with calculated scores.
 */
export function scoreEvidence(evidence: Evidence): Evidence {
  const sourceQuality = sourceQualityScore(evidence.sourceType);
  const freshness = computeFreshness(evidence.publishedAt || evidence.retrievedAt);
  
  // Retain existing values or default to 0.5
  const directness = evidence.scores?.directness ?? 0.5;
  const corroboration = evidence.scores?.corroboration ?? 0.5;

  const newScores = {
    sourceQuality,
    freshness,
    directness,
    corroboration,
  };
  
  const composite = computeEvidenceStrength(newScores);

  return {
    ...evidence,
    scores: newScores,
    strength: composite,
  };
}

/**
 * Computes claim confidence based on its supporting evidence.
 * @param evidence Array of evidence supporting the claim.
 * @returns A confidence score between 0 and 1.
 */
export function computeClaimConfidence(evidence: Evidence[]): number {
  if (!evidence || evidence.length === 0) return 0;
  
  // Calculate average of all evidence composite scores
  const total = evidence.reduce((sum, e) => {
    const scoredE = scoreEvidence(e);
    return sum + (scoredE.strength || 0);
  }, 0);
  
  return total / evidence.length;
}
