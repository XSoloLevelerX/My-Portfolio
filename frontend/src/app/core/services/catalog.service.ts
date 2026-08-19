import { Injectable, computed, signal } from '@angular/core';
import snapshot from '../../data/projects.snapshot.json';
import { Project, ProjectSnapshot } from '../models/project.model';

/**
 * The static-first contract.
 *
 * First paint never waits on the network: the catalogue is imported at build time,
 * so the site renders fully with the backend cold and Supabase paused. Once the API
 * answers, `enrich()` merges live trending scores in — and if it never answers, the
 * static content simply stays. No spinner, no error state, no layout shift.
 *
 * A portfolio that looks broken is worse than one that is slightly stale.
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly _projects = signal<Project[]>(
    (snapshot as ProjectSnapshot).projects.map(p => ({ ...p }) as Project),
  );

  /** True once live API data has been merged. Drives a subtle "live" indicator only. */
  readonly isLive = signal(false);

  readonly projects = this._projects.asReadonly();

  /** The billboard title: newest featured project that is actually reachable, else newest featured. */
  readonly billboard = computed<Project | undefined>(() => {
    const all = this._projects();
    return all.find(p => p.featured && p.liveUrl) ?? all.find(p => p.featured) ?? all[0];
  });

  readonly featured = computed(() => this._projects().filter(p => p.featured));

  /**
   * Trending. Until the API supplies real engagement scores, this is the recency
   * bootstrap alone — which is exactly what makes a brand-new project show up in
   * "Trending Now" on day one with zero clicks.
   */
  readonly trending = computed(() =>
    [...this._projects()]
      .sort((a, b) => this.score(b) - this.score(a))
      .slice(0, 10),
  );

  readonly newReleases = computed(() =>
    [...this._projects()].sort((a, b) => (b.releasedAt ?? '').localeCompare(a.releasedAt ?? '')),
  );

  /** Netflix's "Continue Watching" — things still on the bench. */
  readonly inProgress = computed(() => this._projects().filter(p => p.status === 'WIP'));

  byDomain(domain: Project['domain']) {
    return computed(() => this._projects().filter(p => p.domain === domain));
  }

  find(slug: string): Project | undefined {
    return this._projects().find(p => p.slug === slug);
  }

  /** Merge live scores from the API. Called by the API service; safe to never happen. */
  enrich(live: Pick<Project, 'slug' | 'trendingScore'>[]): void {
    const bySlug = new Map(live.map(l => [l.slug, l.trendingScore ?? 0]));
    this._projects.update(list =>
      list.map(p => (bySlug.has(p.slug) ? { ...p, trendingScore: bySlug.get(p.slug) } : p)),
    );
    this.isLive.set(true);
  }

  private score(p: Project): number {
    if (p.trendingScore !== undefined) return p.trendingScore;
    // Recency bootstrap: 5.0 x 0.9^days, mirroring TrendingService on the backend.
    if (!p.releasedAt) return 0;
    const days = (Date.now() - Date.parse(p.releasedAt)) / 86_400_000;
    const recency = 5 * Math.pow(0.9, Math.max(0, days));
    return recency + (p.featured ? 1.5 : 0) + (p.liveUrl ? 1 : 0);
  }
}
