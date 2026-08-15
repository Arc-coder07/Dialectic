import { ToulminArgument, ArgumentQuality, Evidence } from '@/lib/engine/types';
import { scoreEvidence } from './evidence-scorer';

/**
 * Validates Toulmin argument completeness and computes argument quality.
 * @param arg The Toulmin argument to validate.
 * @param allEvidence All available evidence in the session to check against grounds.
 * @returns The computed ArgumentQuality object.
 */
export function validateArgument(arg: ToulminArgument, allEvidence: Evidence[]): ArgumentQuality {
  const hasGrounds = Array.isArray(arg.grounds) && arg.grounds.length > 0;
  const hasWarrant = typeof arg.warrant === 'string' && arg.warrant.trim().length > 0;
  const hasBacking = typeof arg.backing === 'string' && arg.backing.trim().length > 0;
  const hasRebuttal = typeof arg.rebuttal === 'string' && arg.rebuttal.trim().length > 0;

  // Calculate completeness: percentage of structural fields populated
  const fields = [hasGrounds, hasWarrant, hasBacking, hasRebuttal];
  const completeness = fields.filter(Boolean).length / fields.length;

  // Calculate evidence strength from linked evidence
  let evidenceStrength = 0;
  if (hasGrounds) {
    const linkedEvidence = allEvidence.filter(e => arg.grounds?.includes(e.id));
    if (linkedEvidence.length > 0) {
      const totalStrength = linkedEvidence.reduce((sum, e) => {
        const scored = scoreEvidence(e);
        return sum + (scored.strength || 0);
      }, 0);
      evidenceStrength = totalStrength / linkedEvidence.length;
    }
  }

  return {
    hasGrounds,
    hasWarrant,
    hasBacking,
    hasRebuttal,
    evidenceStrength,
    completeness,
  };
}

/**
 * Generates warning messages for incomplete argument structures.
 * @param arg The Toulmin argument to check.
 * @returns Array of warning strings describing structural flaws.
 */
export function getArgumentWarnings(arg: ToulminArgument): string[] {
  const warnings: string[] = [];

  if (!arg.grounds || arg.grounds.length === 0) {
    warnings.push("Argument has no grounds (evidence).");
  }
  if (!arg.warrant || arg.warrant.trim().length === 0) {
    warnings.push("Missing warrant. The logical connection between grounds and claim is unclear.");
  }
  if (!arg.backing || arg.backing.trim().length === 0) {
    warnings.push("Missing backing. The warrant lacks foundational support.");
  }
  if (!arg.rebuttal || arg.rebuttal.trim().length === 0) {
    warnings.push("No rebuttal provided. The argument does not address potential counterarguments.");
  }

  return warnings;
}
