import {
  ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit,
  inject, output, signal, viewChild,
} from '@angular/core';
import { IntroService } from '../../core/services/intro.service';

/**
 * Timeline, in ms. Matches the CSS in intro.scss: the strokes are brushed in,
 * the roles land, then the zoom swallows the screen.
 */
const T = {
  /** The crossbar completes here — where the sting belongs. */
  sting: 1900,
  /** Zoom starts; CSS holds it back until the letter is legible. */
  zoom: 3200,
  end: 4500,
} as const;

@Component({
  selector: 'app-intro',
  templateUrl: './intro.html',
  styleUrl: './intro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Intro implements OnInit, OnDestroy {
  private readonly introSvc = inject(IntroService);
  private readonly host = inject(ElementRef<HTMLElement>);

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

  private timers: number[] = [];

  ngOnInit(): void {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.reduced.set(reduced);

    if (reduced) {
      // Static A + labels, no motion, no sound. Still reads as a deliberate title card.
      this.phase.set('running');
      this.after(900, () => this.complete());
      return;
    }

    this.phase.set('running');
    this.after(300, () => this.showSkip.set(true));
    this.after(T.sting, () => this.introSvc.playSting());
    this.after(T.end, () => this.complete());
  }

  ngOnDestroy(): void {
    this.timers.forEach(clearTimeout);
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
