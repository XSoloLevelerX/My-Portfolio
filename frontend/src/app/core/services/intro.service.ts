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
 *  1. The element is started muted and looping at construction, which every
 *     browser permits, and is left *playing* rather than paused. Unmuting an
 *     element that is still playing is not gated the way a fresh play() is,
 *     so the sting can be heard with no interaction — but only as long as it
 *     is never paused in between, which is what made the previous version of
 *     this silent: it primed muted, then paused, so the later unmute needed a
 *     fresh play() and got refused.
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
   * Start the element playing *muted* immediately, and leave it playing.
   *
   * Chrome refuses unmuted autoplay outright (NotAllowedError), but muted
   * autoplay is always permitted, and the autoplay policy gates play() rather
   * than the muted property. So the element is already running by the time the
   * sting is due, and unmuting it then produces sound without a gesture —
   * provided it is never paused in between, since pausing forces the next
   * unmute through a fresh, gated play() call. It loops so a slow-to-start
   * intro never lets it play out to the end in silence first.
   */
  private prime(): void {
    if (typeof window === 'undefined' || !this.shouldPlay()) return;
    try {
      const el = new Audio(STING_SRC);
      el.preload = 'auto';
      el.volume = 0.9;
      el.muted = true;
      el.loop = true;
      this.sting = el;
      el.load();
      el.play().catch(() => {
        /* even muted playback refused — the gesture path still covers it */
      });
    } catch {
      /* audio unavailable — the animation still runs silently */
    }
  }

  /**
   * Called on any interaction *during* the title sequence. Only does work if
   * autoplay was refused earlier, in which case the sting fires now.
   */
  arm(): void {
    if (!this.pending) return;
    this.pending = false;
    this.playSting();
  }

  /**
   * The sting belongs to the animation. Once that is over, a queued one is
   * dropped rather than firing against whatever is on screen next — a sting
   * landing on the profile picker is worse than no sting at all.
   */
  expire(): void {
    this.pending = false;
    this.sting?.pause();
  }

  /** The sting. Plays outright rather than waiting to be unlocked. */
  playSting(): void {
    const el = this.sting;
    if (!el) {
      this.playSynthesised();
      return;
    }

    el.loop = false;
    el.currentTime = 0;

    if (!el.paused) {
      // Still running from the muted prime — just reveal it. No play() call
      // here, since that is exactly what would put it back under the gate.
      el.muted = false;
      this.soundArmed.set(true);
      return;
    }

    // The muted prime never got going (autoplay refused even muted). This is
    // a fresh play() call, so it only succeeds inside a user gesture.
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
