import { CoverageMapEntry } from './types';

export function buildCoverageMap(
  categories: string[],
  counts: Record<string, number>,
  minRequired = 5,
): Record<string, CoverageMapEntry> {
  const map: Record<string, CoverageMapEntry> = {};
  for (const cat of categories) {
    const count = counts[cat] || 0;
    map[cat] = { count, minRequired, covered: count >= minRequired };
  }
  return map;
}

export function calculateEnrollmentProgress(
  totalInteractions: number,
  minRequired: number,
  coverageMap: Record<string, { count: number; covered: boolean }>,
): number {
  const interactionProgress = Math.min(totalInteractions / minRequired, 1);
  const categories = Object.values(coverageMap);
  const coveredCount = categories.filter((c) => c.covered).length;
  const coverageProgress = categories.length > 0 ? coveredCount / categories.length : 0;
  return Math.round((interactionProgress * 0.6 + coverageProgress * 0.4) * 100);
}

export function isProfileReady(
  totalInteractions: number,
  minRequired: number,
  coverageMap: Record<string, { covered: boolean }>,
): boolean {
  if (totalInteractions < minRequired) return false;
  return Object.values(coverageMap).every((c) => c.covered);
}

export function truncateText(text: string, maxLength = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
