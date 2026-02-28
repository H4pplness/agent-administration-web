# AI Agent Platform

Giao diện quản lý AI Agent được xây dựng bằng **Angular 19** với kiến trúc **Atomic Design** và **Tailwind CSS**.

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [Tech Stack](#tech-stack)
- [Kiến trúc Atomic Design](#kiến-trúc-atomic-design)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Components](#components)
  - [Atoms](#atoms)
  - [Molecules](#molecules)
  - [Organisms](#organisms)
  - [Layouts](#layouts)
  - [Pages](#pages)
- [Core Services](#core-services)
- [Navigation](#navigation)
- [Routing](#routing)
- [Hướng dẫn phát triển](#hướng-dẫn-phát-triển)
- [Thêm tính năng mới](#thêm-tính-năng-mới)

---

## Tổng quan

AI Agent Platform là ứng dụng quản trị (admin UI) dành cho việc quản lý các AI agents. Giao diện theo mô hình admin dashboard chuẩn gồm:

- **Sidebar** cố định bên trái với các mục điều hướng chính
- **Flyout submenu** xuất hiện khi hover vào mục có chức năng con
- **Header** phía trên với breadcrumb tự động theo route hiện tại
- **Content area** hiển thị nội dung của từng trang

```
┌────────────────────────────────────────────────────────┐
│  [Logo] AI Agent Platform    Dashboard > Agents        │  ← Header
├──────────┬─────────────────────────────────────────────┤
│          │                                             │
│ Sidebar  │            Nội dung trang                  │
│  240px   │         <router-outlet>                    │
│          │                                             │
│ Dashboard│                                             │
│ Agents ► │──► [ Tất cả Agents ]                       │
│ Workflows│    [ Tạo Agent     ]   ← Flyout submenu    │
│ ...      │    [ Templates     ]                        │
└──────────┴─────────────────────────────────────────────┘
```

---

## Tech Stack

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| Angular | 19.0.1 | Framework chính (standalone components, signals) |
| Tailwind CSS | 3.4.x | Utility-first CSS styling |
| TypeScript | 5.x | Ngôn ngữ lập trình |
| Angular Router | 19.x | Điều hướng, lazy loading |
| SCSS | - | Component-level styles |

> **Lưu ý:** Sử dụng Tailwind CSS v3, không phải v4. Tailwind v4 không tương thích với Angular build system (PostCSS plugin đã tách riêng).

---

## Kiến trúc Atomic Design

Dự án áp dụng phương pháp **Atomic Design** để tổ chức components theo thứ tự từ đơn giản đến phức tạp:

```
Atoms → Molecules → Organisms → Layouts → Pages
  ↓           ↓           ↓          ↓        ↓
Đơn vị    Kết hợp    Component   Bố cục    Màn hình
nhỏ nhất   atoms     phức tạp   hoàn chỉnh  hoàn chỉnh
```

| Cấp độ | Mô tả | Ví dụ |
|--------|-------|-------|
| **Atoms** | Phần tử UI nhỏ nhất, không thể chia nhỏ hơn | Icon, Badge |
| **Molecules** | Kết hợp các atoms thành đơn vị có ý nghĩa | NavItem, Breadcrumb, AppLogo |
| **Organisms** | Nhóm molecules tạo thành section giao diện | Sidebar, Header |
| **Layouts** | Bố cục tổng thể, chứa organisms | AdminLayout |
| **Pages** | Màn hình cụ thể, được load vào layout | Dashboard, ComingSoon |

---

## Cấu trúc thư mục

```
src/
└── app/
    ├── core/                          # Logic nghiệp vụ cốt lõi
    │   ├── models/
    │   │   ├── nav-item.model.ts      # Interface NavItem
    │   │   └── breadcrumb.model.ts    # Interface Breadcrumb
    │   └── services/
    │       ├── navigation.service.ts  # Dữ liệu nav items + active state
    │       └── breadcrumb.service.ts  # Auto-generate breadcrumb từ route
    │
    ├── shared/
    │   └── components/
    │       ├── atoms/
    │       │   ├── icon/              # SVG icon wrapper (Heroicons)
    │       │   └── badge/             # Status badge
    │       ├── molecules/
    │       │   ├── app-logo/          # Logo + tên ứng dụng
    │       │   ├── nav-item/          # Nav item với flyout submenu
    │       │   ├── nav-sub-item/      # Sub-menu item
    │       │   └── breadcrumb/        # Breadcrumb trail
    │       └── organisms/
    │           ├── sidebar/           # Sidebar hoàn chỉnh
    │           └── header/            # Header hoàn chỉnh
    │
    ├── layouts/
    │   └── admin-layout/              # Bố cục admin (sidebar + header + content)
    │
    ├── pages/
    │   ├── dashboard/                 # Trang Dashboard
    │   └── coming-soon/               # Placeholder cho tính năng chưa phát triển
    │
    ├── app.component.ts               # Root component
    ├── app.config.ts                  # App configuration (providers)
    └── app.routes.ts                  # Định nghĩa routes
```

---

## Components

### Atoms

#### `IconComponent`
Path: [src/app/shared/components/atoms/icon/icon.component.ts](src/app/shared/components/atoms/icon/icon.component.ts)

Wrapper cho SVG icons (Heroicons). Hỗ trợ 4 kích thước.

```html
<app-icon name="robot" size="md" />
<app-icon name="settings" size="lg" />
```

| Input | Type | Mặc định | Mô tả |
|-------|------|----------|-------|
| `name` | `string` | *(required)* | Tên icon |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Kích thước |

**Icons có sẵn:**
`dashboard`, `robot`, `workflow`, `book`, `chart`, `settings`, `list`, `plus`, `template`, `document`, `database`, `terminal`, `analytics`, `key`, `users`, `chevron-right`, `chevron-down`, `home`, `bell`, `user-circle`

---

#### `BadgeComponent`
Path: [src/app/shared/components/atoms/badge/badge.component.ts](src/app/shared/components/atoms/badge/badge.component.ts)

Badge nhỏ dùng để hiển thị trạng thái.

```html
<app-badge label="Đang phát triển" variant="coming-soon" />
<app-badge label="Hoạt động" variant="success" />
```

| Input | Type | Mặc định | Mô tả |
|-------|------|----------|-------|
| `label` | `string` | *(required)* | Nội dung badge |
| `variant` | `BadgeVariant` | `'default'` | Màu sắc |

**Variants:** `default`, `success`, `warning`, `danger`, `info`, `coming-soon`

---

### Molecules

#### `AppLogoComponent`
Path: [src/app/shared/components/molecules/app-logo/app-logo.component.ts](src/app/shared/components/molecules/app-logo/app-logo.component.ts)

Logo ứng dụng gồm icon robot + tên "AI Agent Platform". Dùng trong Sidebar.

```html
<app-logo />
```

---

#### `NavItemComponent`
Path: [src/app/shared/components/molecules/nav-item/nav-item.component.ts](src/app/shared/components/molecules/nav-item/nav-item.component.ts)

Mục điều hướng trong sidebar. Nếu `item.children` tồn tại, tự động hiển thị **flyout submenu** khi hover.

```html
<app-nav-item [item]="navItem" />
```

| Input | Type | Mô tả |
|-------|------|-------|
| `item` | `NavItem` | Dữ liệu nav item |

**Flyout behavior:** Dùng thuần CSS (`:host:hover .flyout-menu` + `.flyout-menu:hover`), không cần JavaScript. Animation: `opacity` + `translateX` trong 150ms.

---

#### `NavSubItemComponent`
Path: [src/app/shared/components/molecules/nav-sub-item/nav-sub-item.component.ts](src/app/shared/components/molecules/nav-sub-item/nav-sub-item.component.ts)

Mục điều hướng cấp 2, hiển thị trong flyout panel.

```html
<app-nav-sub-item [item]="childNavItem" />
```

Tự động highlight khi route active nhờ `routerLinkActive`.

---

#### `BreadcrumbComponent`
Path: [src/app/shared/components/molecules/breadcrumb/breadcrumb.component.ts](src/app/shared/components/molecules/breadcrumb/breadcrumb.component.ts)

Thanh điều hướng dạng `Home > Agents > Tạo Agent`. Tự động cập nhật khi route thay đổi thông qua `BreadcrumbService`.

```html
<app-breadcrumb />
```

Không nhận input — tự lấy dữ liệu từ `BreadcrumbService`.

---

### Organisms

#### `SidebarComponent`
Path: [src/app/shared/components/organisms/sidebar/sidebar.component.ts](src/app/shared/components/organisms/sidebar/sidebar.component.ts)

Sidebar hoàn chỉnh gồm 3 phần:
- **Header**: Logo ứng dụng
- **Nav**: Danh sách `NavItemComponent`, lấy dữ liệu từ `NavigationService`
- **Footer**: Thông tin user

Kích thước cố định: `240px (w-60)`, nền tối `#1e2433`.

---

#### `HeaderComponent`
Path: [src/app/shared/components/organisms/header/header.component.ts](src/app/shared/components/organisms/header/header.component.ts)

Header ngang phía trên gồm:
- **Trái**: `BreadcrumbComponent`
- **Phải**: Nút thông báo + avatar user

Chiều cao cố định: `64px (h-16)`.

---

### Layouts

#### `AdminLayoutComponent`
Path: [src/app/layouts/admin-layout/admin-layout.component.ts](src/app/layouts/admin-layout/admin-layout.component.ts)

Bố cục tổng thể của admin UI. Kết hợp Sidebar + Header + `<router-outlet>`.

```
┌── AdminLayout ─────────────────────────────┐
│  ┌─ Sidebar ─┐  ┌─── Header ──────────────┐│
│  │           │  │  Breadcrumb  [Bell][User]││
│  │  Nav menu │  └─────────────────────────┘│
│  │           │  ┌─── Content ─────────────┐│
│  │           │  │  <router-outlet>        ││
│  │           │  │                         ││
│  │  [Footer] │  └─────────────────────────┘│
│  └───────────┘                              │
└────────────────────────────────────────────┘
```

---

### Pages

#### `DashboardComponent`
Path: [src/app/pages/dashboard/dashboard.component.ts](src/app/pages/dashboard/dashboard.component.ts)

Trang tổng quan hiển thị:
- 4 stat cards (Agents, Workflows, Tài liệu KB, API Calls)
- Quick actions (Tạo Agent, Tạo Workflow, Thêm tài liệu, Xem Logs)
- Welcome banner với CTA

#### `ComingSoonComponent`
Path: [src/app/pages/coming-soon/coming-soon.component.ts](src/app/pages/coming-soon/coming-soon.component.ts)

Placeholder page dùng cho tất cả tính năng chưa phát triển. Hiển thị icon, tiêu đề, mô tả và nút quay về Dashboard.

---

## Core Services

### `NavigationService`
Path: [src/app/core/services/navigation.service.ts](src/app/core/services/navigation.service.ts)

Quản lý dữ liệu navigation items và trạng thái active.

```typescript
// Lấy danh sách nav items
navService.navItems  // NavItem[]

// Đặt item đang active
navService.setActive('agents')

// Signal theo dõi item active
navService.activeItemId()  // string
```

**Thêm nav item mới:**
```typescript
// Trong NavigationService.navItems
{
  id: 'my-feature',
  label: 'Tính năng mới',
  icon: 'dashboard',    // Tên icon đã có trong IconComponent
  children: [
    { id: 'my-feature-list', label: 'Danh sách', icon: 'list', route: '/my-feature' },
  ],
},
```

---

### `BreadcrumbService`
Path: [src/app/core/services/breadcrumb.service.ts](src/app/core/services/breadcrumb.service.ts)

Tự động tạo breadcrumb bằng cách lắng nghe `NavigationEnd` events của Angular Router.

```typescript
// Signal chứa breadcrumb hiện tại
breadcrumbService.breadcrumbs()
// => [{ label: 'Agents', route: '/agents' }, { label: 'Tạo Agent', route: '/agents/create' }]
```

**Thêm label cho route mới:**
```typescript
// Trong BreadcrumbService.routeLabelMap
'my-feature': 'Tính năng mới',
'sub-page': 'Trang con',
```

---

## Navigation

Cấu trúc navigation được định nghĩa trong `NavigationService`:

```
Dashboard                    → /dashboard
│
├── Agents
│   ├── Tất cả Agents        → /agents
│   ├── Tạo Agent            → /agents/create
│   └── Templates            → /agents/templates
│
├── Workflows
│   ├── Tất cả Workflows     → /workflows
│   └── Tạo Workflow         → /workflows/create
│
├── Knowledge Base
│   ├── Tài liệu             → /knowledge-base/documents
│   └── Data Sources         → /knowledge-base/sources
│
├── Monitoring
│   ├── Logs                 → /monitoring/logs
│   └── Analytics            → /monitoring/analytics
│
└── Cài đặt
    ├── Chung                → /settings/general
    ├── API Keys             → /settings/api-keys
    └── Người dùng           → /settings/users
```

---

## Routing

File: [src/app/app.routes.ts](src/app/app.routes.ts)

Tất cả routes được lồng trong `AdminLayoutComponent`. Các pages được lazy load.

```typescript
// Pattern thêm route mới
{
  path: 'my-feature',
  loadComponent: () =>
    import('./pages/my-feature/my-feature.component').then(m => m.MyFeatureComponent),
},
```

---

## Hướng dẫn phát triển

### Yêu cầu

- Node.js v18+
- npm v9+
- Angular CLI v19 (`npm install -g @angular/cli@19`)

### Chạy dev server

```bash
ng serve
# Mở trình duyệt: http://localhost:4200
```

### Build production

```bash
ng build
# Output: dist/agent-administation/
```

### Generate component (theo Atomic Design)

```bash
# Atom
ng generate component shared/components/atoms/my-atom

# Molecule
ng generate component shared/components/molecules/my-molecule

# Organism
ng generate component shared/components/organisms/my-organism

# Page
ng generate component pages/my-page
```

---

## Thêm tính năng mới

### Bước 1: Thêm nav item

Mở [src/app/core/services/navigation.service.ts](src/app/core/services/navigation.service.ts) và thêm vào mảng `navItems`:

```typescript
{
  id: 'analytics',
  label: 'Analytics',
  icon: 'chart',
  children: [
    { id: 'analytics-overview', label: 'Tổng quan', icon: 'dashboard', route: '/analytics' },
  ],
},
```

### Bước 2: Thêm breadcrumb label

Mở [src/app/core/services/breadcrumb.service.ts](src/app/core/services/breadcrumb.service.ts) và thêm vào `routeLabelMap`:

```typescript
'analytics': 'Analytics',
'overview': 'Tổng quan',
```

### Bước 3: Tạo page component

```bash
ng generate component pages/analytics
```

Hoặc tạo thủ công tại `src/app/pages/analytics/analytics.component.ts`.

### Bước 4: Thêm route

Mở [src/app/app.routes.ts](src/app/app.routes.ts) và thêm route mới:

```typescript
{
  path: 'analytics',
  loadComponent: () =>
    import('./pages/analytics/analytics.component').then(m => m.AnalyticsComponent),
},
```

### Bước 5: Thêm icon mới (nếu cần)

Mở [src/app/shared/components/atoms/icon/icon.component.ts](src/app/shared/components/atoms/icon/icon.component.ts) và thêm SVG vào object `ICONS`:

```typescript
const ICONS: Record<string, string> = {
  // ... icons hiện có ...
  'my-icon': `<svg xmlns="http://www.w3.org/2000/svg" ...>...</svg>`,
};
```

---

## Màu sắc & Theming

Màu sắc được định nghĩa trong [tailwind.config.js](tailwind.config.js):

| Token | Giá trị | Dùng cho |
|-------|---------|----------|
| `sidebar-bg` | `#1e2433` | Nền sidebar |
| `sidebar-hover` | `#2a3347` | Hover state nav item |
| `sidebar-active` | `#3b4a6b` | Active state nav item |
| `sidebar-text` | `#a0aec0` | Màu chữ trong sidebar |
| `sidebar-border` | `#2d3748` | Border sidebar |
| `brand-500` | `#3b82f6` | Màu primary (xanh dương) |
| `brand-600` | `#2563eb` | Hover primary |

---

*Được tạo với Angular 19 + Tailwind CSS 3 theo Atomic Design pattern.*
