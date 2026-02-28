import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      // Agents
      {
        path: 'agents',
        loadComponent: () =>
          import('./pages/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent),
      },
      {
        path: 'agents/create',
        loadComponent: () =>
          import('./pages/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent),
      },
      {
        path: 'agents/templates',
        loadComponent: () =>
          import('./pages/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent),
      },
      // Workflows
      {
        path: 'workflows',
        loadComponent: () =>
          import('./pages/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent),
      },
      {
        path: 'workflows/create',
        loadComponent: () =>
          import('./pages/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent),
      },
      // Knowledge Base
      {
        path: 'knowledge-base/documents',
        loadComponent: () =>
          import('./pages/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent),
      },
      {
        path: 'knowledge-base/sources',
        loadComponent: () =>
          import('./pages/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent),
      },
      // Monitoring
      {
        path: 'monitoring/logs',
        loadComponent: () =>
          import('./pages/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent),
      },
      {
        path: 'monitoring/analytics',
        loadComponent: () =>
          import('./pages/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent),
      },
      // Settings
      {
        path: 'settings/general',
        loadComponent: () =>
          import('./pages/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent),
      },
      {
        path: 'settings/api-keys',
        loadComponent: () =>
          import('./pages/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent),
      },
      {
        path: 'settings/users',
        loadComponent: () =>
          import('./pages/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent),
      },
      // Wildcard
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
