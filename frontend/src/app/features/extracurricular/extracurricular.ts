import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Page } from '../../shared/components/page/page';

@Component({
  selector: 'app-extracurricular',
  imports: [Page],
  template: `
    <app-page eyebrow="BEYOND THE EDITOR" heading="Extracurricular" lede="What I do when I am not shipping.">
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
export class Extracurricular {}
