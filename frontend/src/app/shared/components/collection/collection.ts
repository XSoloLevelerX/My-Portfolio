import {
  ChangeDetectionStrategy, Component, computed, inject, input, signal,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface Entry {
  slug: string;
  title: string;
  category: string;
  blurb: string;
  link: string | null;
  linkLabel: string | null;
  platform: string | null;
  /** A LinkedIn post URN, already validated at build time. Never markup. */
  linkedin: string | null;
  embedHeight: number | null;
  date: string | null;
  tags: string[];
  featured: boolean;
  body: string;
}

/**
 * One presentation for extracurricular, hobbies and blog. They are the same
 * shape — a titled entry with a category, a note and an optional link — so they
 * get the same component rather than three that drift apart.
 */
@Component({
  selector: 'app-collection',
  templateUrl: './collection.html',
  styleUrl: './collection.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Collection {
  private readonly sanitizer = inject(DomSanitizer);

  readonly entries = input.required<Entry[]>();
  /** Shown when there is nothing yet, instead of an empty page. */
  readonly emptyNote = input('Nothing here yet.');

  readonly open = signal<string | null>(null);

  /**
   * Entries carrying an embed are shown as a wall rather than as cards to open:
   * a social post is the content, so hiding it behind a disclosure and then
   * floating a 504px frame in a full-width card is two clicks and a lot of dead
   * space for something that should just be readable.
   */
  readonly embedded = computed(() => this.entries().filter(e => !!e.linkedin));

  /** Everything else keeps the expand-to-read card. */
  readonly written = computed(() => this.entries().filter(e => !e.linkedin));

  /** Written entries grouped by category, in content-file order. */
  readonly groups = computed(() => {
    const by = new Map<string, Entry[]>();
    for (const e of this.written()) {
      const list = by.get(e.category) ?? [];
      list.push(e);
      by.set(e.category, list);
    }
    return [...by.entries()].map(([category, items]) => ({ category, items }));
  });

  /**
   * Builds the embed URL from the stored URN against a fixed template.
   *
   * The bypass is safe precisely because nothing user-supplied reaches it as
   * markup: the URN is shape-checked at build time and the origin and path are
   * hard-coded here. Storing LinkedIn's own <iframe> string and trusting that
   * instead is what would be dangerous.
   */
  embedUrl(entry: Entry): SafeResourceUrl | null {
    if (!entry.linkedin || !/^urn:li:[a-zA-Z]+:\d+$/.test(entry.linkedin)) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.linkedin.com/embed/feed/update/${entry.linkedin}`,
    );
  }

  /** Capped so one very tall post cannot dominate the wall. */
  embedHeight(entry: Entry): number {
    return Math.min(entry.embedHeight ?? 900, 1100);
  }

  toggle(slug: string): void {
    this.open.update(cur => (cur === slug ? null : slug));
  }

  year(date: string | null): string {
    return date ? date.slice(0, 4) : '';
  }
}
