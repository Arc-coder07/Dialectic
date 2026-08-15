import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Evidence } from './engine/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export async function hashContent(content: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function computeEvidenceStrength(scores: Evidence['scores']): number {
  // Deterministic formula for evidence quality
  const strength = (
    (scores.sourceQuality * 0.3) +
    (scores.freshness * 0.25) +
    (scores.directness * 0.25) +
    (scores.corroboration * 0.2)
  );
  
  return Math.min(Math.max(strength, 0), 1);
}

export function computeFreshness(dateStr: string | undefined): number {
  if (!dateStr) return 0.5; // Default middle ground if no date

  const published = new Date(dateStr).getTime();
  const now = Date.now();
  const diffInYears = (now - published) / (1000 * 60 * 60 * 24 * 365.25);

  if (isNaN(diffInYears)) return 0.5;

  // Simple exponential decay function for freshness
  // Adjust half-life as needed. Here, half-life is roughly 3 years.
  const freshness = Math.exp(-0.231 * Math.max(0, diffInYears));
  return Math.max(Math.min(freshness, 1), 0);
}

export function sourceQualityScore(type: Evidence['sourceType']): number {
  const taxonomy: Record<Evidence['sourceType'], number> = {
    academic: 1.0,
    primary: 0.9,
    calculation: 0.8,
    aggregator: 0.6,
    opinion: 0.4,
    user_input: 0.2,
  };
  
  return taxonomy[type] || 0.5;
}
