import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BookmarkService } from '../../../core/services/bookmark.service';

/**
 * The bookmark prompt. Shows the real shortcut as keycaps, then confirms once
 * the visitor actually presses it — the page cannot open the dialog itself, but
 * it can tell that it happened.
 */
@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toast {
  private readonly bookmarks = inject(BookmarkService);
  readonly prompt = this.bookmarks.prompt;

  dismiss(): void {
    this.bookmarks.dismiss();
  }
}
