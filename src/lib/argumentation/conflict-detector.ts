import { Claim, Evidence, ToulminArgument } from '@/lib/engine/types';

export interface EvidenceConflict {
  id: string;
  claimId: string;
  description: string;
  supportingEvidence: string[];  // Evidence IDs
  attackingEvidence: string[];   // Evidence IDs
  severity: 'high' | 'medium' | 'low';
}

/**
 * Detects claims where evidence is contradictory based on arguments linking to the same claim.
 * @param claims Array of claims.
 * @param evidence Array of evidence.
 * @returns Array of detected evidence conflicts.
 */
export function detectConflicts(claims: Claim[], evidence: Evidence[]): EvidenceConflict[] {
  const conflicts: EvidenceConflict[] = [];

  // Note: Implementation assumes `supportingEvidence` and `attackingEvidence` are properties on Claim 
  // or derivable. For deterministic mapping, we check if a claim has both.
  claims.forEach((claim, index) => {
    // We assume the type structure might have 'supportingEvidence' and 'attackingEvidence'
    // This is a defensive implementation adapting to possible structures
    const supporting = (claim as any).supportingEvidence || [];
    const attacking = (claim as any).attackingEvidence || [];

    if (supporting.length > 0 && attacking.length > 0) {
      conflicts.push({
        id: `conflict-${claim.id}-${index}`,
        claimId: claim.id,
        description: `Contradictory evidence detected for claim ID ${claim.id}.`,
        supportingEvidence: supporting,
        attackingEvidence: attacking,
        severity: 'high'
      });
    }
  });

  return conflicts;
}

/**
 * Detects claims where different agents hold conflicting positions (supporting vs attacking).
 * @param claims Array of all claims.
 * @param argumentsList Array of all arguments.
 * @returns Array of agent disagreements per claim.
 */
export function detectAgentDisagreements(claims: Claim[], argumentsList: ToulminArgument[]): { claimId: string; supporting: string[]; attacking: string[] }[] {
  const disagreements: { claimId: string; supporting: string[]; attacking: string[] }[] = [];

  claims.forEach(claim => {
    // Find all arguments related to this claim
    const claimArgs = argumentsList.filter(a => a.claimId === claim.id);
    
    // Group agents by their stance (assuming 'isAttack' and 'agentId' are properties of ToulminArgument)
    const supportingAgents = Array.from(new Set(
      claimArgs.filter(a => !(a as any).isAttack && (a as any).agentId).map(a => (a as any).agentId as string)
    ));
    
    const attackingAgents = Array.from(new Set(
      claimArgs.filter(a => (a as any).isAttack && (a as any).agentId).map(a => (a as any).agentId as string)
    ));

    if (supportingAgents.length > 0 && attackingAgents.length > 0) {
      disagreements.push({
        claimId: claim.id,
        supporting: supportingAgents,
        attacking: attackingAgents
      });
    }
  });

  return disagreements;
}

/**
 * Computes the consensus ratio: the percentage of claims without agent disagreement.
 * @param claims Array of all claims.
 * @param argumentsList Array of all arguments.
 * @returns A ratio between 0 and 1.
 */
export function computeConsensusRatio(claims: Claim[], argumentsList: ToulminArgument[]): number {
  if (claims.length === 0) return 1;

  const disagreements = detectAgentDisagreements(claims, argumentsList);
  const disputedClaimIds = new Set(disagreements.map(d => d.claimId));
  
  const agreedClaimsCount = claims.length - disputedClaimIds.size;
  return agreedClaimsCount / claims.length;
}
