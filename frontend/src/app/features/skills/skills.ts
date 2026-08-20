import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Page } from '../../shared/components/page/page';
import data from '../../data/skills.json';

interface Skill {
  slug: string;
  name: string;
  category: string;
  level: number;
  daily: boolean;
  years: number | null;
  tags: string[];
  note: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  LANGUAGE: 'Languages',
  FRAMEWORK: 'Frameworks',
  DATA: 'Data',
  DEVOPS: 'Infrastructure',
  AI: 'AI & Agents',
  MOBILE: 'Mobile',
  TOOLING: 'Tooling',
};

/** One hue per category, reused by the arc, the legend dot and the note rule. */
const CATEGORY_HUE: Record<string, number> = {
  LANGUAGE: 4,
  FRAMEWORK: 28,
  DATA: 190,
  DEVOPS: 212,
  AI: 282,
  MOBILE: 152,
  TOOLING: 48,
};

/** Donut geometry. Kept here so the template stays declarative. */
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Arc-length gap between segments, so neighbouring hues never touch. */
const SEGMENT_GAP = 3;

@Component({
  selector: 'app-skills',
  imports: [Page],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Skills {
  /**
   * Compiled from src/content/skills/*.md at build time, so adding a skill is
   * adding a markdown file — no component edit, and no markdown parser in the
   * bundle.
   */
  private readonly all = (data as { skills: Skill[] }).skills;

  readonly radius = RADIUS;

  /** Null means "everything"; a category key narrows the list below the chart. */
  readonly filter = signal<string | null>(null);

  readonly total = this.all.length;
  readonly dailyCount = this.all.filter(s => s.daily).length;

  /** Categories present, in a fixed order, largest concern first in the file. */
  private readonly groups = computed(() => {
    const by = new Map<string, Skill[]>();
    for (const skill of this.all) {
      const list = by.get(skill.category) ?? [];
      list.push(skill);
      by.set(skill.category, list);
    }
    return Object.keys(CATEGORY_LABEL)
      .filter(c => by.has(c))
      .map(c => ({
        key: c,
        label: CATEGORY_LABEL[c] ?? c,
        hue: CATEGORY_HUE[c] ?? 0,
        items: by.get(c)!,
      }));
  });

  /**
   * The donut, as stroke maths rather than paths.
   *
   * Each segment is the same circle with a dash pattern of "draw this arc, skip
   * the rest", pushed around the ring by a negative dash offset. That keeps every
   * segment a real circle — so the stroke stays perfectly round at any size and
   * the ring can be restyled by changing one radius, which a set of generated
   * arc paths could not.
   */
  readonly slices = computed(() => {
    let travelled = 0;
    return this.groups().map(g => {
      const length = (g.items.length / this.total) * CIRCUMFERENCE;
      const drawn = Math.max(1, length - SEGMENT_GAP);
      const slice = {
        ...g,
        count: g.items.length,
        percent: Math.round((g.items.length / this.total) * 100),
        dash: `${drawn} ${CIRCUMFERENCE - drawn}`,
        offset: -travelled,
      };
      travelled += length;
      return slice;
    });
  });

  /**
   * The notes themselves — the point of the page. Daily drivers lead, because
   * "I use this every day" is the strongest recommendation available.
   */
  readonly recommended = computed(() => {
    const key = this.filter();
    return this.all
      .filter(s => !key || s.category === key)
      .slice()
      .sort((a, b) => Number(b.daily) - Number(a.daily) || b.level - a.level);
  });

  readonly activeLabel = computed(() => {
    const key = this.filter();
    return key ? (CATEGORY_LABEL[key] ?? key) : 'Everything';
  });

  hue(category: string): number {
    return CATEGORY_HUE[category] ?? 0;
  }

  select(key: string): void {
    this.filter.update(cur => (cur === key ? null : key));
  }

  clear(): void {
    this.filter.set(null);
  }
}
