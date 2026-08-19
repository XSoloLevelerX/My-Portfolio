import { Injectable, signal } from '@angular/core';

const SEEN_KEY = 'amartya_intro_seen';

/**
 * Owns intro playback state and the signature sound.
 *
 * The sound is synthesised in-browser with WebAudio — two notes and a bell, about
 * 1.2s. No audio file is shipped, which means zero bytes on the wire and no
 * licensing exposure from imitating a well-known sting.
 *
 * Browsers block audio until a user gesture, so the animation always plays silently
 * and the sound only fires once `arm()` has been called from a real interaction.
 */
@Injectable({ providedIn: 'root' })
export class IntroService {
  /** Whether the intro should run at all this session. */
  readonly shouldPlay = signal(!this.alreadySeen());
  /** Whether audio has been unlocked by a user gesture. */
  readonly soundArmed = signal(false);

  private ctx?: AudioContext;

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

  /** Unlock audio. Must be called from a user gesture handler. */
  arm(): void {
    if (this.soundArmed()) return;
    try {
      const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      void this.ctx.resume();
      this.soundArmed.set(true);
    } catch {
      /* audio unavailable — animation still runs silently */
    }
  }

  /** The TA-DUM. No-op unless armed. */
  playSting(): void {
    const ctx = this.ctx;
    if (!ctx || !this.soundArmed()) return;

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);

    // "TA" — short, punchy
    this.note(ctx, master, { freq: 146.83, at: now, dur: 0.2, peak: 0.9, type: 'triangle' });
    // "DUM" — low and sustained, with an octave above for body
    this.note(ctx, master, { freq: 73.42, at: now + 0.22, dur: 1.05, peak: 1.0, type: 'sine' });
    this.note(ctx, master, { freq: 146.83, at: now + 0.22, dur: 0.85, peak: 0.35, type: 'sine' });
    // Amber shimmer on the crossbar
    this.note(ctx, master, { freq: 880, at: now + 0.24, dur: 0.5, peak: 0.08, type: 'sine' });

    window.setTimeout(() => master.disconnect(), 1600);
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

    // Fast attack, exponential decay — reads as a struck instrument rather than a beep.
    gain.gain.setValueAtTime(0.0001, o.at);
    gain.gain.exponentialRampToValueAtTime(o.peak, o.at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, o.at + o.dur);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(o.at);
    osc.stop(o.at + o.dur + 0.05);
  }
}
