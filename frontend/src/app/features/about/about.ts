import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Page } from '../../shared/components/page/page';

@Component({
  selector: 'app-about',
  imports: [Page],
  template: `
    <app-page eyebrow="WHO" heading="About" lede="The short version, and the longer one.">
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
export class About {}
