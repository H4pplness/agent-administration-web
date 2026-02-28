import { Injectable, signal } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Breadcrumb } from '../models/breadcrumb.model';

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  breadcrumbs = signal<Breadcrumb[]>([]);

  private readonly routeLabelMap: Record<string, string> = {
    '': 'Trang chủ',
    'dashboard': 'Dashboard',
    'agents': 'Agents',
    'create': 'Tạo mới',
    'templates': 'Templates',
    'workflows': 'Workflows',
    'knowledge-base': 'Knowledge Base',
    'documents': 'Tài liệu',
    'sources': 'Data Sources',
    'monitoring': 'Monitoring',
    'logs': 'Logs',
    'analytics': 'Analytics',
    'settings': 'Cài đặt',
    'general': 'Chung',
    'api-keys': 'API Keys',
    'users': 'Người dùng',
  };

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateBreadcrumbs();
    });
  }

  private updateBreadcrumbs(): void {
    const url = this.router.url;
    const segments = url.split('/').filter(s => s);

    const crumbs: Breadcrumb[] = [];
    let path = '';

    for (const segment of segments) {
      path += `/${segment}`;
      const label = this.routeLabelMap[segment] ?? this.capitalize(segment);
      crumbs.push({ label, route: path });
    }

    this.breadcrumbs.set(crumbs);
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
  }
}
