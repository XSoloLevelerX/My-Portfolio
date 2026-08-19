import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The common frame for every non-home page: eyebrow, title, lede, content. */
@Component({
  selector: 'app-page',
  templateUrl: './page.html',
  styleUrl: './page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Page {
  readonly eyebrow = input<string>('');
  readonly heading = input.required<string>();
  readonly lede = input<string>('');
}
