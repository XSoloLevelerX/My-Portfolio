import { Injectable, signal } from '@angular/core';

const SEEN_KEY = 'amartya_intro_seen';
const STING_SRC = '/audio/intro-sting.mp3';

/**
 * Owns intro playback state and the sting.
 *
 * Sound is on by default: the audio element is created and primed as soon as the
 * service is constructed, and playback is attempted without waiting for a click.
 *
 * Browsers will still refuse unmuted autoplay on a cold first visit — that is a
 * platform policy, not something code can opt out of. So there are two nets
 * under it: a pending flag that fires the sting the instant any interaction
 * happens, and a synthesised two-note hit if the file itself cannot be played.
 * The visitor never has to press anything, and there is no mute control to press.
 */
@Injectable({ providedIn: 'root' })
export class IntroService {
  /** Whether the intro should run at all this session. */
  readonly shouldPlay = signal(!this.alreadySeen());
  /** True once audio has actually produced sound. */
  readonly soundArmed = signal(false);

  private ctx?: AudioContext;
  private sting?: HTMLAudioElement;
  /** Set when autoplay was refused, so the next gesture plays it immediately. */
  private pending = false;

  constructor() {
    this.prime();
  }

  private alreadySeen(): boolean {
    try {
      return sessionStorage.getItem(SEEN_KEY) === '1';
    } catch {
      return false; // private mode — just play it
    }
  }

  markSeen(): void {
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* non-fatal */
    }
    this.shouldPlay.set(false);
  }

  /** Build the audio element up front so playback needs no further setup. */
  private prime(): void {
    if (typeof window === 'undefined') return;
    try {
      this.sting = new Audio(STING_SRC);
      this.sting.preload = 'auto';
      this.sting.volume = 0.9;
      this.sting.load();
    } catch {
      /* audio unavailable — the animation still runs silently */
    }
  }

  /**
   * Called on any interaction. Only does work if autoplay was refused earlier,
   * in which case the sting fires now.
   */
  arm(): void {
    if (!this.pending) return;
    this.pending = false;
    this.playSting();
  }

  /** The sting. Attempts playback outright rather than waiting to be unlocked. */
  playSting(): void {
    if (this.sting) {
      this.sting.currentTime = 0;
      this.sting
        .play()
        .then(() => this.soundArmed.set(true))
        .catch(() => {
          // Autoplay refused. Try the synthesised hit, and queue the file for
          // the first gesture in case that is refused too.
          this.pending = true;
          this.playSynthesised();
        });
      return;
    }
    this.playSynthesised();
  }

  /** Two notes and a bell, generated in-browser. The fallback path. */
  private playSynthesised(): void {
    try {
      if (!this.ctx) {
        const Ctor = window.AudioContext ?? (window as unknown as {
          webkitAudioContext?: typeof AudioContext;
        }).webkitAudioContext;
        if (!Ctor) return;
        this.ctx = new Ctor();
      }
      const ctx = this.ctx;
      void ctx.resume();
      if (ctx.state !== 'running') return;

      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);

      this.note(ctx, master, { freq: 146.83, at: now, dur: 0.2, peak: 0.9, type: 'triangle' });
      this.note(ctx, master, { freq: 73.42, at: now + 0.22, dur: 1.05, peak: 1.0, type: 'sine' });
      this.note(ctx, master, { freq: 146.83, at: now + 0.22, dur: 0.85, peak: 0.35, type: 'sine' });
      this.note(ctx, master, { freq: 880, at: now + 0.24, dur: 0.5, peak: 0.08, type: 'sine' });

      this.soundArmed.set(true);
      window.setTimeout(() => master.disconnect(), 1600);
    } catch {
      /* nothing further to fall back to */
    }
  }

  private note(
    ctx: AudioContext,
    dest: AudioNode,
    o: { freq: number; at: number; dur: number; peak: number; type: OscillatorType },
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = o.type;
    osc.frequency.setValueAtTime(o.freq, o.at);

    // Fast attack, exponential decay — reads as a struck instrument, not a beep.
    gain.gain.setValueAtTime(0.0001, o.at);
    gain.gain.exponentialRampToValueAtTime(o.peak, o.at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, o.at + o.dur);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(o.at);
    osc.stop(o.at + o.dur + 0.05);
  }
}
