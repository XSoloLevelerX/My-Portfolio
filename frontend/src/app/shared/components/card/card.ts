import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
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

  readonly badge = computed(() => complexityBadge(this.project().complexity));
  readonly year = computed(() => this.project().releasedAt?.slice(0, 4) ?? '');

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
}
