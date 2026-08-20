import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Page } from '../../shared/components/page/page';
import { Collection, Entry } from '../../shared/components/collection/collection';
import content from '../../data/content.json';

@Component({
  selector: 'app-blog',
  imports: [Page, Collection],
  template: `
    <app-page eyebrow="WRITING" heading="Blog" lede="Posts, findings, and things worth writing down. LinkedIn and other external posts appear here too — add a link field to any entry.">
      <app-collection [entries]="entries" emptyNote="No posts yet." />
    </app-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Blog {
  /** Compiled from src/content/blog/*.md — add a file, not a component. */
  readonly entries = (content as { blog: Entry[] }).blog;
}
