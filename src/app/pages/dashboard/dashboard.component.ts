import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface StatCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="p-6 overflow-y-auto h-full space-y-6">
      <!-- Page header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-sm text-gray-500 mt-1">Tổng quan hệ thống AI Agent Platform</p>
      </div>

      <!-- Stats grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (stat of stats; track stat.label) {
          <div class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium text-gray-500">{{ stat.label }}</span>
              <div class="w-9 h-9 rounded-lg flex items-center justify-center text-lg" [class]="stat.color">
                {{ stat.icon }}
              </div>
            </div>
            <div class="flex items-end gap-2">
              <span class="text-2xl font-bold text-gray-900">{{ stat.value }}</span>
              <span
                class="text-xs font-medium mb-0.5"
                [class.text-green-600]="stat.positive"
                [class.text-red-500]="!stat.positive"
              >
                {{ stat.change }}
              </span>
            </div>
          </div>
        }
      </div>

      <!-- Quick actions -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-base font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          @for (action of quickActions; track action.label) {
            <a
              [routerLink]="action.route"
              class="flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-400 hover:bg-brand-50 transition-all group"
            >
              <span class="text-2xl">{{ action.emoji }}</span>
              <span class="text-xs font-medium text-gray-600 group-hover:text-brand-600 text-center">{{ action.label }}</span>
            </a>
          }
        </div>
      </div>

      <!-- Welcome card -->
      <div class="bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl p-6 text-white">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-lg font-semibold mb-1">Chào mừng đến với AI Agent Platform!</h2>
            <p class="text-brand-200 text-sm max-w-md">
              Nền tảng quản lý AI agents mạnh mẽ. Bắt đầu bằng cách tạo agent đầu tiên của bạn.
            </p>
            <a
              routerLink="/agents/create"
              class="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white text-brand-700 rounded-lg text-sm font-medium hover:bg-brand-50 transition-colors"
            >
              Tạo Agent đầu tiên
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </a>
          </div>
          <div class="text-5xl opacity-20 select-none">🤖</div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  stats: StatCard[] = [
    { label: 'Tổng Agents', value: '0', change: '+0 hôm nay', positive: true, icon: '🤖', color: 'bg-blue-50 text-blue-600' },
    { label: 'Workflows', value: '0', change: '+0 hôm nay', positive: true, icon: '⚡', color: 'bg-purple-50 text-purple-600' },
    { label: 'Tài liệu KB', value: '0', change: '+0 hôm nay', positive: true, icon: '📚', color: 'bg-green-50 text-green-600' },
    { label: 'API Calls', value: '0', change: '0%', positive: true, icon: '📊', color: 'bg-orange-50 text-orange-600' },
  ];

  quickActions = [
    { label: 'Tạo Agent', emoji: '🤖', route: '/agents/create' },
    { label: 'Tạo Workflow', emoji: '⚡', route: '/workflows/create' },
    { label: 'Thêm tài liệu', emoji: '📄', route: '/knowledge-base/documents' },
    { label: 'Xem Logs', emoji: '📋', route: '/monitoring/logs' },
  ];
}
