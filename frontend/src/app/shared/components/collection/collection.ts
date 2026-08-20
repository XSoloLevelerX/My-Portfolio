import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

export interface Entry {
  slug: string;
  title: string;
  category: string;
  blurb: string;
  link: string | null;
  linkLabel: string | null;
  platform: string | null;
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
  readonly entries = input.required<Entry[]>();
  /** Shown when there is nothing yet, instead of an empty page. */
  readonly emptyNote = input('Nothing here yet.');

  readonly open = signal<string | null>(null);

  /** Grouped by category, insertion-ordered so the content file controls it. */
  readonly groups = computed(() => {
    const by = new Map<string, Entry[]>();
    for (const e of this.entries()) {
      const list = by.get(e.category) ?? [];
      list.push(e);
      by.set(e.category, list);
    }
    return [...by.entries()].map(([category, items]) => ({ category, items }));
  });

  toggle(slug: string): void {
    this.open.update(cur => (cur === slug ? null : slug));
  }

  year(date: string | null): string {
    return date ? date.slice(0, 4) : '';
  }
}
