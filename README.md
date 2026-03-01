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
| **Atoms** | Phần tử UI nhỏ nhất, không thể chia nhỏ hơn | Icon, Badge, Toast |
| **Molecules** | Kết hợp các atoms thành đơn vị có ý nghĩa | NavItem, Breadcrumb, AppLogo |
| **Organisms** | Nhóm molecules tạo thành section giao diện | Sidebar, Header |
| **Layouts** | Bố cục tổng thể, chứa organisms | AdminLayout |
| **Pages** | Màn hình cụ thể, được load vào layout | Dashboard, AgentHub, ComingSoon |

---

## Cấu trúc thư mục

```
src/
└── app/
    ├── core/                          # Logic nghiệp vụ cốt lõi
    │   ├── models/
    │   │   ├── nav-item.model.ts      # Interface NavItem
    │   │   ├── breadcrumb.model.ts    # Interface Breadcrumb
    │   │   ├── agent.model.ts         # Interface Agent, AgentModel, ChatMessage
    │   │   └── resource.model.ts      # Interface Resource, HttpSchema, AgentSchema
    │   └── services/
    │       ├── navigation.service.ts  # Dữ liệu nav items + active state
    │       ├── breadcrumb.service.ts  # Auto-generate breadcrumb từ route
    │       ├── agent.service.ts       # CRUD agents + chat API (mock)
    │       ├── resource.service.ts    # CRUD resources + system prompt API (mock)
    │       └── toast.service.ts       # Global toast notifications
    │
    ├── shared/
    │   └── components/
    │       ├── atoms/
    │       │   ├── icon/              # SVG icon wrapper (Heroicons)
    │       │   ├── badge/             # Status badge
    │       │   └── toast/             # Toast notification container
    │       ├── molecules/
    │       │   ├── app-logo/          # Logo + tên ứng dụng
    │       │   ├── nav-item/          # Nav item với flyout submenu
    │       │   ├── nav-sub-item/      # Sub-menu item
    │       │   ├── breadcrumb/        # Breadcrumb trail
    │       │   ├── pagination/        # Pagination component
    │       │   └── search-panel/      # Search filter panel
    │       └── organisms/
    │           ├── sidebar/           # Sidebar hoàn chỉnh
    │           └── header/            # Header hoàn chỉnh
    │
    ├── layouts/
    │   └── admin-layout/              # Bố cục admin (sidebar + header + content)
    │
    ├── pages/
    │   ├── agent-hub/                 # Agent Management Hub (tính năng chính)
    │   │   ├── agent-hub.component.ts         # Main orchestrator page
    │   │   ├── agent-sidebar.component.ts     # Agent list sidebar (trái)
    │   │   ├── agent-detail.component.ts      # Detail panel với 4 tabs (phải)
    │   │   ├── tab-general.component.ts       # Tab: General info + inline edit
    │   │   ├── tab-resources.component.ts     # Tab: Tools & Resources
    │   │   ├── tab-system-prompt.component.ts # Tab: System Prompt preview
    │   │   ├── tab-chat.component.ts          # Tab: Test Chat
    │   │   └── delete-confirm-modal.component.ts # Confirmation modal
    │   ├── agents/
    │   │   └── agent-list.component.ts  # Legacy list view
    │   ├── dashboard/
    │   │   └── dashboard.component.ts
    │   └── coming-soon/
    │       └── coming-soon.component.ts
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
`dashboard`, `robot`, `workflow`, `book`, `chart`, `settings`, `list`, `plus`, `template`, `document`, `database`, `terminal`, `analytics`, `key`, `users`, `chevron-right`, `chevron-down`, `home`, `bell`, `user-circle`, `trash`, `x-mark`, `check`, `globe`, `send`, `arrow-path`, `chat-bubble`, `document-text`, `spinner`

---

#### `BadgeComponent`
Path: [src/app/shared/components/atoms/badge/badge.component.ts](src/app/shared/components/atoms/badge/badge.component.ts)

Badge nhỏ dùng để hiển thị trạng thái.

**Variants:** `default`, `success`, `warning`, `danger`, `info`, `coming-soon`

---

#### `ToastContainerComponent`
Path: [src/app/shared/components/atoms/toast/toast.component.ts](src/app/shared/components/atoms/toast/toast.component.ts)

Container hiển thị stack toast notifications ở góc dưới phải màn hình. Tự động đọc từ `ToastService`.

```html
<app-toast-container />
```

---

### Molecules

#### `AppLogoComponent`
Path: [src/app/shared/components/molecules/app-logo/app-logo.component.ts](src/app/shared/components/molecules/app-logo/app-logo.component.ts)

Logo ứng dụng gồm icon robot + tên "AI Agent Platform". Dùng trong Sidebar.

---

#### `NavItemComponent`
Path: [src/app/shared/components/molecules/nav-item/nav-item.component.ts](src/app/shared/components/molecules/nav-item/nav-item.component.ts)

Mục điều hướng trong sidebar. Nếu `item.children` tồn tại, tự động hiển thị **flyout submenu** khi hover.

---

#### `BreadcrumbComponent`
Path: [src/app/shared/components/molecules/breadcrumb/breadcrumb.component.ts](src/app/shared/components/molecules/breadcrumb/breadcrumb.component.ts)

Thanh điều hướng dạng `Home > Agents`. Tự động cập nhật khi route thay đổi.

---

### Organisms

#### `SidebarComponent`
Path: [src/app/shared/components/organisms/sidebar/sidebar.component.ts](src/app/shared/components/organisms/sidebar/sidebar.component.ts)

Sidebar hoàn chỉnh gồm Logo + Nav + Footer user. Kích thước cố định `240px`, nền tối `#1e2433`.

---

#### `HeaderComponent`
Path: [src/app/shared/components/organisms/header/header.component.ts](src/app/shared/components/organisms/header/header.component.ts)

Header ngang phía trên gồm breadcrumb + nút thông báo + avatar user. Chiều cao cố định `64px`.

---

### Layouts

#### `AdminLayoutComponent`
Path: [src/app/layouts/admin-layout/admin-layout.component.ts](src/app/layouts/admin-layout/admin-layout.component.ts)

Bố cục tổng thể: Sidebar + Header + `<router-outlet>`. Content area dùng `overflow-hidden` để cho phép các page con tự quản lý scroll và padding.

---

### Pages

#### `AgentHubComponent` ⭐
Path: [src/app/pages/agent-hub/agent-hub.component.ts](src/app/pages/agent-hub/agent-hub.component.ts)

Màn hình quản lý Agent - master-detail layout 2 cột với 4 tabs chi tiết:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Agent Hub                                              [+ New Agent]   │
├──────────────┬──────────────────────────────────────────────────────────┤
│              │                                                          │
│  AGENTS      │  [General] [Tools & Resources] [System Prompt] [Chat]   │
│  ──────────  │  ──────────────────────────────────────────────────────  │
│  > Agent A   │                                                          │
│    Agent B   │              (Tab content)                               │
│    Agent C   │                                                          │
│              │                                                          │
└──────────────┴──────────────────────────────────────────────────────────┘
```

**Sub-components:**

| Component | File | Mô tả |
|-----------|------|-------|
| `AgentSidebarComponent` | `agent-sidebar.component.ts` | Sidebar trái: list agents, inline rename (double-click), tạo mới |
| `AgentDetailComponent` | `agent-detail.component.ts` | Panel phải: 4-tab navigation |
| `TabGeneralComponent` | `tab-general.component.ts` | Tab General: inline edit Name, Model, Context + Delete |
| `TabResourcesComponent` | `tab-resources.component.ts` | Tab Tools & Resources: HTTP resources + Agent resources |
| `TabSystemPromptComponent` | `tab-system-prompt.component.ts` | Tab System Prompt: preview + Rebuild & Save |
| `TabChatComponent` | `tab-chat.component.ts` | Tab Chat: test agent với full chat interface |
| `DeleteConfirmModalComponent` | `delete-confirm-modal.component.ts` | Modal xác nhận xóa (shared) |

**Tính năng Inline Edit:**
- Double-click vào text → chuyển sang edit mode ngay tại chỗ
- `Enter` / nút `Save ✓` → validate + gọi API + đóng edit mode
- `Escape` / nút `Cancel` → hủy, khôi phục giá trị cũ
- Validation: viền đỏ + error message khi field không hợp lệ
- Saving state: spinner trên nút Save khi đang gọi API

**API Mapping:**

| Hành động | Method | Endpoint |
|-----------|--------|----------|
| Load agents | GET | `/v1/agents` |
| Load agent | GET | `/v1/agents/{id}` |
| Tạo agent | POST | `/v1/agents` |
| Cập nhật agent | PUT | `/v1/agents/{id}` |
| Xóa agent | DELETE | `/v1/agents/{id}` |
| Load models | GET | `/v1/models` |
| Load resources | GET | `/v1/resources/agent/{agentId}` |
| Tạo resource | POST | `/v1/resources` |
| Cập nhật resource | PUT | `/v1/resources/{id}` |
| Xóa resource | DELETE | `/v1/resources/{id}` |
| Preview system prompt | GET | `/v1/resources/agent/{agentId}/prompt` |
| Rebuild & Save prompt | POST | `/v1/resources/agent/{agentId}/save` |
| Chat với agent | POST | `/v1/agents/chat` |

> **Mock data:** Services hiện dùng in-memory mock data (Observable + delay). Thay bằng `HttpClient` calls khi backend sẵn sàng bằng cách uncomment HTTP code trong service files.

---

#### `DashboardComponent`
Path: [src/app/pages/dashboard/dashboard.component.ts](src/app/pages/dashboard/dashboard.component.ts)

Trang tổng quan: 4 stat cards, quick actions, welcome banner.

---

#### `ComingSoonComponent`
Path: [src/app/pages/coming-soon/coming-soon.component.ts](src/app/pages/coming-soon/coming-soon.component.ts)

Placeholder page dùng cho tất cả tính năng chưa phát triển.

---

## Core Services

### `AgentService`
Path: [src/app/core/services/agent.service.ts](src/app/core/services/agent.service.ts)

```typescript
agentSvc.getAgents()                        // Observable<Agent[]>
agentSvc.createAgent({ name })              // Observable<Agent>
agentSvc.updateAgent(id, { name, modelId }) // Observable<Agent>
agentSvc.deleteAgent(id)                    // Observable<void>
agentSvc.getModels()                        // Observable<AgentModel[]>
agentSvc.chat({ agentId, messages })        // Observable<ChatResponse>
```

### `ResourceService`
Path: [src/app/core/services/resource.service.ts](src/app/core/services/resource.service.ts)

```typescript
resourceSvc.getByAgent(agentId)    // Observable<Record<type, Resource[]>>
resourceSvc.create(data)           // Observable<Resource>
resourceSvc.update(id, data)       // Observable<Resource>
resourceSvc.delete(id)             // Observable<void>
resourceSvc.getPrompt(agentId)     // Observable<{ prompt: string }>
resourceSvc.savePrompt(agentId)    // Observable<{ prompt: string }>
```

### `ToastService`
Path: [src/app/core/services/toast.service.ts](src/app/core/services/toast.service.ts)

```typescript
toastSvc.success('Saved')                // Toast xanh, tự ẩn sau 2s
toastSvc.error('Failed to update')       // Toast đỏ, tự ẩn sau 4s
```

### `NavigationService`
Path: [src/app/core/services/navigation.service.ts](src/app/core/services/navigation.service.ts)

Quản lý dữ liệu navigation items và trạng thái active.

### `BreadcrumbService`
Path: [src/app/core/services/breadcrumb.service.ts](src/app/core/services/breadcrumb.service.ts)

Tự động tạo breadcrumb bằng cách lắng nghe `NavigationEnd` events của Angular Router.

---

## Navigation

```
Dashboard                    → /dashboard
│
├── Agents
│   ├── Danh mục Agent       → /agents  (Agent Hub ⭐)
│   └── Multi-agent          → /agents/multi
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
  id: 'my-feature',
  label: 'Tính năng mới',
  icon: 'dashboard',
  children: [
    { id: 'my-feature-list', label: 'Danh sách', icon: 'list', route: '/my-feature' },
  ],
},
```

### Bước 2: Thêm breadcrumb label

Mở [src/app/core/services/breadcrumb.service.ts](src/app/core/services/breadcrumb.service.ts) và thêm vào `routeLabelMap`:

```typescript
'my-feature': 'Tính năng mới',
```

### Bước 3: Tạo page component

```bash
ng generate component pages/my-feature
```

Lưu ý: Page component cần tự quản lý padding và scroll (vì `AdminLayoutComponent` dùng `overflow-hidden`). Thêm vào root element của template:

```html
<div class="p-6 overflow-y-auto h-full">
  ...
</div>
```

### Bước 4: Thêm route

Mở [src/app/app.routes.ts](src/app/app.routes.ts):

```typescript
{
  path: 'my-feature',
  loadComponent: () =>
    import('./pages/my-feature/my-feature.component').then(m => m.MyFeatureComponent),
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

### Kết nối backend thực

Để thay thế mock data bằng API thực:

1. Thêm `provideHttpClient()` vào [src/app/app.config.ts](src/app/app.config.ts):

```typescript
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(),
  ],
};
```

2. Inject `HttpClient` và thay thế `of(mock).pipe(delay())` bằng HTTP calls trong `AgentService` và `ResourceService`.

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
| `brand-500` | `#6366f1` | Màu primary (indigo) |
| `brand-600` | Darker | Hover primary |

---

*Được tạo với Angular 19 + Tailwind CSS 3 theo Atomic Design pattern.*
