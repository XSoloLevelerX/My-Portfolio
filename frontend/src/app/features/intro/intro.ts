import {
  ChangeDetectionStrategy, Component, OnDestroy, OnInit,
  inject, output, signal,
} from '@angular/core';
import { IntroService } from '../../core/services/intro.service';

/**
 * The title sequence, in four beats:
 *
 *   1. FORM    the A is brushed in, filling the screen
 *   2. PULL    the camera pulls back and the rest of AMARTYA is revealed around it
 *   3. HOLD    the wordmark sits
 *   4. DIVE    the camera dives into the R's vertical stem, through the colour
 *              bars, and lands on the page
 *
 * Timings here mirror the CSS exactly; changing one without the other desyncs
 * the sequence.
 */
const T = {
  form: 0,
  pull: 1900,
  hold: 3000,
  /** The wordmark is complete — where the sting belongs. */
  sting: 2950,
  dive: 3500,
  end: 4750,
} as const;

@Component({
  selector: 'app-intro',
  templateUrl: './intro.html',
  styleUrl: './intro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Intro implements OnInit, OnDestroy {
  private readonly introSvc = inject(IntroService);

  readonly finished = output<void>();

  readonly phase = signal<'idle' | 'running' | 'leaving'>('idle');
  readonly soundArmed = this.introSvc.soundArmed;
  readonly showSkip = signal(false);
  readonly reduced = signal(false);

  /** Beat flags, flipped on the timeline and read by the template. */
  readonly pulled = signal(false);
  readonly diving = signal(false);

  /** The mark: three strokes, brushed in by 31 strands under 28 lamps. */
  readonly helpers = [1, 2, 3];
  readonly furs = Array.from({ length: 31 }, (_, i) => i + 1);
  readonly lamps = Array.from({ length: 28 }, (_, i) => i + 1);

  /** AMARTYA, one span per letter so each can sit on its own arc. */
  readonly letters = 'AMARTYA'.split('').map((char, i) => ({ char, i }));

  /**
   * The colour bars the dive passes through. Warm on the left, cool on the right,
   * with black gaps between — computed here rather than in CSS so the palette can
   * skip the greens that a plain hue sweep would land on.
   */
  readonly bars = Array.from({ length: 46 }, (_, i) => {
    const t = i / 45;
    // 0 -> 55 (red..amber), then jump the greens, 185 -> 320 (cyan..magenta)
    const hue = t < 0.48 ? t * 115 : 185 + (t - 0.48) * 260;
    const seed = (i * 2654435761) % 1000 / 1000;
    return {
      i,
      hue: Math.round(hue),
      light: 45 + Math.round(seed * 22),
      width: (0.4 + seed * 2.2).toFixed(2),
      delay: Math.round(seed * 180),
      dim: seed < 0.28,
    };
  });

  private timers: number[] = [];

  ngOnInit(): void {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.reduced.set(reduced);
    this.phase.set('running');

    if (reduced) {
      // The finished wordmark, held still. No pull, no dive, no light.
      this.pulled.set(true);
      this.after(1500, () => this.complete());
      return;
    }

    this.after(300, () => this.showSkip.set(true));
    this.after(T.pull, () => this.pulled.set(true));
    this.after(T.sting, () => this.introSvc.playSting());
    this.after(T.dive, () => this.diving.set(true));
    this.after(T.end, () => this.complete());
  }

  ngOnDestroy(): void {
    this.timers.forEach(clearTimeout);
  }

  armSound(event: Event): void {
    event.stopPropagation();
    const wasArmed = this.introSvc.soundArmed();
    this.introSvc.arm();
    if (!wasArmed) this.introSvc.playSting();
  }

  skip(): void {
    if (this.phase() === 'leaving') return;
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.complete();
  }

  onHostClick(): void {
    this.introSvc.arm();
  }

  private complete(): void {
    if (this.phase() === 'leaving') return;
    this.phase.set('leaving');
    this.introSvc.markSeen();
    this.after(420, () => this.finished.emit());
  }

  private after(ms: number, fn: () => void): void {
    this.timers.push(window.setTimeout(fn, ms));
  }
}
