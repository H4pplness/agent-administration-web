import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { IconComponent } from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <nav class="flex items-center gap-1 text-sm">
      <a
        routerLink="/dashboard"
        class="text-gray-400 hover:text-brand-500 transition-colors"
      >
        <app-icon name="home" size="sm" />
      </a>

      @for (crumb of breadcrumbService.breadcrumbs(); track crumb.route; let last = $last) {
        <span class="text-gray-300">
          <app-icon name="chevron-right" size="xs" />
        </span>
        @if (!last && crumb.route) {
          <a
            [routerLink]="crumb.route"
            class="text-gray-500 hover:text-brand-500 transition-colors font-medium"
          >
            {{ crumb.label }}
          </a>
        } @else {
          <span class="text-gray-800 font-semibold">{{ crumb.label }}</span>
        }
      }
    </nav>
  `,
})
export class BreadcrumbComponent {
  breadcrumbService = inject(BreadcrumbService);
}
