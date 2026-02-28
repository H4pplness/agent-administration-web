import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <div class="flex items-center justify-between flex-wrap gap-3">

      <!-- Thông tin kết quả + chọn số dòng -->
      <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <span>
          {{ startItem() }}–{{ endItem() }}
          <span class="text-gray-400 dark:text-gray-600">/</span>
          <span class="font-semibold text-gray-700 dark:text-gray-300">{{ total() }}</span> kết quả
        </span>

        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400 dark:text-gray-600">Hiển thị:</span>
          <select
            class="h-7 px-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            [value]="pageSize()"
            (change)="onPageSizeChange($any($event.target).value)"
          >
            @for (opt of pageSizeOptions; track opt) {
              <option [value]="opt">{{ opt }}</option>
            }
          </select>
          <span class="text-xs text-gray-400 dark:text-gray-600">/ trang</span>
        </div>
      </div>

      <!-- Điều hướng trang -->
      <div class="flex items-center gap-1">

        <!-- Trang đầu -->
        <button
          (click)="pageChange.emit(1)"
          [disabled]="page() === 1"
          class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang đầu"
        >«</button>

        <!-- Trang trước -->
        <button
          (click)="pageChange.emit(page() - 1)"
          [disabled]="page() === 1"
          class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang trước"
        >‹</button>

        <!-- Dấu ... đầu -->
        @if (showLeadingEllipsis()) {
          <span class="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
        }

        <!-- Số trang -->
        @for (p of pageNumbers(); track p) {
          <button
            (click)="pageChange.emit(p)"
            [class]="pageButtonClass(p)"
          >{{ p }}</button>
        }

        <!-- Dấu ... cuối -->
        @if (showTrailingEllipsis()) {
          <span class="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
        }

        <!-- Trang sau -->
        <button
          (click)="pageChange.emit(page() + 1)"
          [disabled]="page() === totalPages()"
          class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang sau"
        >›</button>

        <!-- Trang cuối -->
        <button
          (click)="pageChange.emit(totalPages())"
          [disabled]="page() === totalPages()"
          class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang cuối"
        >»</button>
      </div>
    </div>
  `,
})
export class PaginationComponent {
  total = input.required<number>();
  page = input<number>(1);
  pageSize = input<number>(10);

  pageChange = output<number>();
  pageSizeChange = output<number>();

  readonly pageSizeOptions = [10, 50, 100];

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  startItem = computed(() => this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1);
  endItem = computed(() => Math.min(this.page() * this.pageSize(), this.total()));

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const delta = 2;
    const start = Math.max(1, current - delta);
    const end = Math.min(total, current + delta);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  showLeadingEllipsis = computed(() => {
    const pages = this.pageNumbers();
    return pages.length > 0 && pages[0] > 1;
  });

  showTrailingEllipsis = computed(() => {
    const pages = this.pageNumbers();
    return pages.length > 0 && pages[pages.length - 1] < this.totalPages();
  });

  pageButtonClass(p: number): string {
    const base = 'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium border transition-colors ';
    const active = 'bg-brand-500 text-white border-brand-500';
    const inactive = 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700';
    return base + (p === this.page() ? active : inactive);
  }

  onPageSizeChange(value: string) {
    this.pageSizeChange.emit(Number(value));
  }
}
