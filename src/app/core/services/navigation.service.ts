import { Injectable, signal } from '@angular/core';
import { NavItem } from '../models/nav-item.model';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  readonly navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
    },
    {
      id: 'agents',
      label: 'Agents',
      icon: 'robot',
      children: [
        { id: 'agents-list', label: 'Danh mục Agent', icon: 'list', route: '/agents' },
        { id: 'agents-multi', label: 'Multi-agent', icon: 'workflow', route: '/agents/multi' },
      ],
    },
    {
      id: 'workflows',
      label: 'Workflows',
      icon: 'workflow',
      children: [
        { id: 'workflows-list', label: 'Tất cả Workflows', icon: 'list', route: '/workflows' },
        { id: 'workflows-create', label: 'Tạo Workflow', icon: 'plus', route: '/workflows/create' },
      ],
    },
    {
      id: 'knowledge-base',
      label: 'Knowledge Base',
      icon: 'book',
      children: [
        { id: 'kb-documents', label: 'Tài liệu', icon: 'document', route: '/knowledge-base/documents' },
        { id: 'kb-sources', label: 'Data Sources', icon: 'database', route: '/knowledge-base/sources' },
        { id: 'kb-skills', label: 'Skills', icon: 'key', route: '/knowledge-base/skills' },
      ],
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      icon: 'chart',
      children: [
        { id: 'monitoring-logs', label: 'Logs', icon: 'terminal', route: '/monitoring/logs' },
        { id: 'monitoring-analytics', label: 'Analytics', icon: 'analytics', route: '/monitoring/analytics' },
      ],
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: 'settings',
      children: [
        { id: 'settings-general', label: 'Chung', icon: 'settings', route: '/settings/general' },
        { id: 'settings-api-keys', label: 'API Keys', icon: 'key', route: '/settings/api-keys' },
        { id: 'settings-users', label: 'Người dùng', icon: 'users', route: '/settings/users' },
      ],
    },
  ];

  activeItemId = signal<string>('dashboard');
  sidebarCollapsed = signal<boolean>(false);

  setActive(id: string): void {
    this.activeItemId.set(id);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}
