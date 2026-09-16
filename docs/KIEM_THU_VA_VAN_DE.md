# Kiểm thử và các vấn đề đã phát hiện

Lần chạy gần nhất: **16/09/2026 — 485 ca kiểm thử, tất cả đạt**, khoảng 10 giây.

```bash
cd backend
.\venv\Scripts\python.exe -m unittest discover -s tests -t .
```

Tham số `-t .` là bắt buộc. Thiếu nó thì `tests/__init__.py` không chạy, và trên
máy vừa clone về chưa có `.env` thì toàn bộ bộ kiểm thử đổ lỗi nạp module.

Bộ kiểm thử **không cần mạng và không gọi Gemini**. Mọi lệnh gọi ra ngoài đều
được thay bằng bản giả lập.

---

## 1. Bảng kiểm thử theo module

### 1.1. Danh mục đơn tuyển dụng và bộ đối chiếu

| Module | Số ca | Phạm vi kiểm |
|---|---:|---|
| `test_matching_engine` | 65 | Bảy tiêu chí cứng, bốn tiêu chí mềm, tính tất định, thứ tự xếp hạng, không đọc đồng hồ |
| `test_candidate_profiles` | 41 | Gộp theo thứ tự ưu tiên nguồn, khóa lạc quan theo phiên bản, chặn client tự khai nguồn |
| `test_job_orders` | 30 | Chuẩn hóa danh mục, ràng buộc dữ liệu, vòng đời trạng thái, phân quyền, lọc công khai |
| `test_matching_service` | 27 | Kho đơn đem xét, dấu vân tay danh mục, bộ nhớ đệm mười phút, nội dung nhật ký |
| `test_job_order_import` | 26 | Nhập Excel: đọc file, báo lỗi từng dòng, chốt chặn ở tầng API |
| `test_matching_seeded_data` | 23 | Nghiệm thu bộ đối chiếu trên đúng 19 đơn mẫu dùng khi demo |
| `test_matching_api` | 22 | Chặn hồ sơ chưa xác nhận, ẩn đơn bị loại khỏi ứng viên, phạm vi xem của nhân viên |
| `test_matching_weights` | 19 | Tổng trọng số đúng 100, luật con không vượt trọng số, thiếu file thì báo lỗi |
| `test_seed_job_orders` | 13 | Tính hợp lệ và độ phủ của bộ đơn mẫu |
| `test_matching_explain` | 12 | Khối lý do khớp từng byte với bản thiết kế, không dính mô hình ngôn ngữ |
| **Cộng** | **278** | |

### 1.2. Đọc CV, đăng ký sơ bộ, hàng đợi, điểm nhân viên

| Module | Số ca | Phạm vi kiểm |
|---|---:|---|
| `test_cv_documents` | 31 | Nhận file, bóc tách, bộ kiểm chứng đoạn dẫn, gộp vào hồ sơ với nguồn `cv` |
| `test_employee_scores` | 28 | Ghi điểm theo từng sự kiện, chống cộng trùng, điều chỉnh của quản lý |
| `test_registrations` | 26 | Chuỗi chốt chặn khi đăng ký sơ bộ, dựng lại khách hàng cũ theo số điện thoại |
| `test_handover` | 16 | Bàn giao hồ sơ, nhận xử lý, chuyển giao |
| **Cộng** | **101** | |

### 1.3. Phần nền và phần chatbot

| Module | Số ca | Phạm vi kiểm |
|---|---:|---|
| `test_response_validator` | 13 | Kiểm chứng câu trả lời của mô hình trước khi gửi đi |
| `test_appointment_management` | 11 | Lịch hẹn: trạng thái, phân công, đổi lịch, chặn trùng |
| `test_recruitment_applications` | 11 | Hồ sơ tuyển dụng: chuyển trạng thái, quyền sở hữu |
| `test_lead_access_control` | 10 | Phân quyền truy cập khách hàng |
| `test_chat_pipeline` | 8 | Luồng hội thoại: dự phòng, nguồn tham khảo, xếp hạng truy xuất |
| `test_api_hardening` | 7 | Kiểm tra dữ liệu vào, giới hạn tần suất, không chặn vòng lặp sự kiện |
| `test_auth` | 7 | Băm mật khẩu, ký và kiểm token, khóa sau năm lần sai |
| `test_managed_lead_phone` | 7 | Chuẩn hóa và chống trùng số điện thoại |
| `test_audit_log` | 6 | Nhật ký thao tác: che dữ liệu nhạy cảm, phân quyền đọc |
| `test_customer_journey` | 5 | Hành trình khách hàng gộp từ nhiều nguồn |
| `test_rag_resilience` | 5 | Chịu lỗi khi mô hình quá tải hoặc kho vector không phản hồi |
| `test_analytics_service` | 4 | Số liệu thống kê hoạt động |
| `test_booking` | 4 | Đặt lịch qua khung chat |
| `test_intent_entity` | 3 | Phân loại ý định và trích xuất thực thể |
| `test_session_lead` | 3 | Khôi phục phiên hội thoại |
| `test_runtime` | 2 | Bảng mã đầu ra |
| **Cộng** | **106** | |

### 1.4. Tổng hợp

| Nhóm | Số ca | Tỷ lệ |
|---|---:|---:|
| Danh mục đơn hàng và bộ đối chiếu | 278 | 57% |
| Đọc CV, đăng ký, hàng đợi, điểm nhân viên | 101 | 21% |
| Phần nền và phần chatbot | 106 | 22% |
| **Tổng** | **485** | |

Bộ đối chiếu chiếm hơn một nửa số ca không phải ngẫu nhiên. Nó quyết định ứng
viên nào được giới thiệu đơn nào, và vì nó là Python thuần — không gọi mô hình
ngôn ngữ, không đọc đồng hồ, không chạm database — nên mọi tính chất của nó
chứng minh được bằng số chứ không phải bằng lời.

---

## 2. Kiểm thử thủ công đầu-cuối

Ngoài các ca tự động, kịch bản demo đã được chạy tay trên trình duyệt ngày
16/09/2026, dùng CV mẫu `01_nguyen_thi_mai.pdf`.

| Bước | Thao tác | Kết quả |
|---|---|---|
| 1 | Gửi CV ở `/tu-van` | Đọc đúng: NGUYỄN THỊ MAI, 2003, nữ, N4, Điều dưỡng, 0 năm, 0912345678 |
| 2 | Xem lại và bổ sung | Điền thêm bằng cấp, tỉnh mong muốn, loại hình cơ sở |
| 3 | Đối chiếu | 10 đơn đủ điều kiện, đơn đứng đầu 75/100, bảng 11 dòng tiêu chí |
| 4 | Chọn đơn DH-0001 | Hiện hộp xác nhận trước khi gửi |
| 5 | Xác nhận đăng ký | Tạo hồ sơ `HS-9730D6` |
| 6 | Mở `/admin/queue` | Hồ sơ nằm đúng trong hàng đợi kèm tên, số điện thoại, đơn đã chọn |

**Điểm đáng chú ý nhất:** bộ kiểm chứng đoạn dẫn đã **từ chối hai trường** mà
máy đọc ra nhưng không truy được về nguyên văn trong CV, và nói rõ lý do:
*"bằng cấp — đoạn dẫn không có trong CV"*. Đây là ràng buộc "AI không suy diễn"
hoạt động thật, không phải lời hứa trong tài liệu.

Dữ liệu thử đã được xóa khỏi database sau khi kiểm xong.

---

## 3. Các vấn đề đã phát hiện

Phần này đáng chú ý hơn con số 485, vì nó cho thấy việc kiểm thử có tác dụng thật.

### 3.1. Lỗi đã sửa

| # | Vấn đề | Nếu lọt ra thì sao | Tìm ra bằng cách nào | Trạng thái |
|---|---|---|---|---|
| 1 | Chuỗi `N4 trở lên, ưu tiên N3` bị đọc thành `N3` | Lấy mức khó hơn mức bắt buộc, **loại oan toàn bộ ứng viên N4** ngay ở bộ lọc cứng. Đúng loại sai mà hệ thống này tồn tại để tránh | Kiểm thử đơn vị | Đã sửa, có ca chặn |
| 2 | Ba trường của bộ nhập Excel được đọc **sau** bước kiểm lỗi | Ô sai ở kinh nghiệm, tổng chi phí, ngày phỏng vấn âm thầm biến thành rỗng. Người nhập không hề biết dữ liệu bị mất | Đọc lại mã nguồn | Đã sửa, có ca chặn |
| 3 | Đơn rời trạng thái đang tuyển mà cờ công khai vẫn bật | Đơn đã đóng vẫn nằm trên website, ứng viên nộp vào đơn không còn nhận | Kiểm thử đơn vị | Đã sửa, có ca chặn |
| 4 | Vùng suy ra từ tỉnh bị `exclude_unset` loại bỏ trước khi lưu | Ứng viên muốn Tokyo sẽ chấm một đơn ở Kanagawa — cùng vùng Kantō, đáng cộng 25 điểm — **ngang bằng một đơn ở Fukuoka**. Danh sách vẫn ra, chỉ là sai thứ tự | Chạy kịch bản nghiệm thu trên database thật | Đã sửa, có ca chặn |
| 5 | `requirements.txt` thiếu sáu gói, trong đó có `pydantic-settings` | **Ai clone repo về đều không chạy được.** `app/core/config.py` import nó ngay dòng đầu | Dựng venv trắng rồi cài lại từ file | Đã sửa, đã xác minh |
| 6 | `frontend/lib/publicApi.ts` trỏ cổng 8000 trong khi `lib/api.ts` cùng app đã là 8020 | Khung chat chạy bình thường còn **toàn bộ trang đơn hàng và luồng tư vấn thì rỗng**. Rất dễ chẩn đoán nhầm là lỗi nghiệp vụ | Rà soát toàn bộ khai báo cổng | Đã sửa, đã xác minh |
| 7 | Script `start` của hai app Next rơi về cổng 3000/3001 | `npm run build && npm run start` chạy khác `npm run dev` | Rà soát toàn bộ khai báo cổng | Đã sửa |
| 8 | Gửi CV xong làm **trắng cả trang tư vấn** | `POST /public/documents` trả hồ sơ không qua `decorate` nên thiếu `labels`; giao diện đọc `profile.labels.japanese_level` và ném `TypeError`, React gỡ sạch DOM. **Ứng viên mất trắng mọi thứ vừa khai, không có thông báo gì** | Chạy tay kịch bản demo | Đã sửa, đã xác minh |

### 3.2. Đã sửa nhưng **chưa xác minh trên màn hình**

| # | Vấn đề | Chi tiết | Còn thiếu gì |
|---|---|---|---|
| 9 | Mọi mốc thời gian trong màn hình quản trị **sai 7 tiếng** | Hồ sơ vừa đăng ký hiện là *"đăng ký 7 giờ trước"*. MongoDB lưu UTC nhưng driver trả datetime không mang múi giờ, FastAPI serialise thành `"2026-09-16T14:40:12"` không có hậu tố `Z`, trình duyệt hiểu chuỗi không có offset là **giờ địa phương**. Lệch đúng bằng UTC+7. Đã sửa bằng `tz_aware=True` ở nơi tạo Mongo client | Đã xác minh Python đọc ra `+00:00` và 485 test vẫn xanh, nhưng **chưa tận mắt thấy dòng "vừa xong"** thay cho "7 giờ trước" trên màn hình quản trị |

### 3.3. Vấn đề còn mở

| # | Vấn đề | Ảnh hưởng | Đề xuất |
|---|---|---|---|
| 10 | `docs/KIEM_THU.md` vẫn ghi **371 ca** | Tài liệu dùng cho chương kiểm thử của báo cáo đang sai số liệu | Viết lại theo bảng ở mục 1 của file này, hoặc thay hẳn bằng file này |
| 11 | Hai phiên làm việc song song giành cổng và giành file | Lượt kiểm thử ngày 16/09 mất khá nhiều công vì cổng 8020 bị giành lại giữa chừng, backend bị khởi động lại, và biến `NEXT_PUBLIC_BACKEND_URL` bị nướng vào lúc biên dịch | Chia cố định: một phiên giữ `8020/3100/3101`, phiên kia dùng `8030/4000/4001`, và thêm cả sáu địa chỉ vào `CORS_ORIGINS` trong `backend/.env` |
| 12 | Chưa đóng gói Docker | Kế hoạch có hạng mục `docker-compose` 6 service kèm nginx. Chưa ai bắt đầu | Làm sau khi chốt xong tính năng, vì mỗi lần đổi cổng là phải sửa kèm |
| 13 | Chưa có `docs/handoff/KNOWLEDGE_BASE_SPEC.md` | Nhóm chatbot đang chờ bản mô tả API quản lý tri thức để làm màn hình "Tri thức AI" — màn hình này hiện hiển thị số liệu viết cứng trong mã nguồn | Viết và gửi |
| 14 | Chưa có `docs/handoff/APPLICATION_LIFECYCLE_PROPOSAL.md` | Kế hoạch yêu cầu duyệt vòng đời hồ sơ **trước khi** code. Phần đăng ký và hàng đợi đã được viết xong mà chưa qua bước duyệt này | Viết lại thành tài liệu mô tả vòng đời đã dựng, để đối chiếu khi bảo vệ |

---

## 4. Những phần chưa có kiểm thử tự động

Nói rõ để không hiểu nhầm con số 485 là đã phủ hết hệ thống.

| Phần | Hiện trạng | Dự kiến |
|---|---|---|
| Giao diện website và màn hình quản trị | Kiểm bằng mắt, bằng lệnh dựng bản phát hành, và một lượt chạy tay đầu-cuối | Chưa có kế hoạch kiểm thử tự động trong phạm vi đồ án |
| Độ chính xác đọc CV | Có sáu file mẫu kèm `dap_an.json`, mới chấm tay một file | Đo tỷ lệ trường rút đúng trên cả sáu hồ sơ |
| Đóng gói Docker | Chưa làm | Sau khi chốt tính năng |
| Chạy tải | Chưa làm | Ngoài phạm vi |

---

## 5. Cách viết kiểm thử trong dự án

`unittest.IsolatedAsyncioTestCase` với `AsyncMock` và `patch`. Mọi thứ đi ra
ngoài — database, Gemini, Qdrant — đều được thay bằng bản giả lập. Nhờ vậy bộ
kiểm thử chạy trong khoảng mười giây, không cần mạng, và không phụ thuộc vào
việc MongoDB có đang chạy hay không ở phần lớn ca.

Tên ca kiểm thử viết thành câu mô tả điều cần đúng, ví dụ
`test_ambiguous_japanese_requirement_takes_the_minimum`. Khi một ca đổ lỗi, tên
của nó đã nói ra điều gì vừa hỏng, không phải mở mã nguồn ra đọc mới biết.
