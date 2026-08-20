import { Injectable, signal } from '@angular/core';

export interface BookmarkPrompt {
  /** Modifier keycap, e.g. '⌘' or 'Ctrl'. */
  modifier: string;
  /** Second keycap, always 'D'. */
  key: string;
  title: string;
  /** Set once the real shortcut is detected, or the URL is copied. */
  status: 'waiting' | 'bookmarked' | 'copied';
}

/**
 * The "add to my list" action, mapped onto what browsers actually allow.
 *
 * There is no API for this, and it is worth being exact about why rather than
 * treating it as an oversight. Probed directly in Chrome:
 *
 *   window.external.AddFavorite  -> undefined   (IE-only, removed)
 *   window.sidebar.addPanel      -> undefined   (old Firefox, removed)
 *   any bookmark/favourite API   -> none
 *   synthetic Ctrl+D             -> isTrusted: false
 *
 * That last one is the reason a workaround cannot exist: browser chrome only
 * acts on trusted events originating from real hardware, so a dispatched
 * KeyboardEvent reaches page scripts and stops there. If it did not, any site
 * could write itself into your bookmarks unprompted.
 *
 * So this does the nearest real thing on each platform:
 *
 *  - Where the Web Share API exists (phones, Safari), it opens the native share
 *    sheet, which is where "Add Bookmark" and "Add to Home Screen" actually are.
 *  - Otherwise it shows the shortcut as keycaps, copies the URL so nothing has
 *    to be retyped, and *listens for the real keypress* so the prompt can
 *    confirm rather than just instruct.
 */
@Injectable({ providedIn: 'root' })
export class BookmarkService {
  readonly prompt = signal<BookmarkPrompt | null>(null);

  private timer?: number;
  private listening = false;

  private get isApple(): boolean {
    return /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
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
        // Dismissed or refused — fall through to the keycap prompt.
      }
    }

    let copied = false;
    try {
      await navigator.clipboard?.writeText(url);
      copied = true;
    } catch {
      /* clipboard blocked — the shortcut alone still works */
    }

    this.show({
      modifier: this.isApple ? '⌘' : 'Ctrl',
      key: 'D',
      title,
      status: copied ? 'copied' : 'waiting',
    });
    this.listen();
  }

  dismiss(): void {
    window.clearTimeout(this.timer);
    this.prompt.set(null);
  }

  private show(p: BookmarkPrompt): void {
    this.prompt.set(p);
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.prompt.set(null), 6000);
  }

  /**
   * Watches for the real shortcut. The page cannot open the dialog, but it can
   * tell that the visitor did — so the prompt confirms instead of leaving them
   * wondering whether it worked.
   */
  private listen(): void {
    if (this.listening) return;
    this.listening = true;

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      const current = this.prompt();
      if (!current || current.status === 'bookmarked') return;
      if (e.key?.toLowerCase() !== 'd') return;
      if (!(e.metaKey || e.ctrlKey)) return;

      // Deliberately not preventing the default: the browser's own dialog is
      // the entire point, so it must be allowed through.
      this.prompt.set({ ...current, status: 'bookmarked' });
      window.clearTimeout(this.timer);
      this.timer = window.setTimeout(() => this.prompt.set(null), 2200);
    });
  }
}
