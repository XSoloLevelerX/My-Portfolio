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

  readonly open = signal<Skill | null>(null);

  /** The ones actually used day to day lead the page. */
  readonly daily = computed(() => this.all.filter(s => s.daily));

  /** Everything, grouped by category, in a fixed order. */
  readonly groups = computed(() => {
    const order = Object.keys(CATEGORY_LABEL);
    const by = new Map<string, Skill[]>();
    for (const skill of this.all) {
      const list = by.get(skill.category) ?? [];
      list.push(skill);
      by.set(skill.category, list);
    }
    return order
      .filter(c => by.has(c))
      .map(c => ({ key: c, label: CATEGORY_LABEL[c] ?? c, items: by.get(c)! }));
  });

  readonly total = this.all.length;

  toggle(skill: Skill): void {
    this.open.update(current => (current?.slug === skill.slug ? null : skill));
  }

  /** Five dots, filled to the skill's level — read out properly for screen readers. */
  readonly dots = [1, 2, 3, 4, 5];
}
