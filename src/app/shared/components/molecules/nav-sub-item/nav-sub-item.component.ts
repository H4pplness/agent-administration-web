import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../../atoms/icon/icon.component';
import { NavItem } from '../../../../core/models/nav-item.model';

@Component({
  selector: 'app-nav-sub-item',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  template: `
    <a
      [routerLink]="item().route"
      routerLinkActive="bg-brand-50 text-brand-700 font-medium"
      [routerLinkActiveOptions]="{ exact: true }"
      class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150 cursor-pointer"
    >
      <app-icon [name]="item().icon" size="sm" class="text-gray-400" />
      <span>{{ item().label }}</span>
    </a>
  `,
})
export class NavSubItemComponent {
  item = input.required<NavItem>();
}
