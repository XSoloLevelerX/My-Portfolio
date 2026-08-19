import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { API_BASE_URL } from '../config';

export type EventType = 'VIEW' | 'OPEN' | 'CLICK_LIVE' | 'CLICK_REPO';

/**
 * Records engagement with the portfolio. This is what "Trending Now" is computed
 * from — Vercel Web Analytics is not enabled on the deployed projects, so the
 * signal has to come from here.
 *
 * Strictly fire-and-forget: tracking must never delay a navigation or surface an
 * error to the visitor.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);

  /** Slugs already counted this page-load, so one visit is not counted twice. */
  private readonly seen = new Set<string>();

  track(slug: string, eventType: EventType): void {
    if (eventType === 'VIEW') {
      const key = `${slug}:VIEW`;
      if (this.seen.has(key)) return;
      this.seen.add(key);
    }

    this.http
      .post(`${API_BASE_URL}/projects/${slug}/events`, {
        eventType,
        referrer: document.referrer || null,
      })
      .pipe(catchError(() => of(null)))
      .subscribe();
  }
}
