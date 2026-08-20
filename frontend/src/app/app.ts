import {
  ChangeDetectionStrategy, Component, HostListener, OnInit, inject, signal,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { IntroService } from './core/services/intro.service';
import { NavigationLoader } from './core/services/navigation.service';
import { Intro } from './features/intro/intro';
import { Profiles, Profile } from './features/profiles/profiles';
import { Nav } from './shared/components/nav/nav';
import { Loader } from './shared/components/loader/loader';

const PROFILE_KEY = 'amartya_profile';

/**
 * Orchestrates what the visitor sees before the site itself:
 *
 *   title sequence -> profile picker -> the chosen section
 *
 * The router's initial navigation is disabled, so no route resolves and no data
 * is fetched until a profile is picked. Previously the outlet sat outside the
 * gate: the home page mounted and loaded underneath the intro, which is why a
 * frame of it flashed before the picker appeared.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Intro, Profiles, Nav, Loader],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private readonly introSvc = inject(IntroService);
  private readonly nav = inject(NavigationLoader);
  private readonly router = inject(Router);

  readonly showIntro = signal(false);
  readonly showProfiles = signal(false);
  /** True once a profile is chosen and the site proper may render. */
  readonly entered = signal(false);

  readonly loading = this.nav.visible;
  readonly loadingMessage = this.nav.message;

  ngOnInit(): void {
    this.nav.init();

    const deepLink = window.location.pathname;
    const isDeepLink = deepLink !== '/' && deepLink !== '';

    // A shared link should open what it points at. Making someone sit through a
    // title sequence and a picker to reach a URL they already chose is hostile,
    // so deep links bypass both.
    if (isDeepLink || this.hasProfile()) {
      this.enter(deepLink);
      return;
    }

    if (this.introSvc.shouldPlay()) {
      this.showIntro.set(true);
    } else {
      this.showProfiles.set(true);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showIntro()) this.onIntroFinished();
  }

  onIntroFinished(): void {
    this.introSvc.markSeen();
    this.showIntro.set(false);
    this.showProfiles.set(true);
  }

  onProfileChosen(profile: Profile): void {
    try {
      sessionStorage.setItem(PROFILE_KEY, profile.key);
    } catch {
      /* private mode — the picker simply shows again next load */
    }
    this.showProfiles.set(false);
    this.enter(profile.route);
  }

  /** Render the shell and run the navigation the router was holding back. */
  private enter(url: string): void {
    this.entered.set(true);
    void this.router.navigateByUrl(url);
  }

  private hasProfile(): boolean {
    try {
      return !!sessionStorage.getItem(PROFILE_KEY);
    } catch {
      return false;
    }
  }
}
