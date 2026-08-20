import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Page } from '../../shared/components/page/page';

@Component({
  selector: 'app-hobbies',
  imports: [Page],
  template: `
    <app-page
      eyebrow="OFF THE CLOCK"
      heading="Hobbies"
      lede="What I do when nothing is compiling."
    >
      <p class="soon">Coming next.</p>
    </app-page>
  `,
  styles: `
    .soon {
      margin-top: 48px;
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--text-dim);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hobbies {}
