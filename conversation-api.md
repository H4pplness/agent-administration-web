# API Spec: Conversation Module

## Mục tiêu

Tài liệu này mô tả các API của module `conversation`, bao gồm:
- CRUD conversation
- lấy danh sách messages theo conversation
- cách tích hợp với `POST /api/agents/chat` để tự động lưu user message

Ghi chú:
- Tài liệu dùng `URI` tương đối
- Không gắn với host cụ thể

---

## 1. Conversation APIs

### 1.1 POST `/api/conversations`

- Công dụng: tạo mới hoặc cập nhật conversation theo `conversationId`
- Kiểu xử lý: upsert

### Input

Request body:

```json
{
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "title": "Hoi ve Java Spring Boot"
}
```

Field chi tiết:

| Field | Kiểu | Bắt buộc | Mô tả |
|------|------|------|------|
| `conversationId` | `string` | Có | UUID string do frontend sinh |
| `userId` | `string` | Có | Mã người dùng sở hữu conversation |
| `title` | `string` | Không | Tiêu đề conversation |

### Output

- `201 Created`
- Header `Location: /api/conversations/{conversationId}`
- Response body là object `Conversation`

Ví dụ output:

```json
{
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "title": "Hoi ve Java Spring Boot",
  "createdDate": "2026-03-15T13:00:00",
  "updatedDate": "2026-03-15T13:00:00"
}
```

### Curl

```bash
curl -X POST "URI:/api/conversations" \
  -H "Content-Type: application/json" \
  -d "{\"conversationId\":\"550e8400-e29b-41d4-a716-446655440000\",\"userId\":\"user-123\",\"title\":\"Hoi ve Java Spring Boot\"}"
```

---

### 1.2 GET `/api/conversations?userId={userId}`

- Công dụng: lấy danh sách conversation của một user

### Input

Query param:

| Param | Kiểu | Bắt buộc | Mô tả |
|------|------|------|------|
| `userId` | `string` | Có | Mã user |

### Output

- `200 OK`
- Response body là `List<Conversation>`

Ví dụ output:

```json
[
  {
    "conversationId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-123",
    "title": "Hoi ve Java Spring Boot",
    "createdDate": "2026-03-15T13:00:00",
    "updatedDate": "2026-03-15T13:05:00"
  }
]
```

### Curl

```bash
curl -X GET "URI:/api/conversations?userId=user-123"
```

---

### 1.3 GET `/api/conversations/{conversationId}/messages`

- Công dụng: lấy toàn bộ messages của một conversation
- Thứ tự: tăng dần theo `createdDate`

### Input

Path param:

| Param | Kiểu | Bắt buộc | Mô tả |
|------|------|------|------|
| `conversationId` | `string` | Có | UUID conversation |

### Output

- `200 OK`
- Response body là `List<Message>`

Ví dụ output:

```json
[
  {
    "messageId": "660e8400-e29b-41d4-a716-446655440001",
    "conversationId": "550e8400-e29b-41d4-a716-446655440000",
    "role": "user",
    "content": "\"Giải thích Spring Security\"",
    "createdDate": "2026-03-15T13:01:00",
    "updatedDate": "2026-03-15T13:01:00"
  }
]
```

Field chi tiết của `Message`:

| Field | Kiểu | Mô tả |
|------|------|------|
| `messageId` | `string` | UUID string của message |
| `conversationId` | `string` | UUID string của conversation |
| `role` | `string` | Vai trò message, ví dụ `user`, `assistant`, `tool` |
| `content` | `string` | Nội dung lưu dưới dạng JSON string |
| `createdDate` | `string` | Thời điểm tạo |
| `updatedDate` | `string` | Thời điểm cập nhật |

### Curl

```bash
curl -X GET "URI:/api/conversations/550e8400-e29b-41d4-a716-446655440000/messages"
```

---

### 1.4 DELETE `/api/conversations/{conversationId}`

- Công dụng: xóa conversation
- Hành vi: xóa messages của conversation trước, sau đó xóa conversation

### Input

Path param:

| Param | Kiểu | Bắt buộc | Mô tả |
|------|------|------|------|
| `conversationId` | `string` | Có | UUID conversation |

### Output

- `204 No Content`

### Curl

```bash
curl -X DELETE "URI:/api/conversations/550e8400-e29b-41d4-a716-446655440000"
```

---

## 2. Tích hợp với Agent Chat

### 2.1 POST `/api/agents/chat`

Khi request chat có đủ:
- `conversationId`
- `messageId`

thì `AgentService` sẽ:
1. tìm user message cuối cùng trong `messages`
2. upsert conversation nếu có `userId`
3. lưu user message vào bảng `messages`
4. tiếp tục luồng agent chat như cũ

### Input mở rộng

```json
{
  "agentCode": "dev-assistant",
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "messageId": "660e8400-e29b-41d4-a716-446655440001",
  "userId": "user-123",
  "messages": [
    {
      "role": "user",
      "content": "Giải thích Spring Security"
    }
  ]
}
```

Field mới trong `AgentRequest`:

| Field | Kiểu | Bắt buộc | Mô tả |
|------|------|------|------|
| `conversationId` | `string` | Không | UUID conversation |
| `messageId` | `string` | Không | UUID của user message hiện tại |
| `userId` | `string` | Không | Mã user để gắn conversation |

### Output

- `200 OK`
- Body là `string` response từ agent

### Curl

```bash
curl -X POST "URI:/api/agents/chat" \
  -H "Content-Type: application/json" \
  -d "{\"agentCode\":\"dev-assistant\",\"conversationId\":\"550e8400-e29b-41d4-a716-446655440000\",\"messageId\":\"660e8400-e29b-41d4-a716-446655440001\",\"userId\":\"user-123\",\"messages\":[{\"role\":\"user\",\"content\":\"Giải thích Spring Security\"}]}"
```

---

## 3. Tóm tắt nhanh

| Method | URI | Công dụng | Input | Output |
|------|------|------|------|------|
| `POST` | `/api/conversations` | Tạo/cập nhật conversation | Body `Conversation` | `Conversation` |
| `GET` | `/api/conversations?userId=...` | Lấy conversation theo user | Query `userId` | `List<Conversation>` |
| `GET` | `/api/conversations/{conversationId}/messages` | Lấy messages của conversation | Path `conversationId` | `List<Message>` |
| `DELETE` | `/api/conversations/{conversationId}` | Xóa conversation và messages liên quan | Path `conversationId` | Không có body |
| `POST` | `/api/agents/chat` | Chat và lưu user message nếu có context conversation | Body `AgentRequest` mở rộng | `string` |
