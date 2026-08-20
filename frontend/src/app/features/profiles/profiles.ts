import { ChangeDetectionStrategy, Component, output } from '@angular/core';

export interface Profile {
  key: string;
  name: string;
  blurb: string;
  route: string;
  /** Deterministic tile colour, so each profile reads as its own thing. */
  hue: number;
}

/**
 * Netflix's "Who's watching?", shown once the title sequence finishes.
 *
 */
@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.html',
  styleUrl: './profiles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profiles {
  readonly chosen = output<Profile>();

  readonly profiles: Profile[] = [
    {
      key: 'coding',
      name: 'Coding',
      blurb: 'Projects, systems, and the things that ship',
      route: '/',
      hue: 6,
    },
    {
      key: 'extracurricular',
      name: 'Extracurricular',
      blurb: 'Competitions, communities, and volunteering',
      route: '/extracurricular',
      hue: 205,
    },
    {
      key: 'hobbies',
      name: 'Hobbies',
      blurb: 'What I do when nothing is compiling',
      route: '/hobbies',
      hue: 42,
    },
  ];

  select(profile: Profile): void {
    // Deliberately does not arm audio: the sting belongs to the title sequence,
    // and firing it on this click would land it minutes late.
    // Navigation is the shell's job — it has to mount the outlet first, or the
    // route would resolve into nothing.
    this.chosen.emit(profile);
  }
}
