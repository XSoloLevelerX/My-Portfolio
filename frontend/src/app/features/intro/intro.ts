import {
  ChangeDetectionStrategy, Component, OnDestroy, OnInit,
  computed, inject, output, signal,
} from '@angular/core';
import { IntroService } from '../../core/services/intro.service';
import { WORDMARK, DIVE_INDEX } from './letterforms';

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
const T = {
  form: 0,
  pull: 1500,
  /** Interval between letters as the name types out. */
  typeStep: 105,
  sting: 2450,
  dive: 3300,
  end: 4550,
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

  readonly pulled = signal(false);
  readonly diving = signal(false);
  /** How many letters have been drawn on. Starts at the lone A. */
  readonly shown = signal(1);

  readonly glyphs = WORDMARK;

  /** Colour bars the dive passes through. */
  readonly bars = Array.from({ length: 46 }, (_, i) => {
    const t = i / 45;
    const hue = t < 0.48 ? t * 115 : 185 + (t - 0.48) * 260;
    const seed = ((i * 2654435761) % 1000) / 1000;
    return {
      i,
      hue: Math.round(hue),
      light: 45 + Math.round(seed * 22),
      width: (0.4 + seed * 2.2).toFixed(2),
      delay: Math.round(seed * 180),
      dim: seed < 0.28,
    };
  });

  /** Total advance of the word, in grid units. */
  private readonly total = WORDMARK.reduce((sum, g) => sum + g.w, 0);

  /** Centre of the first A, as a percentage of the word — the pull-back pivot. */
  readonly firstCentre = computed(() =>
    ((WORDMARK[0].w / 2) / this.total) * 100,
  );

  /**
   * The R's stem, as a percentage of the word — the dive pivot. Derived from
   * the glyph metrics rather than hard-coded, so editing the name cannot leave
   * the camera aimed at the wrong place.
   */
  readonly divePoint = computed(() => {
    const before = WORDMARK.slice(0, DIVE_INDEX).reduce((s, g) => s + g.w, 0);
    // The stem sits ~0.16 of the way across the R's own grid.
    return ((before + 0.16) / this.total) * 100;
  });

  private timers: number[] = [];
  private typer?: number;

  ngOnInit(): void {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.reduced.set(reduced);
    this.phase.set('running');

    if (reduced) {
      // The finished wordmark, held still. No pull, no typing, no dive.
      this.pulled.set(true);
      this.shown.set(WORDMARK.length);
      this.after(1500, () => this.complete());
      return;
    }

    this.after(300, () => this.showSkip.set(true));
    this.after(T.pull, () => {
      this.pulled.set(true);
      this.startTyping();
    });
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

  /** Draws the remaining letters on, one at a time. */
  private startTyping(): void {
    this.typer = window.setInterval(() => {
      const next = this.shown() + 1;
      this.shown.set(next);
      if (next >= WORDMARK.length && this.typer) {
        clearInterval(this.typer);
        this.typer = undefined;
      }
    }, T.typeStep);
  }

  private clearTimers(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    if (this.typer) {
      clearInterval(this.typer);
      this.typer = undefined;
    }
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
