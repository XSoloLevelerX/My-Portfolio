import {
  ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit,
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
/** Letters, and the cascade that brings them in. Mirrored exactly in the CSS. */
const LETTER_TRANSITION = 1250;
const LETTER_STAGGER = 115;

/**
 * Measured from the file, not guessed: intro-sting.mp3 is silent for its first
 * 300ms, rises through 0.35s, and peaks at 0.45s (amplitude 0.58), decaying to
 * nothing by 3.37s. Playback therefore has to begin 450ms *before* the moment
 * the hit should land, so the loudest instant — not just the onset — lands on
 * the beat.
 */
const STING_LEAD_IN = 450;

/**
 * Paced to be read, not rushed. The unfurl runs 1250ms per letter on a 115ms
 * cascade, so the last letter lands ~1950ms after it starts; every beat after
 * that waits for it.
 */
const GROW_AT = 1400;

/** The instant the name is fully formed — the last letter's transition ending. */
const WORDMARK_COMPLETE = GROW_AT + LETTER_STAGGER * 6 + LETTER_TRANSITION;

const T = {
  /** The lone A rides forward at centre. */
  open: 200,
  /** The rest of the name follows it out of the depth. */
  grow: GROW_AT,
  tagline: 3450,
  /**
   * Started early by exactly the file's lead-in, so the hit lands on the frame
   * the wordmark completes rather than drifting somewhere after it. Its 2.5s
   * decay then carries through the hold and into the dive.
   */
  sting: WORDMARK_COMPLETE - STING_LEAD_IN,
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
  readonly reduced = signal(false);

  readonly opened = signal(false);
  readonly diving = signal(false);
  readonly taglineIn = signal(false);
  /** The name is unfurling. One flag, because it is one motion. */
  readonly grown = signal(false);

  readonly letters = NAME.split('').map((char, i) => ({ char, i }));

  /**
   * Colour bars the dive passes through. Thin, and they stay thin.
   *
   * The hue cycles roughly three times across the rack rather than ramping once
   * from warm to cool. A single ramp looks right while the rack is dense, but
   * once the gaps open only the middle slice is still on screen — and that
   * slice is one colour. Cycling keeps warm and cool in view at any zoom.
   */
  readonly bars = Array.from({ length: 84 }, (_, i) => {
    const cycles = 3.4;
    const t = ((i / 84) * cycles) % 1;
    const hue = t < 0.5 ? t * 2 * 58 : 188 + (t - 0.5) * 2 * 148;
    const seed = ((i * 2654435761) % 1000) / 1000;
    return {
      i,
      hue: Math.round(hue),
      light: 45 + Math.round(seed * 22),
      width: (0.1 + seed * 0.38).toFixed(2),
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
    this.after(T.grow, () => this.grown.set(true));
    this.after(T.tagline, () => this.taglineIn.set(true));
    this.after(T.sting, () => this.introSvc.playSting());
    this.after(T.dive, () => this.diving.set(true));
    this.after(T.end, () => this.complete());
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  onHostClick(): void {
    this.introSvc.arm();
  }

  /**
   * There is no mute control, so audio arms on the first interaction of any
   * kind. Browsers refuse to play sound before a gesture, and without a button
   * this is the only remaining way to satisfy that.
   */
  @HostListener('document:pointerdown')
  @HostListener('document:touchstart')
  @HostListener('document:keydown')
  onFirstGesture(): void {
    this.introSvc.arm();
  }

  private clearTimers(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  private complete(): void {
    if (this.phase() === 'leaving') return;
    this.phase.set('leaving');
    // Deliberately not calling markSeen() here: it unmounts this component
    // straight away, which clears the timer below before it can fire. The
    // parent marks it seen once `finished` has actually been emitted.
    this.after(620, () => this.finished.emit());
  }

  private after(ms: number, fn: () => void): void {
    this.timers.push(window.setTimeout(fn, ms));
  }
}
