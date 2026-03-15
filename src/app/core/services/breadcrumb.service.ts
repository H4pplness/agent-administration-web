import { Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Breadcrumb } from '../models/breadcrumb.model';

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  breadcrumbs = signal<Breadcrumb[]>([]);

  private readonly routeLabelMap: Record<string, string> = {
    '': 'Trang chu',
    dashboard: 'Dashboard',
    agents: 'Danh muc Agent',
    models: 'Models',
    multi: 'Multi-agent',
    workflows: 'Workflows',
    'knowledge-base': 'Knowledge Base',
    documents: 'Tai lieu',
    sources: 'Data Sources',
    skills: 'Skills',
    new: 'Tao moi',
    edit: 'Chinh sua',
    monitoring: 'Monitoring',
    logs: 'Logs',
    analytics: 'Analytics',
    settings: 'Cai dat',
    general: 'Chung',
    'api-keys': 'API Keys',
    users: 'Nguoi dung',
  };

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateBreadcrumbs());
  }

  private updateBreadcrumbs(): void {
    const segments = this.router.url.split('/').filter(Boolean);
    const crumbs: Breadcrumb[] = [];
    let path = '';

    for (const segment of segments) {
      path += `/${segment}`;
      crumbs.push({
        label: this.routeLabelMap[segment] ?? this.capitalize(segment),
        route: path,
      });
    }

    this.breadcrumbs.set(crumbs);
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
  }
}
