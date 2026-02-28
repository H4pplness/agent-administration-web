import { Component, inject, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../../atoms/icon/icon.component';
import { NavSubItemComponent } from '../nav-sub-item/nav-sub-item.component';
import { NavItem } from '../../../../core/models/nav-item.model';
import { NavigationService } from '../../../../core/services/navigation.service';

@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [NgClass, RouterLink, RouterLinkActive, IconComponent, NavSubItemComponent],
  styles: [`
    :host {
      display: block;
      position: relative;
    }

    /* Flyout — chỉ dùng khi sidebar thu nhỏ */
    .flyout-menu {
      opacity: 0;
      pointer-events: none;
      transform: translateX(-6px);
      transition: opacity 0.15s ease, transform 0.15s ease;
      position: absolute;
      left: calc(100% + 6px);
      top: 0;
      min-width: 200px;
      z-index: 100;
    }

    :host:hover .flyout-menu,
    .flyout-menu:hover {
      opacity: 1;
      pointer-events: auto;
      transform: translateX(0);
    }
  `],
  template: `
    <!-- Nav item CÓ children -->
    @if (item().children && item().children!.length > 0) {

      <!-- EXPANDED: accordion mở xuống bên dưới -->
      @if (!navService.sidebarCollapsed()) {
        <div class="group/navitem">
          <!-- Hàng tiêu đề -->
          <div
            class="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-sidebar-hover transition-colors duration-150"
            [class.bg-sidebar-active]="isParentActive()"
          >
            <!-- Icon badge màu -->
            <span
              class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
              [ngClass]="iconColors[item().icon]"
            >
              <app-icon [name]="item().icon" size="sm" />
            </span>
            <span
              class="text-sm font-medium flex-1 truncate text-sidebar-text group-hover/navitem:text-sidebar-text-hover transition-colors"
              [class.text-sidebar-text-active]="isParentActive()"
            >{{ item().label }}</span>
            <app-icon
              name="chevron-down"
              size="sm"
              class="text-sidebar-text opacity-40 shrink-0 transition-transform duration-200 group-hover/navitem:rotate-180 group-hover/navitem:opacity-70"
            />
          </div>

          <!-- Submenu mở xuống khi hover -->
          <div class="max-h-0 overflow-hidden group-hover/navitem:max-h-64 transition-all duration-200 ease-in-out">
            <div class="pt-0.5 pb-1 pl-3 space-y-0.5">
              @for (child of item().children; track child.id) {
                <app-nav-sub-item [item]="child" />
              }
            </div>
          </div>
        </div>
      }

      <!-- COLLAPSED: chỉ icon badge + flyout ra bên phải -->
      @if (navService.sidebarCollapsed()) {
        <div
          class="flex items-center justify-center p-1.5 rounded-lg cursor-pointer hover:bg-sidebar-hover transition-colors duration-150"
          [class.bg-sidebar-active]="isParentActive()"
        >
          <span
            class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            [ngClass]="iconColors[item().icon]"
          >
            <app-icon [name]="item().icon" size="md" />
          </span>
        </div>

        <!-- Flyout submenu -->
        <div class="flyout-menu">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-2">
            <div class="px-3 py-1.5 mb-1 border-b border-gray-50 dark:border-gray-700 flex items-center gap-2">
              <span
                class="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                [ngClass]="iconColors[item().icon]"
              >
                <app-icon [name]="item().icon" size="xs" />
              </span>
              <span class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{{ item().label }}</span>
            </div>
            @for (child of item().children; track child.id) {
              <app-nav-sub-item [item]="child" />
            }
          </div>
        </div>
      }
    }

    <!-- Nav item KHÔNG có children: link trực tiếp -->
    @if (!item().children || item().children!.length === 0) {
      <a
        [routerLink]="item().route"
        routerLinkActive="bg-sidebar-active"
        [routerLinkActiveOptions]="{ exact: true }"
        class="flex items-center rounded-lg hover:bg-sidebar-hover transition-colors duration-150"
        [class.gap-3]="!navService.sidebarCollapsed()"
        [class.px-3]="!navService.sidebarCollapsed()"
        [class.py-2]="!navService.sidebarCollapsed()"
        [class.justify-center]="navService.sidebarCollapsed()"
        [class.p-1.5]="navService.sidebarCollapsed()"
      >
        <!-- Icon badge màu -->
        <span
          class="flex items-center justify-center shrink-0 rounded-lg transition-colors"
          [class.w-8]="!navService.sidebarCollapsed()"
          [class.h-8]="!navService.sidebarCollapsed()"
          [class.w-9]="navService.sidebarCollapsed()"
          [class.h-9]="navService.sidebarCollapsed()"
          [ngClass]="iconColors[item().icon]"
        >
          <app-icon [name]="item().icon" [size]="navService.sidebarCollapsed() ? 'md' : 'sm'" />
        </span>
        @if (!navService.sidebarCollapsed()) {
          <span class="text-sm font-medium text-sidebar-text">{{ item().label }}</span>
        }
      </a>
    }
  `,
})
export class NavItemComponent {
  item = input.required<NavItem>();
  navService = inject(NavigationService);

  readonly iconColors: Record<string, string> = {
    dashboard: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
    robot:     'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
    workflow:  'bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400',
    book:      'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    chart:     'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    settings:  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };

  isParentActive(): boolean {
    return false;
  }
}
