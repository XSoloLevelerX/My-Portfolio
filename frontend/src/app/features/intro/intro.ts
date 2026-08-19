import {
  ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit,
  inject, output, signal, viewChild,
} from '@angular/core';
import { IntroService } from '../../core/services/intro.service';

/** Phase boundaries in ms. Mirrors the table in the plan. */
const T = {
  ignition: 0,
  converge: 600,
  crossbar: 1100,   // the sting lands here
  unfold: 1500,
  dock: 2400,
  end: 3050,
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

  /** 24 bars — the ignition sweep. */
  readonly bars = Array.from({ length: 24 }, (_, i) => i);

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
    this.after(T.crossbar, () => this.introSvc.playSting());
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
