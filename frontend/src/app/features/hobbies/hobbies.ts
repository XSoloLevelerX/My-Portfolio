import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Page } from '../../shared/components/page/page';
import { Collection, Entry } from '../../shared/components/collection/collection';
import content from '../../data/content.json';

@Component({
  selector: 'app-hobbies',
  imports: [Page, Collection],
  template: `
    <app-page eyebrow="OFF THE CLOCK" heading="Hobbies" lede="What I do when nothing is compiling — and where a few of the projects came from.">
      <app-collection [entries]="entries" emptyNote="No entries yet." />
    </app-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hobbies {
  /** Compiled from src/content/hobbies/*.md — add a file, not a component. */
  readonly entries = (content as { hobbies: Entry[] }).hobbies;
}
