import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { Project, complexityBadge } from '../../../core/models/project.model';

@Component({
  selector: 'app-card',
  templateUrl: './card.html',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card {
  readonly project = input.required<Project>();

  readonly open = output<Project>();
  readonly playLive = output<Project>();

  /** Local-only, like Netflix's row-level toggles. Nothing is persisted yet. */
  readonly saved = signal(false);
  readonly liked = signal(false);

  readonly badge = computed(() => complexityBadge(this.project().complexity));
  readonly year = computed(() => this.project().releasedAt?.slice(0, 4) ?? '');

  /**
   * Netflix's "% match". Derived from the same signals the shelf already ranks
   * on — featured, reachable, recent — so it is a real readout rather than a
   * random number dressed up as one.
   */
  readonly match = computed(() => {
    const p = this.project();
    let score = 62;
    if (p.featured) score += 16;
    if (p.liveUrl) score += 10;
    if (p.repoUrl) score += 4;
    score += Math.min(8, p.complexity * 3);
    return Math.min(98, score);
  });

  /** Same deterministic hue as the billboard, so a project looks like itself everywhere. */
  readonly hue = computed(() => {
    const s = this.project().slug;
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return h;
  });

  readonly monogram = computed(() => this.project().title.charAt(0).toUpperCase());

  onOpen(): void {
    this.open.emit(this.project());
  }

  onPlay(event: Event): void {
    event.stopPropagation();
    this.playLive.emit(this.project());
  }

  onSave(event: Event): void {
    event.stopPropagation();
    this.saved.update(v => !v);
  }

  onLike(event: Event): void {
    event.stopPropagation();
    this.liked.update(v => !v);
  }
}
