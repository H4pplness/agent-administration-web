import { Component, input, output } from '@angular/core';
import { SearchFieldConfig } from '../../../../core/models/search.model';

@Component({
  selector: 'app-search-field',
  standalone: true,
  template: `
    <div class="flex flex-col gap-2">
      <label class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 select-none">
        {{ config().label }}
      </label>

      @if (config().type === 'select') {
        <div
          class="relative h-10 rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200
                 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20"
        >
          <select
            class="h-full w-full rounded-xl bg-transparent pl-3 pr-9 text-sm text-gray-800 outline-none cursor-pointer appearance-none"
            [value]="value()"
            (change)="valueChange.emit($any($event.target).value)"
          >
            <option value="">{{ config().placeholder ?? 'Chon...' }}</option>
            @for (opt of config().options ?? []; track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>

          <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        </div>
      } @else {
        <div
          class="relative h-10 rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200
                 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20"
        >
          <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
            </svg>
          </span>

          <input
            [type]="config().type ?? 'text'"
            class="h-full w-full rounded-xl bg-transparent pl-9 pr-3 text-sm text-gray-800 placeholder-gray-400 outline-none"
            [placeholder]="config().placeholder ?? ''"
            [value]="value()"
            (input)="valueChange.emit($any($event.target).value)"
          />
        </div>
      }
    </div>
  `,
})
export class SearchFieldComponent {
  config = input.required<SearchFieldConfig>();
  value = input<string>('');
  valueChange = output<string>();
}
