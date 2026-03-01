import { Component, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Skill, SkillStatus } from '../../core/models/skill.model';
import { SkillService } from '../../core/services/skill.service';
import { ToastService } from '../../core/services/toast.service';
import { ToastContainerComponent } from '../../shared/components/atoms/toast/toast.component';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';

const ICONS = ['📋', '📝', '🌐', '🐍', '📧', '📊', '🛒', '🌤️', '🔧', '⚙️',
               '🤖', '🔍', '💡', '🚀', '🛡️', '📡', '🔗', '💾', '🗄️', '📄'];

@Component({
  selector: 'app-skill-editor',
  standalone: true,
  imports: [FormsModule, MarkdownPipe, ToastContainerComponent],
  host: { class: 'block h-full' },
  template: `
    <div class="h-full flex flex-col bg-gray-50">

      <!-- ── Top bar ────────────────────────────────────────────────── -->
      <div class="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">

        <!-- Inline-edit name -->
        @if (!editingName()) {
          <span (dblclick)="startEditName()"
            title="Double-click để sửa tên"
            class="flex-1 min-w-0 text-sm font-semibold truncate cursor-default select-none"
            [class.text-gray-900]="form.name"
            [class.text-gray-400]="!form.name">
            {{ form.name || 'Double-click để đặt tên...' }}
          </span>
        } @else {
          <input #nameInput type="text" [(ngModel)]="form.name"
            placeholder="Nhập tên skill..."
            (blur)="stopEditName()"
            (keydown.enter)="stopEditName()"
            (keydown.escape)="cancelEditName()"
            class="flex-1 min-w-0 text-sm font-semibold text-gray-900 border border-indigo-400 rounded-lg px-3 py-1
                   focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        }

        <div class="ml-auto flex items-center gap-2 flex-shrink-0">
          <button (click)="goBack()"
            class="px-4 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Hủy
          </button>
          <button (click)="save()" [disabled]="saving()"
            class="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
                   disabled:opacity-60 rounded-lg transition-colors">
            @if (saving()) {
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            }
            Lưu Skill
          </button>
        </div>
      </div>

      <!-- ── Loading ────────────────────────────────────────────────── -->
      @if (loading()) {
        <div class="flex-1 flex items-center justify-center">
          <svg class="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
      }

      <!-- ── Main: two columns ──────────────────────────────────────── -->
      @if (!loading()) {
        <div class="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-2 overflow-hidden">

          <!-- ══════════ LEFT: Editor ══════════ -->
          <div class="border-r border-gray-200 overflow-y-auto flex flex-col">

            <!-- Meta row: icon + status + description -->
            <div class="flex-shrink-0 p-5 border-b border-gray-100 space-y-3">
              <div class="flex items-center gap-3">

                <!-- Icon picker -->
                <div class="relative">
                  <button (click)="iconPickerOpen.set(!iconPickerOpen())"
                    class="w-10 h-10 text-xl rounded-xl border-2 border-gray-200 hover:border-indigo-400 flex items-center justify-center transition-colors"
                    title="Chọn icon">
                    {{ form.icon }}
                  </button>
                  @if (iconPickerOpen()) {
                    <div class="absolute top-12 left-0 z-20 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 grid grid-cols-5 gap-1 w-44">
                      @for (ic of icons; track ic) {
                        <button (click)="form.icon = ic; iconPickerOpen.set(false)"
                          class="text-xl p-1.5 rounded-lg hover:bg-indigo-50 transition-colors leading-none"
                          [class.bg-indigo-100]="form.icon === ic">{{ ic }}</button>
                      }
                    </div>
                  }
                </div>

                <!-- Status -->
                <select [(ngModel)]="form.status"
                  class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="active">● Hoạt động</option>
                  <option value="draft">○ Bản nháp</option>
                  <option value="error">⚠ Lỗi</option>
                </select>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Mô tả ngắn
                </label>
                <input type="text" [(ngModel)]="form.description"
                  placeholder="Mô tả ngắn hiển thị trên card danh sách..."
                  class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <!-- Markdown editor -->
            <div class="flex-1 flex flex-col p-5 min-h-0">
              <div class="flex items-center justify-between mb-2">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  ✍️ Nội dung Markdown
                </label>
                <span class="text-xs text-gray-400">{{ form.markdown.length }} ký tự</span>
              </div>
              <textarea [(ngModel)]="form.markdown"
                placeholder="# Tên Skill&#10;&#10;## Mô tả&#10;Viết mô tả chi tiết...&#10;&#10;## Hướng dẫn cho AI&#10;Viết hướng dẫn khi nào và cách nào để dùng skill này..."
                class="flex-1 w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500
                       font-mono leading-relaxed resize-none bg-gray-900 text-gray-100 min-h-[400px]">
              </textarea>
            </div>
          </div>

          <!-- ══════════ RIGHT: Preview ══════════ -->
          <div class="overflow-y-auto flex flex-col">

            <!-- Preview header -->
            <div class="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
              <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">📄 Preview</span>
              <button (click)="copyMarkdown()"
                class="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                </svg>
                Sao chép MD
              </button>
            </div>

            <!-- Rendered markdown -->
            <div class="flex-1 p-6 overflow-y-auto">
              @if (form.markdown.trim()) {
                <div [innerHTML]="form.markdown | markdown"
                  class="prose-sm max-w-none">
                </div>
              } @else {
                <div class="flex flex-col items-center justify-center h-full text-center py-16">
                  <span class="text-5xl mb-4">📝</span>
                  <p class="text-sm font-medium text-gray-500">Chưa có nội dung</p>
                  <p class="text-xs text-gray-400 mt-1">Bắt đầu viết Markdown ở bên trái để xem preview tại đây</p>
                </div>
              }
            </div>
          </div>

        </div>
      }

    </div>

    <app-toast-container />
  `,
})
export class SkillEditorComponent implements OnInit {
  private skillSvc = inject(SkillService);
  private toastSvc = inject(ToastService);
  private router   = inject(Router);
  private route    = inject(ActivatedRoute);

  loading = signal(true);
  saving  = signal(false);
  isNew   = signal(true);
  skillId = signal<number | null>(null);

  editingName    = signal(false);
  iconPickerOpen = signal(false);

  @ViewChild('nameInput') nameInputRef?: ElementRef<HTMLInputElement>;
  private _prevName = '';

  readonly icons = ICONS;

  form: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'> = {
    name: '',
    description: '',
    status: 'draft',
    icon: '📋',
    usageCount: 0,
    markdown: '',
  };

  // ── Lifecycle ─────────────────────────────────────────────────────────

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.isNew.set(false);
      const id = Number(idParam);
      this.skillId.set(id);
      this.skillSvc.getSkill(id).subscribe({
        next: skill => {
          this.form = {
            name: skill.name,
            description: skill.description,
            status: skill.status,
            icon: skill.icon,
            usageCount: skill.usageCount,
            markdown: skill.markdown,
          };
          this.loading.set(false);
        },
        error: () => {
          this.toastSvc.error('Không thể tải skill');
          this.loading.set(false);
        },
      });
    } else {
      this.loading.set(false);
    }
  }

  // ── Inline name edit ──────────────────────────────────────────────────

  startEditName(): void {
    this._prevName = this.form.name;
    this.editingName.set(true);
    setTimeout(() => this.nameInputRef?.nativeElement.focus(), 0);
  }

  stopEditName(): void {
    this.editingName.set(false);
  }

  cancelEditName(): void {
    this.form.name = this._prevName;
    this.editingName.set(false);
  }

  // ── Save ──────────────────────────────────────────────────────────────

  save(): void {
    if (!this.form.name.trim()) {
      this.toastSvc.error('Tên skill không được để trống');
      return;
    }
    this.saving.set(true);
    const id = this.skillId();
    const obs = id
      ? this.skillSvc.updateSkill(id, this.form as Partial<Skill>)
      : this.skillSvc.createSkill(this.form);

    obs.subscribe({
      next: saved => {
        this.toastSvc.success(id ? 'Skill đã được cập nhật' : 'Skill đã được tạo');
        this.saving.set(false);
        if (!id) {
          this.isNew.set(false);
          this.skillId.set(saved.id);
          this.router.navigate(['/knowledge-base/skills', saved.id, 'edit'], { replaceUrl: true });
        }
      },
      error: () => {
        this.toastSvc.error('Lưu thất bại');
        this.saving.set(false);
      },
    });
  }

  // ── Misc ──────────────────────────────────────────────────────────────

  copyMarkdown(): void {
    navigator.clipboard.writeText(this.form.markdown).then(
      () => this.toastSvc.success('Đã sao chép Markdown'),
      () => this.toastSvc.error('Không thể sao chép'),
    );
  }

  goBack(): void {
    this.router.navigate(['/knowledge-base/skills']);
  }
}
