/**
 * The one shape the whole site reads. Mirrors the `projects` table in Supabase,
 * and the build-time snapshot in app/data/projects.snapshot.json.
 */
export type Domain = 'AI' | 'SECURITY' | 'GRAPHICS' | 'SYSTEMS' | 'ML' | 'WEB';
export type ProjectStatus = 'LIVE' | 'WIP' | 'ARCHIVED';

export interface Project {
  slug: string;
  title: string;
  /** One line, shown on the card. */
  tagline: string;
  /** Long copy for the detail modal. */
  description: string;
  domain: Domain;
  stack: string[];
  liveUrl: string | null;
  repoUrl: string | null;
  writeupUrl: string | null;
  status: ProjectStatus;
  featured: boolean;
  /** 1..3, rendered as a Netflix-style "maturity rating". */
  complexity: 1 | 2 | 3;
  releasedAt: string | null;
  /** Populated by the API once it answers; absent in the static snapshot. */
  trendingScore?: number;
}

export interface ProjectSnapshot {
  generatedAt: string;
  projects: Project[];
}

/** Netflix "maturity rating" badge derived from complexity. */
export function complexityBadge(c: 1 | 2 | 3): string {
  return (['SDE-1', 'SDE-2', 'SDE-3'] as const)[c - 1];
}

export const DOMAIN_LABEL: Record<Domain, string> = {
  AI: 'AI & Agents',
  SECURITY: 'Security',
  GRAPHICS: '3D & Graphics',
  SYSTEMS: 'Systems',
  ML: 'ML & Vision',
  WEB: 'Web',
};
