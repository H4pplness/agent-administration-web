import { Component, inject } from '@angular/core';
import { NavigationService } from '../../../../core/services/navigation.service';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <div class="flex items-center" [class.gap-2.5]="!navService.sidebarCollapsed()">
      <div class="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shrink-0 shadow-sm">
        <svg class="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21M3.75 3h16.5c.621 0 1.125.504 1.125 1.125v16.5c0 .621-.504 1.125-1.125 1.125H3.75A1.125 1.125 0 0 1 2.625 20.625V4.125C2.625 3.504 3.129 3 3.75 3ZM9.75 9.75h4.5v4.5h-4.5v-4.5Z" />
        </svg>
      </div>
      @if (!navService.sidebarCollapsed()) {
        <div class="flex flex-col min-w-0">
          <span class="text-sm font-bold text-gray-900 leading-tight">AI Agent</span>
          <span class="text-[10px] text-sidebar-text leading-tight">Platform</span>
        </div>
      }
    </div>
  `,
})
export class AppLogoComponent {
  navService = inject(NavigationService);
}
