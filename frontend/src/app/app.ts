import { ChangeDetectionStrategy, Component, HostListener, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IntroService } from './core/services/intro.service';
import { NavigationLoader } from './core/services/navigation.service';
import { Intro } from './features/intro/intro';
import { Nav } from './shared/components/nav/nav';
import { Loader } from './shared/components/loader/loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Intro, Nav, Loader],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private readonly introSvc = inject(IntroService);
  private readonly nav = inject(NavigationLoader);

  readonly showIntro = this.introSvc.shouldPlay;
  readonly loading = this.nav.visible;
  readonly loadingMessage = this.nav.message;

  ngOnInit(): void {
    this.nav.init();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showIntro()) this.introSvc.markSeen();
  }

  onIntroFinished(): void {
    this.introSvc.markSeen();
  }
}
