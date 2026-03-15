# REST API List

## Mục đích

Tài liệu này liệt kê toàn bộ REST API hiện có của project, gồm:
- `URI`
- công dụng
- input
- output
- status code chính

Ghi chú:
- Tài liệu dùng `URI` tương đối, không gắn với host cụ thể
- Response lỗi thực tế được xử lý bởi `GlobalException`

---

## 1. Agent APIs

### 1.1 GET `/api/agents`

- Công dụng: lấy danh sách toàn bộ agent
- Input:
  - Không có request body
  - Không có path param
- Output:
  - `200 OK`
  - Body: `List<Agent>`

Ví dụ output:

```json
[
  {
    "code": "dev-assistant",
    "name": "Developer Assistant",
    "description": "Ho tro lap trinh, review code va giai quyet loi ky thuat.",
    "systemPrompt": "Ban la mot ky su phan mem senior, tra loi ngan gon va chinh xac.",
    "modelId": 4
  }
]
```

Field của `Agent`:

| Field | Kiểu | Mô tả |
|------|------|------|
| `code` | `string` | Mã định danh duy nhất của agent |
| `name` | `string` | Tên hiển thị của agent |
| `description` | `string` | Mô tả nghiệp vụ của agent |
| `systemPrompt` | `string` | Prompt hệ thống của agent |
| `modelId` | `number` | ID model được agent sử dụng |

---

### 1.2 GET `/api/agents/{code}`

- Công dụng: lấy chi tiết một agent theo `code`
- Input:
  - Path param:
    - `code`: mã agent
- Output:
  - `200 OK`
  - Body: `Agent`

Ví dụ output:

```json
{
  "code": "dev-assistant",
  "name": "Developer Assistant",
  "description": "Ho tro lap trinh, review code va giai quyet loi ky thuat.",
  "systemPrompt": "Ban la mot ky su phan mem senior, tra loi ngan gon va chinh xac.",
  "modelId": 4
}
```

---

### 1.3 POST `/api/agents`

- Công dụng: tạo agent mới
- Input:
  - Body: `Agent`

Ví dụ input:

```json
{
  "code": "dev-assistant",
  "name": "Developer Assistant",
  "description": "Ho tro lap trinh, review code va giai quyet loi ky thuat.",
  "systemPrompt": "Ban la mot ky su phan mem senior, tra loi ngan gon va chinh xac.",
  "modelId": 4
}
```

- Output:
  - `201 Created`
  - Header `Location: /api/agents/{code}`
  - Body: `Agent` vừa được tạo

---

### 1.4 PUT `/api/agents/{code}`

- Công dụng: cập nhật agent theo `code`
- Input:
  - Path param:
    - `code`: mã agent cần cập nhật
  - Body: `Agent`

Ví dụ input:

```json
{
  "name": "Developer Assistant Updated",
  "description": "Updated description",
  "systemPrompt": "Updated prompt",
  "modelId": 4
}
```

- Output:
  - `200 OK`
  - Body: `Agent` sau cập nhật

---

### 1.5 DELETE `/api/agents/{code}`

- Công dụng: xóa agent theo `code`
- Input:
  - Path param:
    - `code`: mã agent cần xóa
- Output:
  - `204 No Content`
  - Không có response body

---

### 1.6 POST `/api/agents/chat`

- Công dụng: chat đồng bộ với agent
- Input:
  - Body: `AgentRequest`

Ví dụ input:

```json
{
  "agentCode": "dev-assistant",
  "messages": [
    {
      "role": "user",
      "content": "Hay review doan code nay"
    }
  ]
}
```

Field của `AgentRequest`:

| Field | Kiểu | Mô tả |
|------|------|------|
| `agentCode` | `string` | Mã agent sẽ được dùng để chat |
| `messages` | `array` | Danh sách message đầu vào |

Field của `AgentRequest.messages[*]`:

| Field | Kiểu | Mô tả |
|------|------|------|
| `role` | `string` | Vai trò của message, ví dụ `user`, `assistant` |
| `content` | `object` | Nội dung message |

- Output:
  - `200 OK`
  - Body: `string`

Ví dụ output:

```text
Day la cau tra loi cua agent.
```

---

### 1.7 POST `/api/agents/chat/stream`

- Công dụng: chat streaming qua SSE
- Input:
  - Body: `AgentRequest`
- Output:
  - `200 OK`
  - `Content-Type: text/event-stream`
  - Body: stream token SSE

Ví dụ output:

```text
data: Xin

data: chao

data: ban
```

---

## 2. Model APIs

### 2.1 GET `/api/models`

- Công dụng: lấy danh sách toàn bộ model
- Input:
  - Không có request body
- Output:
  - `200 OK`
  - Body: `List<LlmModel>`

Ví dụ output:

```json
[
  {
    "modelId": 4,
    "modelName": "qwen/qwen3-32b",
    "apiKey": "",
    "urlGateway": ""
  }
]
```

Field của `LlmModel`:

| Field | Kiểu | Mô tả |
|------|------|------|
| `modelId` | `number` | ID model trong database |
| `modelName` | `string` | Tên model |
| `apiKey` | `string` | API key của provider |
| `urlGateway` | `string` | URL gateway của provider |

---

### 2.2 GET `/api/models/{modelId}`

- Công dụng: lấy chi tiết một model theo `modelId`
- Input:
  - Path param:
    - `modelId`: ID model
- Output:
  - `200 OK`
  - Body: `LlmModel`

Ví dụ output:

```json
{
  "modelId": 4,
  "modelName": "qwen/qwen3-32b",
  "apiKey": "",
  "urlGateway": ""
}
```

---

### 2.3 POST `/api/models`

- Công dụng: tạo model mới
- Input:
  - Body: `LlmModel`

Ví dụ input:

```json
{
  "modelName": "qwen/qwen3-32b",
  "apiKey": "",
  "urlGateway": ""
}
```

- Output:
  - `201 Created`
  - Header `Location: /api/models/{modelId}`
  - Body: `LlmModel` vừa được tạo

---

### 2.4 PUT `/api/models/{modelId}`

- Công dụng: cập nhật model theo `modelId`
- Input:
  - Path param:
    - `modelId`: ID model cần cập nhật
  - Body: `LlmModel`

Ví dụ input:

```json
{
  "modelName": "gpt-4o-mini",
  "apiKey": "",
  "urlGateway": ""
}
```

- Output:
  - `200 OK`
  - Body: `LlmModel` sau cập nhật

---

### 2.5 DELETE `/api/models/{modelId}`

- Công dụng: xóa model theo `modelId`
- Input:
  - Path param:
    - `modelId`: ID model cần xóa
- Output:
  - `204 No Content`
  - Không có response body

---

## 3. Tóm tắt nhanh

| Method | URI | Công dụng | Input | Output |
|------|------|------|------|------|
| `GET` | `/api/agents` | Lấy danh sách agent | Không có body | `List<Agent>` |
| `GET` | `/api/agents/{code}` | Lấy chi tiết agent | Path `code` | `Agent` |
| `POST` | `/api/agents` | Tạo agent | Body `Agent` | `Agent` |
| `PUT` | `/api/agents/{code}` | Cập nhật agent | Path `code`, body `Agent` | `Agent` |
| `DELETE` | `/api/agents/{code}` | Xóa agent | Path `code` | Không có body |
| `POST` | `/api/agents/chat` | Chat đồng bộ | Body `AgentRequest` | `string` |
| `POST` | `/api/agents/chat/stream` | Chat streaming | Body `AgentRequest` | SSE stream |
| `GET` | `/api/models` | Lấy danh sách model | Không có body | `List<LlmModel>` |
| `GET` | `/api/models/{modelId}` | Lấy chi tiết model | Path `modelId` | `LlmModel` |
| `POST` | `/api/models` | Tạo model | Body `LlmModel` | `LlmModel` |
| `PUT` | `/api/models/{modelId}` | Cập nhật model | Path `modelId`, body `LlmModel` | `LlmModel` |
| `DELETE` | `/api/models/{modelId}` | Xóa model | Path `modelId` | Không có body |
