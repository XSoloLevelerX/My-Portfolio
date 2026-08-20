import { Injectable, signal } from '@angular/core';

/**
 * The "add to my list" action, mapped onto what browsers actually allow.
 *
 * No browser exposes an API to add a bookmark. `window.external.AddFavorite`
 * was IE-only and is long gone; Chrome, Safari and Firefox deliberately have no
 * equivalent, because a page that could write to your bookmarks unprompted is a
 * security problem. So this does the closest real thing on each platform:
 *
 *  - Where the Web Share API exists (phones, and Safari on desktop), it opens
 *    the native share sheet, which is where "Add to Home Screen" and "Add
 *    Bookmark" actually live.
 *  - Everywhere else it surfaces the real keyboard shortcut, with the right
 *    modifier for the platform, and copies the URL so the next step is one
 *    paste rather than a retype.
 */
@Injectable({ providedIn: 'root' })
export class BookmarkService {
  /** Transient message for the toast; null when nothing is showing. */
  readonly hint = signal<string | null>(null);

  private timer?: number;

  /** True on Apple platforms, which use ⌘ rather than Ctrl. */
  private get isApple(): boolean {
    return /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? navigator.userAgent);
  }

  private get canShare(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  }

  async add(title: string, url: string = window.location.href): Promise<void> {
    if (this.canShare) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Dismissed, or share refused — fall through to the shortcut hint.
      }
    }

    const combo = this.isApple ? '⌘ D' : 'Ctrl + D';
    let copied = false;
    try {
      await navigator.clipboard?.writeText(url);
      copied = true;
    } catch {
      /* clipboard blocked — the shortcut alone still works */
    }

    this.show(
      copied
        ? `Press ${combo} to bookmark — link copied`
        : `Press ${combo} to bookmark`,
    );
  }

  private show(message: string): void {
    this.hint.set(message);
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.hint.set(null), 3600);
  }
}
