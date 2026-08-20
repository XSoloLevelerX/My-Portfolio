import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BookmarkService } from '../../../core/services/bookmark.service';

/** One transient message, bottom-centre. Announced politely for screen readers. */
@Component({
  selector: 'app-toast',
  template: `
    @if (hint(); as message) {
      <div class="toast" role="status" aria-live="polite">{{ message }}</div>
    }
  `,
  styleUrl: './toast.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toast {
  readonly hint = inject(BookmarkService).hint;
}
