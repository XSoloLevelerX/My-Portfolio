import {
  ChangeDetectionStrategy, Component, OnDestroy, OnInit,
  computed, inject, output, signal,
} from '@angular/core';
import { IntroService } from '../../core/services/intro.service';


/**
 * The title sequence, in four beats:
 *
 *   FORM  the A is drawn on, filling the screen
 *   TYPE  the camera pulls back while the rest of the name draws itself on,
 *         one letter at a time
 *   HOLD  the wordmark sits
 *   DIVE  the camera travels into the R's stem, through the colour bars, and
 *         lands on the page
 *
 * These timings mirror the CSS; changing one without the other desyncs it.
 */
const NAME = 'AMARTYA';
/** The R, whose stem the camera dives into. */
const DIVE_INDEX = 3;

/**
 * Paced to be read, not rushed. Each beat is given time to settle before the
 * next begins, and the CSS durations are long enough that nothing snaps.
 */
/**
 * Paced to be read, not rushed. The unfurl runs 1250ms per letter on a 115ms
 * cascade, so the last letter lands ~1950ms after it starts; every beat after
 * that waits for it.
 */
const T = {
  /** The lone A rides forward at centre. */
  open: 200,
  /** The rest of the name follows it out of the depth. */
  grow: 1400,
  tagline: 3450,
  sting: 3600,
  /** A real hold on the finished wordmark before the camera moves. */
  dive: 4800,
  end: 6700,
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

  readonly opened = signal(false);
  readonly diving = signal(false);
  readonly taglineIn = signal(false);
  /** The name is unfurling. One flag, because it is one motion. */
  readonly grown = signal(false);

  readonly letters = NAME.split('').map((char, i) => ({ char, i }));

  /** Colour bars the dive passes through. Thin, and they stay thin. */
  readonly bars = Array.from({ length: 68 }, (_, i) => {
    const t = i / 67;
    const hue = t < 0.48 ? t * 115 : 185 + (t - 0.48) * 260;
    const seed = ((i * 2654435761) % 1000) / 1000;
    return {
      i,
      hue: Math.round(hue),
      light: 45 + Math.round(seed * 22),
      width: (0.1 + seed * 0.42).toFixed(2),
      delay: Math.round(seed * 180),
      dim: seed < 0.28,
    };
  });

  /**
   * The R's stem as a percentage across the name — the dive pivot. Derived from
   * the letter's index rather than hard-coded, so editing the name cannot leave
   * the camera aimed at empty space. The stem sits at the left of the glyph,
   * hence the 0.22 rather than 0.5.
   */
  readonly divePoint = computed(
    () => ((DIVE_INDEX + 0.22) / NAME.length) * 100,
  );

  private timers: number[] = [];

  ngOnInit(): void {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.reduced.set(reduced);
    this.phase.set('running');

    if (reduced) {
      // The finished wordmark, held still. No growth, no dive.
      this.opened.set(true);
      this.grown.set(true);
      this.taglineIn.set(true);
      this.after(1600, () => this.complete());
      return;
    }

    this.after(120, () => this.opened.set(true));
    this.after(300, () => this.showSkip.set(true));
    this.after(T.grow, () => this.grown.set(true));
    this.after(T.tagline, () => this.taglineIn.set(true));
    this.after(T.sting, () => this.introSvc.playSting());
    this.after(T.dive, () => this.diving.set(true));
    this.after(T.end, () => this.complete());
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  armSound(event: Event): void {
    event.stopPropagation();
    const wasArmed = this.introSvc.soundArmed();
    this.introSvc.arm();
    if (!wasArmed) this.introSvc.playSting();
  }

  skip(): void {
    if (this.phase() === 'leaving') return;
    this.clearTimers();
    this.complete();
  }

  onHostClick(): void {
    this.introSvc.arm();
  }

  private clearTimers(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  private complete(): void {
    if (this.phase() === 'leaving') return;
    this.phase.set('leaving');
    this.introSvc.markSeen();
    this.after(620, () => this.finished.emit());
  }

  private after(ms: number, fn: () => void): void {
    this.timers.push(window.setTimeout(fn, ms));
  }
}
