import {
  ChangeDetectionStrategy, Component, OnDestroy, OnInit,
  computed, inject, output, signal,
} from '@angular/core';
import { IntroService } from '../../core/services/intro.service';

/**
 * Timeline, in ms. Matches the CSS in intro.scss: the strokes are brushed in,
 * the roles land, then the zoom swallows the screen.
 */
const T = {
  /** The crossbar completes here — where the sting belongs. */
  sting: 1900,
  /**
   * The A stops being a standalone mark and becomes the first letter of the
   * wordmark. It shrinks into place while the rest types beside it — the two
   * happen together, which is what sells it as one movement rather than two.
   */
  transform: 2000,
  /** Per-character typing interval. */
  typeStep: 62,
  end: 5200,
} as const;

/** The A is already on screen, so only the remainder is typed. */
const REMAINDER = "MARTYA'S WORKSHOP";

@Component({
  selector: 'app-intro',
  templateUrl: './intro.html',
  styleUrl: './intro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Intro implements OnInit, OnDestroy {
  private readonly introSvc = inject(IntroService);

  /** Emitted once the intro has finished or been skipped. */
  readonly finished = output<void>();

  readonly phase = signal<'idle' | 'running' | 'leaving'>('idle');
  readonly soundArmed = this.introSvc.soundArmed;
  readonly showSkip = signal(false);
  readonly reduced = signal(false);

  /** Three strokes: two legs and a crossbar. */
  readonly helpers = [1, 2, 3];
  /** Brush strands and lamps, per the ported engine. */
  readonly furs = Array.from({ length: 31 }, (_, i) => i + 1);
  readonly lamps = Array.from({ length: 28 }, (_, i) => i + 1);

  /** Characters typed so far, and whether the wordmark has settled. */
  readonly typed = signal('');
  readonly transformed = signal(false);
  readonly typingDone = computed(() => this.typed().length === REMAINDER.length);

  private typer?: number;

  private timers: number[] = [];

  ngOnInit(): void {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.reduced.set(reduced);

    if (reduced) {
      // The finished wordmark, held still. Same design, no theatre.
      this.phase.set('running');
      this.transformed.set(true);
      this.typed.set(REMAINDER);
      this.after(1400, () => this.complete());
      return;
    }

    this.phase.set('running');
    this.after(300, () => this.showSkip.set(true));
    this.after(T.sting, () => this.introSvc.playSting());
    // Shrink and type start on the same tick, so the A settling and the word
    // appearing read as a single movement.
    this.after(T.transform, () => {
      this.transformed.set(true);
      this.startTyping();
    });
    this.after(T.end, () => this.complete());
  }

  ngOnDestroy(): void {
    this.timers.forEach(clearTimeout);
    if (this.typer) clearInterval(this.typer);
  }

  private startTyping(): void {
    let i = 0;
    this.typer = window.setInterval(() => {
      i += 1;
      this.typed.set(REMAINDER.slice(0, i));
      if (i >= REMAINDER.length && this.typer) {
        clearInterval(this.typer);
        this.typer = undefined;
      }
    }, T.typeStep);
  }

  /** Any click both arms audio and, on the sound chip, replays the sting. */
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
    if (this.typer) { clearInterval(this.typer); this.typer = undefined; }
    this.complete();
  }

  /** Esc skips; any other interaction arms audio for the rest of the session. */
  onHostClick(): void {
    this.introSvc.arm();
  }

  private complete(): void {
    if (this.phase() === 'leaving') return;
    this.phase.set('leaving');
    this.introSvc.markSeen();
    this.after(360, () => this.finished.emit());
  }

  private after(ms: number, fn: () => void): void {
    this.timers.push(window.setTimeout(fn, ms));
  }
}
