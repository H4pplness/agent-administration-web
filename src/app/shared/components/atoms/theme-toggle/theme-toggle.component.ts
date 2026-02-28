import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../../core/services/theme.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [IconComponent],
  template: `
    <button
      (click)="themeService.toggle()"
      class="flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-medium transition-colors"
      [class]="themeService.isDark()
        ? 'bg-indigo-950 text-indigo-300 hover:bg-indigo-900'
        : 'bg-amber-50 text-amber-600 hover:bg-amber-100'"
      [title]="themeService.isDark() ? 'Chuyển chế độ sáng' : 'Chuyển chế độ tối'"
    >
      <app-icon [name]="themeService.isDark() ? 'sun' : 'moon'" size="sm" />
      <span>{{ themeService.isDark() ? 'Sáng' : 'Tối' }}</span>
    </button>
  `,
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
}
