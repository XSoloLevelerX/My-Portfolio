import {
  ChangeDetectionStrategy, Component, HostListener, computed, effect, input, output,
} from '@angular/core';
import { Project, complexityBadge, DOMAIN_LABEL } from '../../../core/models/project.model';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  readonly project = input<Project | null>(null);

  readonly close = output<void>();
  readonly clickLive = output<Project>();
  readonly clickRepo = output<Project>();

  readonly badge = computed(() => {
    const p = this.project();
    return p ? complexityBadge(p.complexity) : '';
  });

  readonly domainLabel = computed(() => {
    const p = this.project();
    return p ? DOMAIN_LABEL[p.domain] : '';
  });

  readonly year = computed(() => this.project()?.releasedAt?.slice(0, 4) ?? '');

  readonly hue = computed(() => {
    const s = this.project()?.slug ?? '';
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return h;
  });

  readonly monogram = computed(() => this.project()?.title.charAt(0).toUpperCase() ?? '');

  constructor() {
    // The page behind must not scroll while the modal owns the screen.
    effect(() => {
      document.body.style.overflow = this.project() ? 'hidden' : '';
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.project()) this.close.emit();
  }
}
