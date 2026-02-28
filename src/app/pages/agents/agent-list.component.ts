import { Component, computed, signal } from '@angular/core';
import { SearchPanelComponent } from '../../shared/components/molecules/search-panel/search-panel.component';
import { PaginationComponent } from '../../shared/components/molecules/pagination/pagination.component';
import { SearchFieldConfig } from '../../core/models/search.model';

interface Agent {
  code: string;
  name: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
}

const AGENT_NAMES = [
  'Customer Support Agent', 'Sales Assistant', 'HR Onboarding Bot',
  'Tech Support Agent', 'Marketing Analyst', 'Data Extractor',
  'Email Responder', 'Code Review Bot', 'Document Summarizer', 'FAQ Bot',
];

const MOCK_AGENTS: Agent[] = Array.from({ length: 35 }, (_, i) => ({
  code: `AGT-${String(i + 1).padStart(4, '0')}`,
  name: `${AGENT_NAMES[i % 10]} ${Math.floor(i / 10) + 1}`,
  status: (['active', 'inactive', 'draft'] as const)[i % 3],
  createdAt: new Date(2024, i % 12, (i % 28) + 1).toLocaleDateString('vi-VN'),
}));

@Component({
  selector: 'app-agent-list',
  standalone: true,
  imports: [SearchPanelComponent, PaginationComponent],
  template: `
    <div class="space-y-4">

      <!-- Tiêu đề trang -->
      <div class="flex items-center justify-end">
        <button class="h-9 px-4 flex items-center gap-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors">
          + Tạo Agent mới
        </button>
      </div>

      <!-- Khu vực tìm kiếm -->
      <app-search-panel
        [fields]="searchFields"
        (search)="onSearch($event)"
        (reset)="onReset()"
      />

      <!-- Bảng kết quả -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">

        <!-- Header bảng -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <span class="text-sm text-gray-500 dark:text-gray-400">
            Tổng:
            <span class="font-semibold text-gray-700 dark:text-gray-200 ml-1">
              {{ filteredAgents().length }}
            </span> agents
          </span>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-36">
                  Mã code
                </th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tên Agent
                </th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-36">
                  Trạng thái
                </th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-36">
                  Ngày tạo
                </th>
                <th class="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              @for (agent of pagedAgents(); track agent.code) {
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                  <td class="px-4 py-3">
                    <span class="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-1 rounded">
                      {{ agent.code }}
                    </span>
                  </td>
                  <td class="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">
                    {{ agent.name }}
                  </td>
                  <td class="px-4 py-3">
                    <span [class]="statusClass(agent.status)">
                      {{ statusLabel(agent.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {{ agent.createdAt }}
                  </td>
                  <td class="px-4 py-3 text-right">
                    <button class="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
                      Chi tiết
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-4 py-16 text-center">
                    <p class="text-gray-400 dark:text-gray-600 text-sm">Không tìm thấy agent nào phù hợp</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Phân trang -->
        @if (filteredAgents().length > 0) {
          <div class="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <app-pagination
              [total]="filteredAgents().length"
              [page]="currentPage()"
              [pageSize]="pageSize()"
              (pageChange)="currentPage.set($event)"
              (pageSizeChange)="onPageSizeChange($event)"
            />
          </div>
        }
      </div>
    </div>
  `,
})
export class AgentListComponent {
  readonly searchFields: SearchFieldConfig[] = [
    { key: 'code', label: 'Mã code Agent', placeholder: 'Nhập mã code...' },
    { key: 'name', label: 'Tên Agent', placeholder: 'Nhập tên agent...' },
  ];

  searchValues = signal<Record<string, string>>({});
  currentPage = signal(1);
  pageSize = signal(10);

  filteredAgents = computed(() => {
    const f = this.searchValues();
    return MOCK_AGENTS.filter(a => {
      if (f['code'] && !a.code.toLowerCase().includes(f['code'].toLowerCase())) return false;
      if (f['name'] && !a.name.toLowerCase().includes(f['name'].toLowerCase())) return false;
      return true;
    });
  });

  pagedAgents = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredAgents().slice(start, start + this.pageSize());
  });

  onSearch(values: Record<string, string>) {
    this.searchValues.set(values);
    this.currentPage.set(1);
  }

  onReset() {
    this.searchValues.set({});
    this.currentPage.set(1);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  statusClass(status: Agent['status']): string {
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ';
    const map = {
      active:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
      inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
      draft:    'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    };
    return base + map[status];
  }

  statusLabel(status: Agent['status']): string {
    return { active: 'Hoạt động', inactive: 'Không hoạt động', draft: 'Nháp' }[status];
  }
}
