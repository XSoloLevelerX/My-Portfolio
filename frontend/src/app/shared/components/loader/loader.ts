import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The between-pages screen: the wordmark's own A, pulsing bright to dull, held
 * until the route's chunk arrives.
 *
 * Shown for slow navigations *and* failed ones — a chunk that 404s keeps this up
 * while the router retries, rather than dropping the visitor on a blank page.
 */
@Component({
  selector: 'app-loader',
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loader {
  /** Surfaced only after a failure, so a normal wait stays wordless. */
  readonly message = input<string | null>(null);
}
