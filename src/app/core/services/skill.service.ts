import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Skill } from '../models/skill.model';

let _nextId = 8;
let _skills: Skill[] = [
  {
    id: 1,
    name: 'Google Search',
    description: 'Tìm kiếm thông tin thời gian thực trên Internet.',
    status: 'active',
    icon: '🌐',
    usageCount: 1240,
    markdown: `# 🌐 Google Search

**Trạng thái:** Hoạt động | **Sử dụng:** 1,240 lần

---

## Mô tả

Skill tìm kiếm thông tin thời gian thực trên Internet thông qua Google Custom Search API.

## Hướng dẫn cho AI

Sử dụng skill này khi người dùng hỏi về thông tin cần tìm kiếm trực tuyến, tin tức mới nhất, hoặc bất kỳ chủ đề nào cần tra cứu thực tế.

> **Lưu ý:** Không sử dụng khi câu hỏi đã có trong context hiện tại.

## Tham số

| Tên | Mô tả | Bắt buộc |
|-----|-------|----------|
| \`query\` | Từ khóa tìm kiếm | ✓ |
| \`limit\` | Số kết quả tối đa (mặc định: 5) | - |

## Ví dụ sử dụng

\`\`\`json
{
  "query": "giá vàng hôm nay",
  "limit": 3
}
\`\`\`

## Kết quả trả về

Danh sách các kết quả tìm kiếm gồm tiêu đề, URL và đoạn mô tả ngắn.`,
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-02-15T10:30:00Z',
  },
  {
    id: 2,
    name: 'Python Executor',
    description: 'Thực thi mã Python để xử lý dữ liệu, vẽ đồ thị và tính toán.',
    status: 'active',
    icon: '🐍',
    usageCount: 450,
    markdown: `# 🐍 Python Executor

**Trạng thái:** Hoạt động | **Sử dụng:** 450 lần

---

## Mô tả

Thực thi đoạn mã Python trong môi trường sandbox an toàn. Hỗ trợ xử lý dữ liệu, tính toán thống kê và tạo biểu đồ.

## Hướng dẫn cho AI

Sử dụng khi:
- Người dùng yêu cầu tính toán phức tạp
- Cần xử lý dữ liệu (lọc, sắp xếp, tổng hợp)
- Vẽ biểu đồ hoặc trực quan hóa dữ liệu

**Không sử dụng** cho các tác vụ đơn giản có thể xử lý trực tiếp.

## Tham số

| Tên | Mô tả | Bắt buộc |
|-----|-------|----------|
| \`code\` | Mã Python cần thực thi | ✓ |
| \`timeout\` | Thời gian chờ tối đa (giây, mặc định: 30) | - |

## Ví dụ

\`\`\`python
import statistics
data = [10, 20, 30, 40, 50]
print(f"Mean: {statistics.mean(data)}")
print(f"Stdev: {statistics.stdev(data):.2f}")
\`\`\`

## Giới hạn

- Không có quyền truy cập file system
- Không kết nối mạng bên ngoài
- Bộ nhớ tối đa: 256MB`,
    createdAt: '2025-01-15T09:00:00Z',
    updatedAt: '2025-02-20T14:00:00Z',
  },
  {
    id: 3,
    name: 'Gmail Sender',
    description: 'Tự động gửi email báo cáo và thông báo cho khách hàng.',
    status: 'draft',
    icon: '📧',
    usageCount: 89,
    markdown: `# 📧 Gmail Sender

**Trạng thái:** Bản nháp | **Sử dụng:** 89 lần

---

## Mô tả

Gửi email tự động qua Gmail API. Hỗ trợ email văn bản thuần và HTML.

## Hướng dẫn cho AI

Sử dụng khi người dùng yêu cầu:
- Gửi báo cáo qua email
- Thông báo kết quả xử lý
- Gửi xác nhận đặt hàng / lịch hẹn

> ⚠️ **Luôn xác nhận** với người dùng trước khi gửi email thật.

## Tham số

| Tên | Mô tả | Bắt buộc |
|-----|-------|----------|
| \`to\` | Địa chỉ email nhận | ✓ |
| \`subject\` | Tiêu đề email | ✓ |
| \`body\` | Nội dung email (hỗ trợ HTML) | ✓ |
| \`cc\` | CC (tuỳ chọn) | - |

## Lưu ý bảo mật

- Chỉ gửi đến địa chỉ email đã được whitelist
- Không gửi thông tin nhạy cảm qua email`,
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2025-02-28T09:00:00Z',
  },
  {
    id: 4,
    name: 'SQL Customer DB',
    description: 'Truy vấn dữ liệu khách hàng từ Database nội bộ của công ty.',
    status: 'error',
    icon: '📊',
    usageCount: 310,
    markdown: `# 📊 SQL Customer DB

**Trạng thái:** ⚠️ Lỗi kết nối | **Sử dụng:** 310 lần

---

## Mô tả

Truy vấn cơ sở dữ liệu khách hàng nội bộ thông qua API proxy an toàn. Chỉ hỗ trợ câu lệnh SELECT.

## Hướng dẫn cho AI

Sử dụng khi cần:
- Tra cứu thông tin khách hàng theo ID / email / tên
- Kiểm tra lịch sử đặt hàng
- Thống kê doanh thu theo khoảng thời gian

**Chỉ thực hiện câu lệnh SELECT** — không INSERT, UPDATE, DELETE.

## Tham số

| Tên | Mô tả | Bắt buộc |
|-----|-------|----------|
| \`query\` | Câu lệnh SQL (chỉ SELECT) | ✓ |
| \`limit\` | Số dòng tối đa (mặc định: 50) | - |

## Ví dụ

\`\`\`sql
SELECT id, name, email, total_orders
FROM customers
WHERE created_at >= '2025-01-01'
ORDER BY total_orders DESC
LIMIT 10
\`\`\`

## Trạng thái hiện tại

> 🔴 **Lỗi:** Connection refused đến \`internal-db.company.com\`. Liên hệ IT để khắc phục.`,
    createdAt: '2025-01-05T07:00:00Z',
    updatedAt: '2025-03-01T11:00:00Z',
  },
  {
    id: 5,
    name: 'Shopify Manager',
    description: 'Đồng bộ tồn kho và cập nhật giá sản phẩm lên Shopify.',
    status: 'active',
    icon: '🛒',
    usageCount: 12,
    markdown: `# 🛒 Shopify Manager

**Trạng thái:** Hoạt động | **Sử dụng:** 12 lần

---

## Mô tả

Quản lý sản phẩm trên cửa hàng Shopify: cập nhật giá, số lượng tồn kho, trạng thái sản phẩm.

## Hướng dẫn cho AI

Sử dụng khi người dùng cần:
- Cập nhật giá sản phẩm hàng loạt
- Đồng bộ tồn kho từ hệ thống kho
- Kích hoạt / ẩn sản phẩm theo mùa vụ

> 📌 Yêu cầu xác nhận từ người dùng trước khi thực hiện thay đổi.

## Tham số

| Tên | Mô tả | Bắt buộc |
|-----|-------|----------|
| \`product_id\` | ID sản phẩm Shopify | ✓ |
| \`price\` | Giá mới (VND) | - |
| \`inventory\` | Số lượng tồn kho mới | - |
| \`status\` | \`active\` hoặc \`draft\` | - |

## Phạm vi

Chỉ áp dụng cho store: **mystore.myshopify.com**`,
    createdAt: '2025-02-10T08:30:00Z',
    updatedAt: '2025-02-25T16:00:00Z',
  },
  {
    id: 6,
    name: 'Weather Fetcher V2',
    description: 'Lấy thông tin thời tiết hiện tại và dự báo 7 ngày theo thành phố.',
    status: 'active',
    icon: '🌤️',
    usageCount: 780,
    markdown: `# 🌤️ Weather Fetcher V2

**Trạng thái:** Hoạt động | **Sử dụng:** 780 lần

---

## Mô tả

Lấy dữ liệu thời tiết hiện tại và dự báo từ Weather API. Hỗ trợ đa ngôn ngữ và hai đơn vị nhiệt độ.

## Hướng dẫn cho AI

Sử dụng khi người dùng hỏi về:
- Thời tiết hiện tại tại một địa điểm
- Dự báo thời tiết trong tuần
- Điều kiện thời tiết để lên kế hoạch

## Tham số

| Tên | Mô tả | Bắt buộc |
|-----|-------|----------|
| \`city\` | Tên thành phố (tiếng Anh hoặc tiếng Việt) | ✓ |
| \`unit\` | \`celsius\` hoặc \`fahrenheit\` (mặc định: celsius) | - |
| \`days\` | Số ngày dự báo: 1–7 (mặc định: 1) | - |

## Ví dụ phản hồi

\`\`\`json
{
  "city": "Hanoi",
  "temp": 28,
  "feels_like": 32,
  "condition": "Partly Cloudy",
  "humidity": 75,
  "wind_speed": "15 km/h"
}
\`\`\``,
    createdAt: '2025-01-20T12:00:00Z',
    updatedAt: '2025-02-28T08:00:00Z',
  },
  {
    id: 7,
    name: 'Quy trình Onboarding KH',
    description: 'Mô tả quy trình chào hỏi và thu thập thông tin khách hàng mới theo từng bước.',
    status: 'active',
    icon: '📋',
    usageCount: 55,
    markdown: `# 📋 Quy trình Onboarding Khách hàng mới

**Mục tiêu:** Thu thập đủ thông tin và tạo trải nghiệm chào hỏi chuyên nghiệp.

---

## Bước 1: Chào hỏi và xác nhận danh tính

- Xưng hô lịch sự: *"Xin chào! Tôi là trợ lý AI của [Công ty]."*
- Hỏi tên khách hàng và lưu vào context
- Xác nhận lại: *"Vậy tôi có thể gọi bạn là [Tên] đúng không?"*

## Bước 2: Xác định nhu cầu

Đặt câu hỏi mở để hiểu mục đích liên hệ:

> "Bạn quan tâm đến dịch vụ nào của chúng tôi hôm nay?"

**Phân loại nhu cầu:**

| Loại | Hành động tiếp theo |
|------|---------------------|
| Tư vấn sản phẩm | Chuyển sang flow \`product_info\` |
| Hỗ trợ kỹ thuật | Chuyển sang flow \`tech_support\` |
| Khiếu nại | Chuyển ngay cho nhân viên thực |

## Bước 3: Thu thập thông tin

Yêu cầu các thông tin sau (không hỏi tất cả cùng lúc):

- **Email** liên hệ
- **Số điện thoại** (tuỳ chọn)
- **Công ty / tổ chức** (nếu B2B)

## Bước 4: Xác nhận và tóm tắt

Tóm tắt lại thông tin đã thu thập và xác nhận với khách hàng trước khi chuyển sang bước tiếp theo.

\`\`\`
Tôi ghi nhận bạn [Tên], email [email], quan tâm đến [nhu cầu].
Tôi sẽ kết nối bạn với bộ phận phù hợp ngay.
\`\`\`

## Bước 5: Chuyển tiếp

- Gửi email xác nhận tự động qua **Gmail Sender** skill
- Lưu thông tin vào **SQL Customer DB** skill
- Thông báo cho nhân viên phụ trách qua hệ thống nội bộ

---

*Cập nhật lần cuối: 2025-02-28 | Phiên bản: 2.1*`,
    createdAt: '2025-02-05T09:00:00Z',
    updatedAt: '2025-02-28T10:00:00Z',
  },
];

@Injectable({ providedIn: 'root' })
export class SkillService {
  getSkills(): Observable<Skill[]> {
    return of(_skills.map(s => ({ ...s }))).pipe(delay(200));
  }

  getSkill(id: number): Observable<Skill> {
    const skill = _skills.find(s => s.id === id);
    if (!skill) throw new Error('Skill not found');
    return of({ ...skill }).pipe(delay(150));
  }

  createSkill(data: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>): Observable<Skill> {
    const now = new Date().toISOString();
    const skill: Skill = { ...data, id: _nextId++, createdAt: now, updatedAt: now };
    _skills = [..._skills, skill];
    return of({ ...skill }).pipe(delay(300));
  }

  updateSkill(id: number, data: Partial<Skill>): Observable<Skill> {
    _skills = _skills.map(s =>
      s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s
    );
    const updated = _skills.find(s => s.id === id);
    if (!updated) throw new Error('Skill not found');
    return of({ ...updated }).pipe(delay(300));
  }

  deleteSkill(id: number): Observable<void> {
    _skills = _skills.filter(s => s.id !== id);
    return of(undefined).pipe(delay(200));
  }
}
