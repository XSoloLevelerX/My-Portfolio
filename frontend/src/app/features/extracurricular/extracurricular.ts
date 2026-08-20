import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Page } from '../../shared/components/page/page';
import { Collection, Entry } from '../../shared/components/collection/collection';
import content from '../../data/content.json';

@Component({
  selector: 'app-extracurricular',
  imports: [Page, Collection],
  template: `
    <app-page eyebrow="BEYOND THE EDITOR" heading="Extracurricular" lede="Competitions, communities and the work that is not shipped as a repo.">
      <app-collection [entries]="entries" emptyNote="No entries yet." />
    </app-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Extracurricular {
  /** Compiled from src/content/extracurricular/*.md — add a file, not a component. */
  readonly entries = (content as { extracurricular: Entry[] }).extracurricular;
}
