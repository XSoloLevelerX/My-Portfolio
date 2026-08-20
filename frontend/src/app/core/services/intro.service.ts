import { Injectable, signal } from '@angular/core';

const SEEN_KEY = 'amartya_intro_seen';
const STING_SRC = '/audio/intro-sting.mp3';

/**
 * Owns intro playback state and the sting.
 *
 * Sound is on by default: the audio element is created and primed as soon as the
 * service is constructed, and playback is attempted without waiting for a click.
 *
 * Three paths, in order of preference:
 *
 *  1. The element is started muted at construction, which every browser permits,
 *     then paused at time 0. Unmuting an already-played element is not gated the
 *     way a fresh play() is, so the sting can be heard with no interaction.
 *  2. If that is refused, the first pointer, key or touch event plays it.
 *  3. If the file cannot play at all, a synthesised two-note hit covers it.
 *
 * What no code can do is force unmuted audio on a cold visit in Chrome: play()
 * rejects with NotAllowedError and that is deliberate platform policy. Path 2
 * makes that gap as small as one click.
 */
@Injectable({ providedIn: 'root' })
export class IntroService {
  /** Whether the intro should run at all this session. */
  readonly shouldPlay = signal(!this.alreadySeen());
  /** True once audio has actually produced sound. */
  readonly soundArmed = signal(false);

  private ctx?: AudioContext;
  private sting?: HTMLAudioElement;
  /** Set when playback was refused, so the next gesture plays it immediately. */
  private pending = false;
  /**
   * True once the sting has actually been asked for. The muted prime resolves
   * asynchronously and then pauses the element; without this guard that pause
   * can land *after* real playback has started and silence it.
   */
  private requested = false;

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

  /**
   * Start the element playing *muted* immediately.
   *
   * Chrome refuses unmuted autoplay outright (NotAllowedError), but muted
   * autoplay is always permitted, and the autoplay policy gates play() rather
   * than the muted property. So the element is already running by the time the
   * sting is due, and unmuting it then produces sound without a gesture.
   *
   * It is held at time 0 and paused once primed, so nothing is heard early.
   */
  private prime(): void {
    if (typeof window === 'undefined') return;
    try {
      const el = new Audio(STING_SRC);
      el.preload = 'auto';
      el.volume = 0.9;
      el.muted = true;
      this.sting = el;
      el.load();

      el.play()
        .then(() => {
          // Do not touch the element if the sting has already been requested.
          if (this.requested) return;
          el.pause();
          el.currentTime = 0;
        })
        .catch(() => {
          /* even muted playback refused — the gesture path still covers it */
        });
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

  /** The sting. Plays outright rather than waiting to be unlocked. */
  playSting(): void {
    this.requested = true;
    const el = this.sting;
    if (!el) {
      this.playSynthesised();
      return;
    }

    el.currentTime = 0;
    // Unmuting an element that has already played is not gated by the autoplay
    // policy the way a fresh play() is, so this is what makes it audible with
    // no interaction at all.
    el.muted = false;

    el.play()
      .then(() => this.soundArmed.set(true))
      .catch(() => {
        // Refused anyway. Queue it for the first gesture and cover the gap with
        // the synthesised hit.
        this.pending = true;
        this.playSynthesised();
      });
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
