import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/organisms/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/organisms/header/header.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <!-- Sidebar -->
      <app-sidebar />

      <!-- Main area -->
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
        <!-- Header -->
        <app-header />

        <!-- Content -->
        <main class="flex-1 overflow-y-auto p-6 dark:bg-gray-900 dark:text-gray-100">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {}
