import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { IntroService } from '../../core/services/intro.service';

export interface Profile {
  key: string;
  name: string;
  blurb: string;
  route: string;
  /** Deterministic tile colour, so each profile reads as its own thing. */
  hue: number;
  initial: string;
}

/**
 * Netflix's "Who's watching?", shown once the title sequence finishes.
 *
 * It also does real work beyond the theatre: picking a profile is a genuine user
 * gesture, which is what unlocks audio in browsers that refused the sting on a
 * cold load.
 */
@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.html',
  styleUrl: './profiles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profiles {
  private readonly router = inject(Router);
  private readonly introSvc = inject(IntroService);

  readonly chosen = output<Profile>();

  readonly profiles: Profile[] = [
    {
      key: 'coding',
      name: 'Coding',
      blurb: 'Projects, systems, and the things that ship',
      route: '/',
      hue: 6,
      initial: 'C',
    },
    {
      key: 'extracurricular',
      name: 'Extracurricular',
      blurb: 'Competitions, communities, and volunteering',
      route: '/extracurricular',
      hue: 205,
      initial: 'E',
    },
    {
      key: 'hobbies',
      name: 'Hobbies',
      blurb: 'What I do when nothing is compiling',
      route: '/hobbies',
      hue: 42,
      initial: 'H',
    },
  ];

  select(profile: Profile): void {
    // A real click, so anything the browser refused to autoplay can run now.
    this.introSvc.arm();
    this.chosen.emit(profile);
    void this.router.navigateByUrl(profile.route);
  }
}
