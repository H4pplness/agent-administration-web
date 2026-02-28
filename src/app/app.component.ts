import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreadcrumbService } from './core/services/breadcrumb.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent {
  // Initialize services to start listening to events
  private _breadcrumb = inject(BreadcrumbService);
  private _theme = inject(ThemeService);
}
