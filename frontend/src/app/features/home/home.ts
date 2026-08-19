import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CatalogService } from '../../core/services/catalog.service';
import { ApiService } from '../../core/services/api.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { Project } from '../../core/models/project.model';
import { Billboard } from '../../shared/components/billboard/billboard';
import { RowShelf } from '../../shared/components/row/row';
import { Modal } from '../../shared/components/modal/modal';

@Component({
  selector: 'app-home',
  imports: [Billboard, RowShelf, Modal],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly api = inject(ApiService);
  private readonly analytics = inject(AnalyticsService);

  readonly billboard = this.catalog.billboard;
  readonly rows = this.catalog.rows;
  readonly total = this.catalog.projects;

  readonly selected = signal<Project | null>(null);

  ngOnInit(): void {
    // The page is already rendered from the snapshot; this only refines the order.
    this.api.refreshTrending();
  }

  openDetail(project: Project): void {
    this.selected.set(project);
    this.analytics.track(project.slug, 'OPEN');
  }

  closeDetail(): void {
    this.selected.set(null);
  }

  onPlay(project: Project): void {
    this.analytics.track(project.slug, 'CLICK_LIVE');
    if (project.liveUrl) window.open(project.liveUrl, '_blank', 'noopener');
  }

  onClickLive(project: Project): void {
    this.analytics.track(project.slug, 'CLICK_LIVE');
  }

  onClickRepo(project: Project): void {
    this.analytics.track(project.slug, 'CLICK_REPO');
  }
}
