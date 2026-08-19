import { Injectable, inject, signal } from '@angular/core';
import {
  NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router,
} from '@angular/router';

/**
 * Owns the between-pages loading state.
 *
 * Two behaviours worth knowing:
 *
 *  - The loader is held back ~180ms. A cached chunk resolves in single-digit
 *    milliseconds, and flashing a full-screen loader for that reads as a bug.
 *  - A failed navigation keeps the loader up while it retries once, then falls
 *    back home. A chunk that 404s after a redeploy is the common case, and the
 *    alternative is a blank screen.
 */
@Injectable({ providedIn: 'root' })
export class NavigationLoader {
  private readonly router = inject(Router);

  readonly visible = signal(false);
  readonly message = signal<string | null>(null);

  private showTimer?: number;
  private retriedUrl: string | null = null;

  init(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.scheduleShow();
        return;
      }

      if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        this.hide();
        this.retriedUrl = null;
        return;
      }

      if (event instanceof NavigationError) {
        this.onError(event);
      }
    });
  }

  private scheduleShow(): void {
    window.clearTimeout(this.showTimer);
    this.showTimer = window.setTimeout(() => this.visible.set(true), 180);
  }

  private hide(): void {
    window.clearTimeout(this.showTimer);
    this.visible.set(false);
    this.message.set(null);
  }

  /**
   * Retry once, then go home. Retrying forever would spin the loader for a
   * route that genuinely no longer exists.
   */
  private onError(event: NavigationError): void {
    const url = event.url;
    this.visible.set(true);

    if (this.retriedUrl !== url) {
      this.retriedUrl = url;
      this.message.set('Reconnecting');
      window.setTimeout(() => void this.router.navigateByUrl(url), 700);
      return;
    }

    this.message.set('Taking you home');
    window.setTimeout(() => {
      this.retriedUrl = null;
      void this.router.navigateByUrl('/');
    }, 900);
  }
}
