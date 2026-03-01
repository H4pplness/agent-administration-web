import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Skill, SkillStatus } from '../../core/models/skill.model';
import { SkillService } from '../../core/services/skill.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastContainerComponent } from '../../shared/components/atoms/toast/toast.component';

type FilterStatus = 'all' | SkillStatus;
type SortOrder = 'newest' | 'oldest' | 'name' | 'usage';

@Component({
  selector: 'app-skills-list',
  standalone: true,
  imports: [FormsModule, ToastContainerComponent],
  host: { class: 'block h-full' },
  template: `
    <div class="h-full overflow-y-auto bg-gray-50 p-6">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold text-gray-900 tracking-wide uppercase">
            🛠️ Skills Management
          </h1>
          <p class="text-sm text-gray-500 mt-0.5">Quản lý kỹ năng và công cụ cho AI Agent</p>
        </div>
        <button (click)="goToCreate()"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tạo Skill mới
        </button>
      </div>

      <!-- Search + Filters -->
      <div class="flex flex-col sm:flex-row gap-3 mb-5">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input type="text" placeholder="Tìm kiếm skill..." [(ngModel)]="searchText"
            class="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select [(ngModel)]="filterStatus"
          class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">Lọc: Tất cả</option>
          <option value="active">Hoạt động</option>
          <option value="draft">Bản nháp</option>
          <option value="error">Lỗi</option>
        </select>
        <select [(ngModel)]="sortOrder"
          class="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="newest">Sắp xếp: Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="name">Tên A-Z</option>
          <option value="usage">Sử dụng nhiều</option>
        </select>
      </div>

      <!-- Status Bar -->
      @if (!loading()) {
        <div class="flex items-center gap-4 px-4 py-2.5 bg-white border border-gray-200 rounded-lg mb-5 text-sm">
          <span class="font-medium text-gray-600">📊 Trạng thái hệ thống:</span>
          <span class="flex items-center gap-1.5 text-green-600 font-medium">
            <span class="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
            {{ activeCount() }} Hoạt động
          </span>
          <span class="flex items-center gap-1.5 text-yellow-600 font-medium">
            <span class="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
            {{ draftCount() }} Bản nháp
          </span>
          <span class="flex items-center gap-1.5 text-red-600 font-medium">
            <span class="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
            {{ errorCount() }} Lỗi kết nối
          </span>
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center justify-center h-48">
          <svg class="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
      }

      <!-- Skills Grid -->
      @if (!loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          @for (skill of filteredSkills(); track skill.id) {
            <div class="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <!-- Header -->
              <div class="px-4 pt-4 pb-3 border-b border-gray-100">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="text-xl flex-shrink-0">{{ skill.icon }}</span>
                    <h3 class="font-semibold text-gray-900 truncate text-sm">{{ skill.name }}</h3>
                  </div>
                  <span [class]="statusBadgeClass(skill.status)"
                    class="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium">
                    {{ statusLabel(skill.status) }}
                  </span>
                </div>
              </div>

              <!-- Body -->
              <div class="px-4 py-3 flex-1">
                <p class="text-xs text-gray-500 leading-relaxed line-clamp-3">{{ skill.description }}</p>
              </div>

              <!-- Footer -->
              <div class="px-4 pb-4">
                <div class="flex items-center justify-end text-xs text-gray-400 mb-3">
                  <span>Sử dụng: <strong class="text-gray-600">{{ formatUsage(skill.usageCount) }}</strong></span>
                </div>
                <div class="flex items-center gap-2">
                  <button (click)="goToEdit(skill.id)"
                    class="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                    </svg>
                    Chỉnh sửa
                  </button>
                  <button (click)="confirmDelete(skill)"
                    class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa skill">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- Add new card -->
          <button (click)="goToCreate()"
            class="bg-white border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 min-h-[180px] hover:border-indigo-400 hover:bg-indigo-50 transition-all group">
            <div class="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
              <svg class="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-400 group-hover:text-indigo-600 transition-colors">Thêm Skill mới</span>
          </button>

          @if (filteredSkills().length === 0) {
            <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <span class="text-5xl mb-3">🔍</span>
              <p class="text-gray-500 font-medium">Không tìm thấy skill nào</p>
              <p class="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          }
        </div>
      }
    </div>

    <!-- Delete Modal -->
    @if (deletingSkill()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" (click)="cancelDelete()">
        <div class="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4" (click)="$event.stopPropagation()">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Xóa Skill</h3>
              <p class="text-sm text-gray-500">Hành động này không thể hoàn tác</p>
            </div>
          </div>
          <p class="text-sm text-gray-600 mb-5">
            Bạn có chắc muốn xóa skill <strong>"{{ deletingSkill()!.name }}"</strong>?
          </p>
          <div class="flex gap-3">
            <button (click)="cancelDelete()"
              class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Hủy
            </button>
            <button (click)="doDelete()" [disabled]="deleting()"
              class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors">
              @if (deleting()) { <span>Đang xóa...</span> } @else { <span>Xóa</span> }
            </button>
          </div>
        </div>
      </div>
    }

    <app-toast-container />
  `,
})
export class SkillsListComponent implements OnInit {
  private skillSvc = inject(SkillService);
  private toastSvc = inject(ToastService);
  private router   = inject(Router);

  skills        = signal<Skill[]>([]);
  loading       = signal(true);
  deletingSkill = signal<Skill | null>(null);
  deleting      = signal(false);

  searchText   = '';
  filterStatus: FilterStatus = 'all';
  sortOrder: SortOrder = 'newest';

  activeCount = computed(() => this.skills().filter(s => s.status === 'active').length);
  draftCount  = computed(() => this.skills().filter(s => s.status === 'draft').length);
  errorCount  = computed(() => this.skills().filter(s => s.status === 'error').length);

  filteredSkills = computed(() => {
    let list = this.skills();
    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      );
    }
    if (this.filterStatus !== 'all') {
      list = list.filter(s => s.status === this.filterStatus);
    }
    switch (this.sortOrder) {
      case 'newest': list = [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); break;
      case 'oldest': list = [...list].sort((a, b) => a.updatedAt.localeCompare(b.updatedAt)); break;
      case 'name':   list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'usage':  list = [...list].sort((a, b) => b.usageCount - a.usageCount); break;
    }
    return list;
  });

  ngOnInit(): void {
    this.skillSvc.getSkills().subscribe({
      next: skills => { this.skills.set(skills); this.loading.set(false); },
      error: () => { this.toastSvc.error('Không thể tải danh sách skills'); this.loading.set(false); },
    });
  }

  goToCreate(): void { this.router.navigate(['/knowledge-base/skills/new']); }
  goToEdit(id: number): void { this.router.navigate(['/knowledge-base/skills', id, 'edit']); }

  confirmDelete(skill: Skill): void { this.deletingSkill.set(skill); }
  cancelDelete(): void { if (!this.deleting()) this.deletingSkill.set(null); }

  doDelete(): void {
    const skill = this.deletingSkill();
    if (!skill) return;
    this.deleting.set(true);
    this.skillSvc.deleteSkill(skill.id).subscribe({
      next: () => {
        this.skills.update(list => list.filter(s => s.id !== skill.id));
        this.toastSvc.success('Skill đã được xóa');
        this.deletingSkill.set(null);
        this.deleting.set(false);
      },
      error: () => { this.toastSvc.error('Xóa skill thất bại'); this.deleting.set(false); },
    });
  }

  statusLabel(status: SkillStatus): string {
    return { active: '● Hoạt động', draft: '○ Bản nháp', error: '⚠ Lỗi' }[status];
  }

  statusBadgeClass(status: SkillStatus): string {
    return {
      active: 'bg-green-100 text-green-700',
      draft:  'bg-yellow-100 text-yellow-700',
      error:  'bg-red-100 text-red-700',
    }[status];
  }

  formatUsage(count: number): string {
    return count >= 1000 ? Math.floor(count / 100) / 10 + 'k+' : String(count);
  }
}
