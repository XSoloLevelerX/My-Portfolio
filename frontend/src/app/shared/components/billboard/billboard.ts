import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Project, complexityBadge, DOMAIN_LABEL } from '../../../core/models/project.model';

@Component({
  selector: 'app-billboard',
  templateUrl: './billboard.html',
  styleUrl: './billboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Billboard {
  readonly project = input.required<Project>();

  readonly badge = computed(() => complexityBadge(this.project().complexity));
  readonly domainLabel = computed(() => DOMAIN_LABEL[this.project().domain]);
  readonly year = computed(() => this.project().releasedAt?.slice(0, 4) ?? '');

  /**
   * Artwork is generated from the slug until real posters exist, so the billboard
   * is never an empty grey box. Deterministic: the same project always gets the
   * same hue, which makes it feel authored rather than random.
   */
  readonly hue = computed(() => {
    const s = this.project().slug;
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return h;
  });

  readonly monogram = computed(() => this.project().title.charAt(0).toUpperCase());
}
