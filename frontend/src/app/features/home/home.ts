import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CatalogService } from '../../core/services/catalog.service';
import { Billboard } from '../../shared/components/billboard/billboard';

@Component({
  selector: 'app-home',
  imports: [Billboard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly catalog = inject(CatalogService);

  readonly billboard = this.catalog.billboard;
  readonly trending = this.catalog.trending;
  readonly total = this.catalog.projects;
}
