import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, timeout } from 'rxjs';
import { API_BASE_URL, API_TIMEOUT_MS } from '../config';
import { CatalogService } from './catalog.service';
import { Project } from '../models/project.model';

interface ApiRow {
  key: string;
  title: string;
  items: { slug: string; trendingScore?: number }[];
}

/**
 * Enriches the static catalogue with live data.
 *
 * Every failure path here is deliberately silent. The page is already rendered from
 * the build-time snapshot, so a cold backend or a paused database must produce
 * nothing worse than slightly stale ordering — never a spinner, an error, or a
 * layout shift.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly catalog = inject(CatalogService);

  /** Fire once at startup. Never throws. */
  refreshTrending(): void {
    this.http
      .get<ApiRow[]>(`${API_BASE_URL}/projects/rows`)
      .pipe(
        timeout(API_TIMEOUT_MS),
        catchError(() => of(null)),
      )
      .subscribe(rows => {
        if (!rows) return;
        const scores = rows
          .flatMap(r => r.items)
          .filter(i => i.trendingScore !== undefined)
          .map(i => ({ slug: i.slug, trendingScore: i.trendingScore }) as Pick<Project, 'slug' | 'trendingScore'>);
        if (scores.length) this.catalog.enrich(scores);
      });
  }
}
