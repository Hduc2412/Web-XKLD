# Báo cáo gửi người phát triển chatbot

Từ: người làm phần web và hệ thống nghiệp vụ.
Ngày: 14/09/2026.

Hai phần đang được viết song song trên cùng một repo. Đây là những gì đã thay đổi
ở vùng dùng chung, để bạn biết trước khi kéo code về. Đọc khoảng năm phút.

Mã nguồn đã đẩy lên `github.com/Hduc2412/Web-XKLD`, nhánh `main`.

---

## 1. Việc tôi vừa làm xong

Danh mục đơn tuyển dụng, trọn vẹn từ tầng dữ liệu lên tới màn hình quản trị.
Đây là mắt xích đầu của chuỗi nghiệp vụ: chưa có đơn hàng thì bộ đối chiếu không
có gì để so và kênh khách hàng không có gì để giới thiệu.

- Collection `job_orders` với sáu index, mã đơn tăng dần `DH-0001`.
- Mười bốn endpoint, ba trong số đó công khai cho website và khung chat.
- Danh mục 47 tỉnh Nhật Bản, 8 vùng, các enum kèm nhãn tiếng Việt.
- Bộ nhập hàng loạt từ Excel, có bước xem trước báo lỗi từng dòng.
- Mười chín đơn mẫu đã nạp sẵn trong MongoDB.
- Bốn màn hình quản trị dưới `/admin/job-orders`.
- Bộ kiểm thử đi từ 92 lên 138 trường hợp, tất cả xanh.

**Không đụng gì tới phần chat.** Chi tiết ở mục 3.

---

## 2. Bốn thay đổi ở vùng dùng chung, ảnh hưởng trực tiếp tới bạn

### 2.1. Lệnh chạy kiểm thử đổi

```bash
cd backend
.\venv\Scripts\python.exe -m unittest discover -s tests -t .
```

**Tham số `-t .` là bắt buộc.** Thiếu nó thì Python nạp các file kiểm thử như module
rời chứ không như một gói, nên `tests/__init__.py` không chạy và giá trị cấu hình
mặc định cho kiểm thử không được đặt.

Trên máy bạn hiện có file `.env` thật nên vẫn chạy được dù thiếu tham số, lỗi này
dễ bị bỏ qua. Nhưng trên máy vừa clone repo về thì toàn bộ bộ kiểm thử đổ lỗi nạp
module. Tôi phát hiện đúng lúc thử chạy trên cây sạch trước khi đẩy lên.

### 2.2. Cấu hình chuyển sang pydantic-settings

`app/core/config.py` viết lại. Thiếu `GEMINI_API_KEY` hoặc `JWT_SECRET` thì ứng dụng
**chết ngay lúc khởi động** kèm thông báo rõ ràng, thay vì chạy tiếp rồi lỗi mơ hồ ở
request đầu tiên. Khóa ký JWT bị bắt tối thiểu 32 ký tự.

Tên thuộc tính giữ nguyên hoàn toàn, nên `llm/gemini.py`, `rag/retriever.py`,
`auth/security.py`, `db/database.py` không phải sửa một dòng nào.

Trường `support_phone` bạn thêm vẫn còn nguyên trong bản mới, nên
`conversation/fallback_messages.py` của bạn không gãy.

Biến môi trường mới, đều có giá trị mặc định nên không bắt buộc khai báo:
`STORAGE_PATH`, `MAX_UPLOAD_MB`, `CV_OCR_MAX_PAGES`, `LLM_EXPLANATIONS_ENABLED`,
`MATCHING_WEIGHTS_PATH`, `GEMINI_JSON_MODEL`, `GEMINI_TIMEOUT_SECONDS`.

### 2.3. Thư viện mới

```bash
pip install -r requirements.txt
```

Thêm năm gói: `pydantic-settings`, `python-multipart`, `openpyxl`, `python-docx`,
`pymupdf`. Ba gói cuối dành cho phần đọc CV sắp làm.

### 2.4. Hai file lõi bị chạm, mỗi file vài dòng

`app/db/database.py` thêm đúng một chỗ trong `init_db()`:

```python
from app.db.indexes import ensure_domain_indexes
await ensure_domain_indexes(db)
```

Index của các nghiệp vụ mới **không** khai báo trong file đó nữa. Mỗi module dữ liệu
tự khai `ensure_indexes(db)` của mình, `app/db/indexes.py` gọi tất cả trong một lượt.
File `database.py` đã hơn một nghìn dòng rồi, thêm nghiệp vụ mới không nên làm nó
phình thêm.

`main.py` thêm bốn dòng đăng ký router đơn tuyển dụng.

---

## 3. Những gì tôi cam kết không đụng

| Vùng | File |
|---|---|
| Pipeline hội thoại | `app/conversation/`, `app/rag/`, `app/llm/gemini.py` |
| Điều phối chat | `app/services/chat_service.py`, `app/api/chat.py` |
| Nạp tri thức | `ingestion/` |
| Khung chat | `frontend/components/Chat*`, `frontend/hooks/useChat.ts`, `frontend/lib/api.ts` |

Phần nghiệp vụ **không import một dòng nào** từ những nơi đó. Bạn tự kiểm bằng một lệnh:

```bash
grep -rn "app\.rag\|app\.conversation\|app\.llm\|chat_service" \
  backend/app/matching backend/app/db/job_orders.py \
  backend/app/api/job_orders.py backend/app/services/job_order_import.py
```

Kết quả phải rỗng.

Ban đầu tôi có mượn hàm `normalize_text` trong `app/rag/taxonomy.py` để bỏ dấu tiếng
Việt. Sau đó tôi tách ra bản riêng tại `app/core/text.py`. Sáu dòng trùng nhau rẻ hơn
nhiều so với một phụ thuộc chéo giữa hai phần đang viết song song, vì mỗi lần bạn dọn
dẹp file đó là phần của tôi gãy theo.

Tương tự với `_keep_allowed_nulls` bạn mới thêm vào `database.py`. Tôi đã dùng nó một
thời gian, rồi chuyển sang bản riêng trong `app/db/common.py`. Giờ phần nghiệp vụ chỉ
còn lấy đúng `get_db`, `init_db`, `close_db` từ file lõi.

---

## 4. Phần đang viết dở của bạn

Lúc tôi làm, nhánh hiện tại có những file này đang sửa mà chưa commit:

```
backend/app/api/chat.py                        backend/app/rag/prompt_builder.py
backend/app/api/applications.py                backend/app/rag/retriever.py
backend/app/api/management.py                  backend/app/services/analytics_service.py
backend/app/conversation/response_validator.py backend/app/services/chat_service.py
backend/app/conversation/fallback_messages.py  backend/app/services/assignment.py
backend/tests/test_chat_pipeline.py            backend/tests/test_lead_access_control.py
backend/tests/test_analytics_service.py        admin-frontend/lib/auth.ts
backend/tests/test_managed_lead_phone.py       frontend/lib/api.ts
backend/tests/test_recruitment_applications.py README.md, backend/.env.example
```

**Tôi để nguyên, không commit hộ, không sửa.** Bản đẩy lên GitHub dựng trên commit gốc
`0fd88ef`, nên nó không chứa phần này. Bạn commit lúc nào thấy xong cũng được.

Có một file của bạn tôi dùng lại: `app/services/assignment.py`. Bốn hàm phân quyền
trong đó (`is_privileged`, `can_access`, `validate_assignee`, `ensure_can_assign`) đúng
là thứ phần nghiệp vụ cần, nên tôi dùng chung thay vì viết bản thứ hai. Nếu bạn định
đổi chữ ký hàm thì báo tôi.

---

## 5. Thứ bạn dùng được ngay

Ba endpoint công khai, không cần đăng nhập. Khung chat gọi được luôn nếu muốn giới
thiệu đơn hàng cho ứng viên.

| Method | Đường dẫn | Trả về |
|---|---|---|
| GET | `/public/job-orders` | Danh sách đơn đang tuyển, đã duyệt công khai, còn hạn |
| GET | `/public/job-orders/{code}` | Chi tiết một đơn |
| GET | `/public/job-orders/facets` | Các giá trị lọc thực sự có đơn, để dựng bộ lọc |

Tham số lọc: `prefecture`, `region_group`, `employer_type`, `program`,
`japanese_required`, `limit`.

Một đơn chỉ ra khỏi endpoint công khai khi **đồng thời** đủ ba điều: đã bật công khai,
đang tuyển, còn hạn nộp. Lọc ngay lúc truy vấn nên đơn quá hạn tự biến mất, không cần
tác vụ định kỳ. Trường nội bộ như ghi chú riêng, người tạo, số đã tuyển bị loại ngay ở
tầng truy vấn chứ không dựa vào việc tầng trên nhớ bỏ đi.

Mỗi đơn kèm khối `labels` chứa nhãn tiếng Việt. Dùng thẳng nhãn đó, đừng chép lại bảng
danh mục sang phía giao diện, vì giữ bảng ở hai nơi là cách chắc chắn nhất để chúng
lệch nhau sau vài lần sửa.

```jsonc
// GET /public/job-orders?prefecture=Tokyo&limit=1
[{
  "code": "DH-0001",
  "title": "Điều dưỡng viện dưỡng lão Tokyo",
  "employer_name": "Viện dưỡng lão Sakura",
  "employer_type": "vien_duong_lao",
  "program": "tokutei_ginou",
  "prefecture": "Tokyo",
  "region_group": "kanto",
  "quota": 5,
  "deadline": "2026-11-30",
  "requirements": {
    "japanese_required": "N4", "education_required": "cao_dang",
    "experience_min": 0.0, "age_min": 20, "age_max": 35,
    "gender_pref": "khong_yeu_cau"
  },
  "reference": {
    "salary_min": 195000, "salary_max": 215000,
    "allowances": ["Hỗ trợ ký túc xá", "Phụ cấp ca đêm"],
    "cost_total_vnd": 110000000,
    "interview_date": "2026-10-13",
    "departure_expected": "2027-03",
    "highlights": ["Cơ sở mới xây, trang thiết bị hiện đại"]
  },
  "labels": {
    "status": "Đang tuyển",
    "employer_type": "Viện dưỡng lão",
    "program": "Kỹ năng đặc định (Tokutei Ginou)",
    "region_group": "Kantō",
    "japanese_required": "N4",
    "education_required": "Cao đẳng",
    "gender_pref": "Không yêu cầu"
  }
}]
```

Nạp dữ liệu mẫu để thử:

```bash
cd backend
.\venv\Scripts\python.exe -m scripts.seed_job_orders --reset
```

Mười chín đơn, mười sáu đơn công khai. Ba đơn còn lại cố ý bị ẩn theo ba lý do khác
nhau là nháp, tạm dừng và quá hạn, để kiểm tra bộ lọc chứ không chỉ tin là nó đúng.

---

## 6. Thứ tôi cần từ bạn

Màn hình **Tri thức AI** trong hệ thống quản trị hiện đang hiển thị số liệu viết cứng
trong mã nguồn: "32 bài viết", "10 nhóm chủ đề", "0 nguồn thiếu ảnh". Để thay bằng dữ
liệu thật tôi cần năm endpoint từ phía bạn:

| Method | Đường dẫn đề xuất | Trả về |
|---|---|---|
| GET | `/knowledge/stats` | Tổng số tài liệu, số đã lập chỉ mục, số lỗi, phân bố theo chủ đề |
| GET | `/knowledge/documents` | Danh sách tài liệu kèm trạng thái vector, số đoạn, lần cập nhật cuối |
| POST | `/knowledge/documents` | Tải tài liệu lên, xử lý nền |
| POST | `/knowledge/documents/{id}/reindex` | Lập chỉ mục lại |
| DELETE | `/knowledge/documents/{id}` | Xóa tài liệu và các điểm vector tương ứng |

Quy ước nếu bạn làm: dùng `get_current_user` và `require_roles` sẵn có trong
`app/auth/security.py`, ghi nhật ký bằng `audit_action`, khai index qua
`app/db/indexes.py`, file lưu trong `storage/kb/`.

Đây không nằm trong phạm vi bảo vệ của phần tôi, nên nếu bạn không kịp thì tôi để màn
hình ở trạng thái rỗng có thông báo, không chặn gì cả.

**Hai thứ đề nghị giữ nguyên**, vì phần nghiệp vụ đang dựa vào:

- Trường `intent` trên collection `messages`. Phiếu tóm tắt tư vấn dùng nó để thống kê
  ứng viên đã hỏi về những chủ đề nào.
- Khóa `url` trong payload nguồn trả về cho khung chat. Giao diện đang đọc
  `sources[].url`; đổi tên khóa sẽ làm mất liên kết nguồn.

---

## 7. Hai việc cần thống nhất

### 7.1. Cổng backend đang lệch

Bạn đổi `NEXT_PUBLIC_BACKEND_URL` mặc định trong `admin-frontend/lib/managementApi.ts`
sang cổng 8010. Thay đổi đó chưa commit, nên bản đẩy lên GitHub vẫn để 8000.

Ai chạy backend ở cổng nào thì màn hình quản trị phải trỏ đúng cổng đó, nếu không toàn
bộ màn hình sẽ trắng dữ liệu mà không báo lỗi rõ ràng. Nên chốt một con số, hoặc tốt
hơn là mỗi người dùng file `.env.local` riêng và để giá trị mặc định trong mã nguồn
yên ở 8000.

### 7.2. Chất lượng kho tri thức

Có báo cáo rằng kho vector hiện tại có mười sáu chỗ ghi sai số điện thoại, và rác nhận
dạng ảnh lẫn trong hai mươi hai trên ba mươi hai đoạn tài liệu. Crawler cũng chỉ đọc
một ảnh mỗi bài.

Phần này thuộc `ingestion/` nên tôi không đụng vào. Nhưng nó ảnh hưởng thẳng tới chất
lượng câu trả lời lúc demo chung, nên tôi nêu ra để bạn biết mức ưu tiên.

---

## 8. Việc tôi làm tiếp

Hồ sơ ứng viên và bộ đối chiếu đơn hàng. Toàn Python thuần, không gọi mô hình ngôn ngữ,
nên không đụng gì tới hạn mức Gemini chung.

Sau đó mới tới phần đọc CV, lúc ấy tôi sẽ viết một client Gemini riêng tại
`app/llm/gemini_json.py` dùng `httpx` bất đồng bộ, **không sửa `gemini.py` của bạn**.
Lý do tách: `gemini.py` đang dùng `requests` đồng bộ với `time.sleep`, nên khi phải thử
lại ba lần thì nó chặn toàn bộ vòng lặp sự kiện của FastAPI khoảng mười bảy giây, mọi
request khác treo theo. Phần đọc CV chạy nền và có thể mất hàng chục giây, dùng chung
client đó sẽ làm khung chat đứng hình.

Nếu bạn muốn sửa `gemini.py` sang bất đồng bộ luôn thì càng tốt, nhưng đó là quyết định
của bạn với file của bạn.

---

## Tài liệu liên quan

| File | Nội dung |
|---|---|
| `docs/handoff/TICH_HOP_VOI_CHATBOT.md` | Sơ đồ bốn khối, bảng phân chia file, hợp đồng dữ liệu đầy đủ |
| `docs/SCOPE_PHAT_TRIEN.md` | Phạm vi công việc: làm gì, không làm gì, tiến độ |
| `tailieu/DonHang/HUONG_DAN.md` | Hướng dẫn doanh nghiệp nhập đơn hàng bằng Excel |
