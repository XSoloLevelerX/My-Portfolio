import {
  ChangeDetectionStrategy, Component, ElementRef, input, output, signal, viewChild,
} from '@angular/core';
import { Row } from '../../../core/models/row.model';
import { Project } from '../../../core/models/project.model';
import { Card } from '../card/card';

@Component({
  selector: 'app-row',
  imports: [Card],
  templateUrl: './row.html',
  styleUrl: './row.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowShelf {
  readonly row = input.required<Row>();

  readonly open = output<Project>();
  readonly playLive = output<Project>();

  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

  readonly canScrollLeft = signal(false);
  readonly canScrollRight = signal(true);

  scrollBy(direction: -1 | 1): void {
    const el = this.track()?.nativeElement;
    if (!el) return;
    // Page by ~80% of the viewport width so a partial card stays visible as an
    // affordance that there is more to the right.
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  onScroll(): void {
    const el = this.track()?.nativeElement;
    if (!el) return;
    this.canScrollLeft.set(el.scrollLeft > 8);
    this.canScrollRight.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }
}
