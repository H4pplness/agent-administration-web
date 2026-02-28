import { Component, inject } from '@angular/core';
import { NavigationService } from '../../../../core/services/navigation.service';
import { AppLogoComponent } from '../../molecules/app-logo/app-logo.component';
import { NavItemComponent } from '../../molecules/nav-item/nav-item.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [AppLogoComponent, NavItemComponent],
  template: `
    <aside
      class="flex flex-col h-full shrink-0 bg-sidebar-bg border-r border-sidebar-border transition-all duration-300 ease-in-out"
      [class.w-60]="!navService.sidebarCollapsed()"
      [class.w-16]="navService.sidebarCollapsed()"
    >
      <!-- Logo area -->
      <div
        class="flex items-center h-16 border-b border-sidebar-border shrink-0 transition-all duration-300"
        [class.px-4]="!navService.sidebarCollapsed()"
        [class.justify-center]="navService.sidebarCollapsed()"
        [class.px-3]="navService.sidebarCollapsed()"
      >
        <app-logo />
      </div>

      <!-- Nav items: overflow-y-auto khi expanded (không flyout), không overflow khi collapsed (flyout cần thoát ra) -->
      <nav
        class="flex-1 py-3 space-y-0.5 transition-all duration-300"
        [class.overflow-y-auto]="!navService.sidebarCollapsed()"
        [class.px-3]="!navService.sidebarCollapsed()"
        [class.px-2]="navService.sidebarCollapsed()"
      >
        @for (item of navService.navItems; track item.id) {
          <app-nav-item [item]="item" />
        }
      </nav>

      <!-- Footer / User info -->
      <div
        class="shrink-0 border-t border-sidebar-border py-3 transition-all duration-300"
        [class.px-4]="!navService.sidebarCollapsed()"
        [class.px-3]="navService.sidebarCollapsed()"
      >
        <div
          class="flex items-center"
          [class.gap-2.5]="!navService.sidebarCollapsed()"
          [class.justify-center]="navService.sidebarCollapsed()"
        >
          <div class="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            A
          </div>
          @if (!navService.sidebarCollapsed()) {
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">Admin User</p>
              <p class="text-[10px] text-sidebar-text truncate">admin&#64;example.com</p>
            </div>
          }
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  navService = inject(NavigationService);
}
