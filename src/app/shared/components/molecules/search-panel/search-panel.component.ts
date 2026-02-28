import { Component, computed, input, output, signal } from '@angular/core';
import { SearchFieldComponent } from '../../atoms/search-field/search-field.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { SearchFieldConfig } from '../../../../core/models/search.model';

@Component({
  selector: 'app-search-panel',
  standalone: true,
  imports: [SearchFieldComponent, IconComponent],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">

      <!-- Grid các ô search -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        @for (field of visibleFields(); track field.key) {
          <app-search-field
            [config]="field"
            [value]="formValues()[field.key] ?? ''"
            (valueChange)="updateField(field.key, $event)"
          />
        }
      </div>

      <!-- Hàng action -->
      <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">

        <!-- Nút mở rộng / thu gọn (chỉ hiện khi > 4 fields) -->
        <div>
          @if (fields().length > 4) {
            <button
              (click)="expanded.set(!expanded())"
              class="flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
            >
              <app-icon [name]="expanded() ? 'chevron-up' : 'chevron-down'" size="sm" />
              {{ expanded() ? 'Thu gọn' : 'Mở rộng (' + (fields().length - 4) + ' điều kiện)' }}
            </button>
          }
        </div>

        <!-- Nút tìm kiếm + làm mới -->
        <div class="flex items-center gap-2">
          <button
            (click)="onReset()"
            class="h-9 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Làm mới
          </button>
          <button
            (click)="onSearch()"
            class="h-9 px-4 flex items-center gap-1.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors"
          >
            <app-icon name="search" size="sm" />
            Tìm kiếm
          </button>
        </div>
      </div>
    </div>
  `,
})
export class SearchPanelComponent {
  fields = input.required<SearchFieldConfig[]>();
  search = output<Record<string, string>>();
  reset = output<void>();

  expanded = signal(false);
  formValues = signal<Record<string, string>>({});

  visibleFields = computed(() => {
    const all = this.fields();
    if (all.length <= 4 || this.expanded()) return all;
    return all.slice(0, 4);
  });

  updateField(key: string, value: string) {
    this.formValues.update(v => ({ ...v, [key]: value }));
  }

  onSearch() {
    this.search.emit({ ...this.formValues() });
  }

  onReset() {
    this.formValues.set({});
    this.reset.emit();
  }
}
