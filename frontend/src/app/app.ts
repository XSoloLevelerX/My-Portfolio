import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { IntroService } from './core/services/intro.service';
import { Intro } from './features/intro/intro';
import { Home } from './features/home/home';
import { Nav } from './shared/components/nav/nav';

@Component({
  selector: 'app-root',
  imports: [Intro, Home, Nav],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly introSvc = inject(IntroService);

  readonly showIntro = this.introSvc.shouldPlay;

  /** Esc skips the intro; the component itself handles the teardown. */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showIntro()) this.introSvc.markSeen();
  }

  onIntroFinished(): void {
    this.introSvc.markSeen();
  }
}
