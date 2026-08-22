import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Page } from '../../shared/components/page/page';

@Component({
  selector: 'app-about',
  imports: [Page, RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  /** Drawn from src/content/extracurricular — kept in sync by hand, since this
   *  page picks a subset rather than listing everything. */
  readonly beyondCode = [
    { title: 'Hackathons', blurb: 'Building something real in 36 hours, then defending it.' },
    { title: 'Open Source', blurb: 'Publishing the tools rather than keeping them local.' },
    { title: 'Mentoring', blurb: 'Walking juniors through their first real codebase.' },
    { title: 'College Tech Events', blurb: 'Organising and presenting at campus technical sessions.' },
  ];

  /** Drawn from src/content/hobbies, same reasoning. */
  readonly offTheClock = [
    { title: 'Formula 1', blurb: 'Strategy, telemetry, and arguing about pit windows.' },
    { title: 'Chess', blurb: 'Losing on time in otherwise winning positions.' },
    { title: 'Anime', blurb: 'Long-form stories that commit to their premise.' },
    { title: 'Music', blurb: 'What is playing while the tests run.' },
  ];

  /** Drops the headshot quietly if the file hasn't been added to public/about yet. */
  hidePhoto(event: Event): void {
    (event.target as HTMLElement).style.display = 'none';
  }
}
