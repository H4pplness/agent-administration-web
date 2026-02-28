import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'coming-soon';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span
      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      [ngClass]="variantClass()"
    >
      {{ label() }}
    </span>
  `,
})
export class BadgeComponent {
  label = input.required<string>();
  variant = input<BadgeVariant>('default');

  variantClass() {
    const map: Record<BadgeVariant, string> = {
      default: 'bg-gray-100 text-gray-600',
      success: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      danger: 'bg-red-100 text-red-700',
      info: 'bg-blue-100 text-blue-700',
      'coming-soon': 'bg-purple-100 text-purple-700',
    };
    return map[this.variant()];
  }
}
