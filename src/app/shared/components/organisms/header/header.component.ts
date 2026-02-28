import { Component, inject } from '@angular/core';
import { BreadcrumbComponent } from '../../molecules/breadcrumb/breadcrumb.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { ThemeToggleComponent } from '../../atoms/theme-toggle/theme-toggle.component';
import { NavigationService } from '../../../../core/services/navigation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [BreadcrumbComponent, IconComponent, ThemeToggleComponent],
  template: `
    <header class="flex items-center h-16 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0 gap-3">
      <!-- Sidebar toggle button -->
      <button
        (click)="navService.toggleSidebar()"
        class="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors shrink-0"
        [title]="navService.sidebarCollapsed() ? 'Mở sidebar' : 'Thu gọn sidebar'"
      >
        <app-icon [name]="navService.sidebarCollapsed() ? 'sidebar-open' : 'sidebar-close'" />
      </button>

      <!-- Separator -->
      <div class="w-px h-5 bg-gray-200 dark:bg-gray-700 shrink-0"></div>

      <!-- Breadcrumb -->
      <div class="flex-1 min-w-0">
        <app-breadcrumb />
      </div>

      <!-- Right actions -->
      <div class="flex items-center gap-1 shrink-0">
        <!-- Theme toggle -->
        <app-theme-toggle />

        <!-- Separator -->
        <div class="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1"></div>

        <!-- Notifications -->
        <button
          class="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
          title="Thông báo"
        >
          <app-icon name="bell" />
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
        </button>

        <!-- User avatar -->
        <button
          class="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
          title="Tài khoản"
        >
          <app-icon name="user-circle" size="lg" />
        </button>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  navService = inject(NavigationService);
}
