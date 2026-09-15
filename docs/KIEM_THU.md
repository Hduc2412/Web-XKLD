# Kiểm thử hệ thống

Lần chạy gần nhất: 15/09/2026. **371 ca kiểm thử, tất cả đạt**, thời gian chạy khoảng 4 giây.

```bash
cd backend
.\venv\Scripts\python.exe -m unittest discover -s tests -t .
```

Tham số `-t .` là bắt buộc. Thiếu nó thì Python nạp các file kiểm thử như module rời chứ không
như một gói, nên `tests/__init__.py` không chạy và giá trị cấu hình mặc định không được đặt.
Trên máy đã có `.env` thì vẫn chạy được nên lỗi này dễ bị bỏ qua; trên máy vừa clone repo về
thì toàn bộ bộ kiểm thử đổ lỗi nạp module.

Bộ kiểm thử **không cần mạng và không gọi Gemini**. Mọi lệnh gọi ra ngoài đều được thay bằng
bản giả lập, nên chạy được cả khi hết hạn mức gọi mô hình.

---

## 1. Tổng hợp theo module

| Module | Số ca | Phạm vi kiểm | Kết quả |
|---|---:|---|:---:|
| `test_matching_engine` | 65 | **Bộ đối chiếu**: bảy tiêu chí cứng, bốn tiêu chí mềm, tính tất định, thứ tự xếp hạng, không đọc đồng hồ | Đạt |
| `test_candidate_profiles` | 41 | Hồ sơ ứng viên: gộp theo thứ tự ưu tiên nguồn, khóa lạc quan theo phiên bản, chặn client tự khai nguồn, phân quyền | Đạt |
| `test_job_orders` | 30 | Danh mục đơn tuyển dụng: chuẩn hóa danh mục, ràng buộc dữ liệu, vòng đời trạng thái, phân quyền, lọc công khai | Đạt |
| `test_matching_service` | 27 | Tầng điều phối: kho đơn đem xét, dấu vân tay danh mục, bộ nhớ đệm mười phút, nội dung nhật ký | Đạt |
| `test_matching_seeded_data` | 23 | Nghiệm thu bộ đối chiếu trên đúng mười chín đơn mẫu sẽ dùng khi demo | Đạt |
| `test_matching_api` | 22 | API đối chiếu: chặn hồ sơ chưa xác nhận, ẩn đơn bị loại khỏi ứng viên, phạm vi xem của nhân viên | Đạt |
| `test_matching_weights` | 19 | Bộ trọng số ngoài mã: tổng đúng 100, mỗi luật con không vượt trọng số, thiếu file thì báo lỗi | Đạt |
| `test_matching_explain` | 12 | Khối lý do: khớp từng byte với bản thiết kế, không import gì liên quan mô hình ngôn ngữ | Đạt |
| `test_job_order_import` | 26 | Nhập hàng loạt từ Excel: đọc file, báo lỗi từng dòng, chốt chặn ở tầng API | Đạt |
| `test_seed_job_orders` | 13 | Dữ liệu mẫu: tính hợp lệ và độ phủ của mười chín đơn hàng | Đạt |
| `test_appointment_management` | 11 | Lịch hẹn: trạng thái, phân công, đổi lịch, chặn trùng | Đạt |
| `test_recruitment_applications` | 11 | Hồ sơ tuyển dụng: chuyển trạng thái, quyền sở hữu | Đạt |
| `test_lead_access_control` | 10 | Phân quyền truy cập khách hàng | Đạt |
| `test_chat_pipeline` | 8 | Luồng hội thoại: dự phòng, nguồn tham khảo, xếp hạng truy xuất | Đạt |
| `test_api_hardening` | 7 | Kiểm tra dữ liệu vào, giới hạn tần suất, không chặn vòng lặp sự kiện | Đạt |
| `test_auth` | 7 | Băm mật khẩu, ký và kiểm token, khóa sau năm lần sai | Đạt |
| `test_managed_lead_phone` | 7 | Chuẩn hóa và chống trùng số điện thoại | Đạt |
| `test_audit_log` | 6 | Nhật ký thao tác: che dữ liệu nhạy cảm, phân quyền đọc | Đạt |
| `test_customer_journey` | 5 | Hành trình khách hàng gộp từ nhiều nguồn | Đạt |
| `test_rag_resilience` | 5 | Chịu lỗi khi mô hình quá tải hoặc kho vector không phản hồi | Đạt |
| `test_analytics_service` | 4 | Số liệu thống kê hoạt động | Đạt |
| `test_booking` | 4 | Đặt lịch qua khung chat | Đạt |
| `test_intent_entity` | 3 | Phân loại ý định và trích xuất thực thể | Đạt |
| `test_session_lead` | 3 | Khôi phục phiên hội thoại | Đạt |
| `test_runtime` | 2 | Bảng mã đầu ra | Đạt |
| **Tổng** | **371** | | **Đạt** |

**278 ca thuộc phần đồ án này** (69 ca danh mục đơn hàng và dữ liệu mẫu, 209 ca hồ sơ ứng viên
và bộ đối chiếu). 93 ca còn lại là phần nền có sẵn và phần của nhóm phát triển chatbot; giữ cho
chúng luôn đạt là điều kiện để hai phần cùng tồn tại trên một mã nguồn.

Bộ đối chiếu chiếm phần lớn số ca không phải ngẫu nhiên. Nó là thứ quyết định ứng viên nào được
giới thiệu đơn nào, và vì nó là Python thuần — không gọi mô hình ngôn ngữ, không đọc đồng hồ,
không chạm database — nên mọi tính chất của nó chứng minh được bằng số chứ không phải bằng lời.

---

## 2. Chi tiết ca kiểm thử

### 2.1. Danh mục đơn tuyển dụng

| Mã | Chức năng | Mục tiêu kiểm | Dữ liệu vào | Kết quả mong đợi | Đạt |
|---|---|---|---|---|:---:|
| DH-01 | Chuẩn hóa loại hình cơ sở | Bốn cách viết cùng cho một mã | `Viện dưỡng lão`, `vien duong lao`, `VIEN_DUONG_LAO`, có khoảng trắng thừa | Đều ra `vien_duong_lao` | ✔ |
| DH-02 | Chuẩn hóa tên tỉnh | Nhận cả chữ Latinh có dấu và tên gọi khác | `Tōkyō`, `Ōsaka`, `hyogo ken` | `Tokyo`, `Osaka`, `Hyogo` | ✔ |
| DH-03 | Danh mục tỉnh | Đủ và đúng bốn mươi bảy tỉnh | Bảng tỉnh | 47 tỉnh, mỗi tỉnh thuộc một vùng hợp lệ | ✔ |
| DH-04 | Suy vùng từ tỉnh | Không bắt nhập hai lần và nhập lệch nhau | `Tokyo`, `Fukuoka` | `kanto`, `kyushu` | ✔ |
| DH-05 | Giá trị lạ | Không đoán bừa khi không nhận ra | `nhà hàng`, `Hà Nội` | Trả về rỗng, không chọn giá trị gần đúng | ✔ |
| DH-06 | Trình độ tiếng Nhật mập mờ | Lấy **mức thấp nhất** khi câu có nhiều mức | `N4 trở lên, ưu tiên N3` | `N4`, kèm danh sách đủ `["N4","N3"]` | ✔ |
| DH-07 | Mức tiếng lẫn trong câu | Bắt được mã nằm giữa câu | `Trình độ N4`, `Chưa học`, `không rõ` | `N4`, `chua_hoc`, rỗng | ✔ |
| DH-08 | Đồ thị trạng thái | Khớp mục 7.1 của báo cáo | Bảng chuyển trạng thái | `draft→{open,closed}`, `open→{paused,filled,expired,closed}`, `closed` là điểm cuối | ✔ |
| DH-09 | Nhãn trạng thái | Mọi trạng thái đều có nhãn tiếng Việt | Bảng trạng thái | Không trạng thái nào thiếu nhãn | ✔ |
| DH-10 | Tạo đơn | Cấp mã tuần tự và tự suy vùng | Đơn tại Tokyo | Mã `DH-0001`, vùng `kanto`, đã tuyển 0 | ✔ |
| DH-11 | Hạn nộp đã qua | Không tạo đơn đang tuyển đã hết hạn | Hạn nộp hôm qua | Từ chối, mã lỗi 400 | ✔ |
| DH-12 | Đổi trạng thái | Rời trạng thái đang tuyển thì tự tắt công khai | `open` → `paused` | Khóa theo trạng thái hiện tại, `unpublish` bật | ✔ |
| DH-13 | Chuyển trạng thái sai | Không cho chuyển ngược từ trạng thái đóng | `closed` → `open` | Từ chối, mã lỗi 409 | ✔ |
| DH-14 | Hai người sửa cùng lúc | Người sau không ghi đè người trước | Trạng thái đã đổi bởi người khác | Mã lỗi 409, yêu cầu tải lại | ✔ |
| DH-15 | Bật công khai đơn nháp | Báo rõ đơn chưa thật sự hiển thị | Đơn `draft`, bật công khai | Trả về `visible_publicly` bằng sai | ✔ |
| DH-16 | Xóa đơn | Chỉ xóa được đơn nháp | Đơn `open` | Từ chối, mã lỗi 409 | ✔ |
| DH-17 | Sửa đơn đã đóng | Không sửa nội dung đơn đã đóng | Đơn `closed` | Từ chối, mã lỗi 409 | ✔ |
| DH-18 | Sửa lẻ khoảng tuổi | Kiểm tra với giá trị đang lưu, không chỉ giá trị gửi lên | Đang 20–35, sửa tuổi từ thành 40 | Từ chối, mã lỗi 400 | ✔ |
| DH-19 | Điều kiện công khai | Ba điều kiện luôn đi cùng nhau ở tầng dữ liệu | Hàm dựng bộ lọc công khai | Đủ `published`, `status` bằng `open`, hạn nộp còn | ✔ |
| DH-20 | Ẩn trường nội bộ | Loại ở tầng truy vấn, không dựa tầng trên | Projection công khai | Bỏ ghi chú nội bộ, người tạo, người sửa, số đã tuyển | ✔ |
| DH-28 | Danh sách công khai | Bộ lọc công khai không bị bỏ sót khi có tham số lọc | Lọc theo tỉnh `Tōkyō` | Truy vấn vẫn giữ đủ ba điều kiện, tỉnh chuẩn hóa thành `Tokyo` | ✔ |
| DH-21 | Cập nhật lồng nhau | Sửa một điều kiện không xóa các điều kiện khác | `{requirements:{age_min:20}}` | Thành `{"requirements.age_min":20}` | ✔ |
| DH-22 | Khoảng tuổi | Tuổi từ không lớn hơn tuổi đến | 40 và 25 | Từ chối ngay ở bước kiểm dữ liệu | ✔ |
| DH-23 | Khoảng lương | Lương từ không lớn hơn lương đến | 300.000 và 100.000 | Từ chối | ✔ |
| DH-24 | Loại hình lạ | Không nhận giá trị ngoài danh mục | `quán ăn` | Từ chối | ✔ |
| DH-25 | Trạng thái khởi tạo | Đơn mới chỉ ở nháp hoặc đang tuyển | Tạo đơn `Đã đóng` | Từ chối | ✔ |
| DH-26 | Chuẩn hóa khi tạo | Nhãn tiếng Việt thành mã lưu trữ | `Viện dưỡng lão`, `Cao đẳng`, `Không yêu cầu` | `vien_duong_lao`, `cao_dang`, `khong_yeu_cau` | ✔ |
| DH-27 | Cập nhật một phần | Chỉ gửi trường nào thì chỉ sửa trường đó | `{requirements:{age_min:25}}` | Đúng một khóa được ghi | ✔ |
| TG-01 | Tính tuổi | Theo năm sinh và mốc thời gian cho trước | Sinh 2003, mốc 11/09/2026 | 23 tuổi | ✔ |
| TG-02 | Thiếu năm sinh | Phân biệt "chưa rõ" với "bằng không" | Không có năm sinh | Trả về rỗng, **không** trả 0 | ✔ |

### 2.2. Nhập đơn hàng từ Excel

| Mã | Chức năng | Mục tiêu kiểm | Dữ liệu vào | Kết quả mong đợi | Đạt |
|---|---|---|---|---|:---:|
| NL-01 | File mẫu | Đủ sheet và đủ cột | File mẫu sinh ra | Có sheet nhập liệu, hướng dẫn, danh mục; tiêu đề khớp đúng thứ tự | ✔ |
| NL-02 | Vòng khứ hồi | Dữ liệu ví dụ trong file mẫu nhập lại được | Sheet ví dụ | Không dòng nào lỗi | ✔ |
| NL-03 | Dòng hợp lệ | Đọc thành bản ghi đúng | Một dòng đầy đủ | Nhãn thành mã, vùng tự suy, phụ cấp tách theo dấu chấm phẩy | ✔ |
| NL-04 | Nhãn không dấu | Nhận cả cách viết không dấu | `vien duong lao`, `khong yeu cau`, `co` | Nhận đúng | ✔ |
| NL-05 | Có mã đơn | Coi là cập nhật thay vì tạo mới | Dòng có `DH-0007` | Hành động `update` | ✔ |
| NL-06 | Định dạng ngày | Hiểu bốn cách viết ngày | `30/11/2026`, ISO, `30-11-2026`, ô kiểu ngày | Đều ra cùng một ngày | ✔ |
| NL-07 | **Tiếng Nhật nhiều mức** | Từ chối, không tự đoán | `N4 trở lên, ưu tiên N3` | Báo lỗi "ô ghi nhiều mức", buộc chọn một mức | ✔ |
| NL-08 | Dòng trống | Bỏ qua, không tính là lỗi | Xen một dòng trống | Chỉ đếm các dòng có dữ liệu | ✔ |
| NL-09 | Thứ tự cột | Đảo cột vẫn đọc được | Tiêu đề đảo ngược | Đọc đúng | ✔ |
| NL-10 | Thiếu cột bắt buộc | Báo trước khi đọc dòng nào | Bỏ cột tên đơn | Nêu tên cột thiếu, không trả dòng nào | ✔ |
| NL-11 | Thiếu giá trị bắt buộc | Nêu đúng tên cột | Ô tên đơn để trống | Thông báo có chữ "tên đơn" | ✔ |
| NL-12 | Giá trị ngoài danh mục | Liệt kê các lựa chọn hợp lệ | `nhà hàng` | Thông báo kèm danh sách nhận được | ✔ |
| NL-13 | Khoảng tuổi ngược | Bắt lỗi | 40 và 25 | Báo lỗi | ✔ |
| NL-14 | Khoảng lương ngược | Bắt lỗi | 300.000 và 100.000 | Báo lỗi | ✔ |
| NL-15 | **Ô sai ở cột không bắt buộc** | Báo lỗi thay vì âm thầm bỏ qua | `một năm`, `khoảng một trăm triệu`, `cuối tháng` | Cả ba đều báo lỗi có tên cột | ✔ |
| NL-16 | Hạn nộp đã qua | Chặn khi trạng thái đang tuyển | Hạn nộp năm ngày trước | Báo lỗi | ✔ |
| NL-17 | Hạn nộp đã qua trên đơn nháp | Cho phép | Hạn đã qua, trạng thái nháp | Không báo lỗi | ✔ |
| NL-18 | Ngày không đọc được | Báo lỗi rõ ràng | `tháng sau` | Thông báo "không đọc được thành ngày" | ✔ |
| NL-19 | Trạng thái đóng | Buộc đổi trên màn hình quản trị để lưu lịch sử | `Đã đóng` | Báo lỗi, chỉ dẫn sang màn hình quản trị | ✔ |
| NL-20 | Số lượng tuyển | Phải lớn hơn không | 0 | Báo lỗi | ✔ |
| NL-21 | Mã đơn lặp trong file | Chỉ rõ dòng đã xuất hiện trước | Hai dòng cùng `DH-0009` | Báo lỗi kèm số dòng đầu tiên | ✔ |
| NL-22 | Số dòng | Khớp tuyệt đối với số dòng Excel | Dòng 2 đúng, dòng 3 lỗi | Báo đúng dòng 2 và 3 | ✔ |
| NL-23 | File hỏng | Thông báo đọc được cho người dùng | Chuỗi không phải Excel | "Không đọc được file Excel" | ✔ |
| NL-24 | Sai định dạng | Chặn ở tầng API | File `.csv` | Mã lỗi 415 | ✔ |
| NL-25 | File quá lớn | Chặn trước khi đọc | Vượt 5MB | Mã lỗi 413 | ✔ |
| NL-26 | Thiếu cột ở tầng API | Chỉ dẫn tải lại file mẫu | Bỏ cột tên đơn | Mã lỗi 400, thông báo nêu tên cột | ✔ |

### 2.3. Dữ liệu mẫu

| Mã | Chức năng | Mục tiêu kiểm | Kết quả mong đợi | Đạt |
|---|---|---|---|:---:|
| DM-01 | Mã đơn | Tuần tự và không trùng | `DH-0001` đến `DH-0019`, không lặp | ✔ |
| DM-02 | Kiểu lưu trữ | Lưu mã chứ không lưu nhãn | Mọi enum thuộc bảng danh mục | ✔ |
| DM-03 | Vùng | Suy đúng từ tỉnh cho mọi đơn | Khớp bảng tra | ✔ |
| DM-04 | Kiểu ngày | Chuỗi ISO để so sánh được trong truy vấn | Đọc được bằng `date.fromisoformat` | ✔ |
| DM-05 | Khoảng giá trị | Tuổi, lương, số lượng đều hợp lệ | Không khoảng nào ngược | ✔ |
| DM-06 | Độ phủ chương trình | Đủ ba diện và ba loại hình cơ sở | 3 và 3 | ✔ |
| DM-07 | Độ phủ vùng | Trải ít nhất bốn vùng | Bảy vùng | ✔ |
| DM-08 | **Độ phủ tiếng Nhật** | Hồ sơ N4 phải vừa đạt đơn này vừa trượt đơn kia | Có đủ N5, N4, N3 | ✔ |
| DM-09 | Yêu cầu kinh nghiệm | Có đơn cần và có đơn không cần | Cả hai nhóm đều có | ✔ |
| DM-10 | Giới hạn giới tính | Có đơn giới hạn để kiểm tiêu chí này | Tồn tại đơn yêu cầu giới tính | ✔ |
| DM-11 | Số đơn bị ẩn | Đúng ba đơn không hiện trên website | 3 | ✔ |
| DM-12 | Lý do bị ẩn | Ba lý do khác nhau | Nháp, tạm dừng, và đang tuyển nhưng quá hạn | ✔ |
| DM-13 | Đánh dấu dữ liệu mẫu | Lệnh nạp lại không xóa nhầm đơn thật | Mọi đơn mẫu mang dấu `seed` | ✔ |

### 2.4. Hồ sơ ứng viên

| Mã | Chức năng | Mục tiêu kiểm | Dữ liệu vào | Kết quả mong đợi | Đạt |
|---|---|---|---|---|:---:|
| HS-01 | Ưu tiên nguồn | Bản đọc CV không đè thứ ứng viên đã tự sửa | Đã có N4 do ứng viên xác nhận, CV đọc ra N3 | Giữ N4, không ghi nhận thay đổi | ✔ |
| HS-02 | Ưu tiên nguồn | Nhân viên được phép sửa lại | Đã có N4 của ứng viên, nhân viên nhập N3 | Thành N3 | ✔ |
| HS-03 | Ưu tiên nguồn | Cùng nguồn thì được tự sửa mình | Ứng viên gõ lại tên có dấu | Nhận giá trị mới | ✔ |
| HS-04 | Nguồn dữ liệu | **Client không bao giờ khai được nguồn** | Gửi kèm `{"source": "staff"}` | Bị từ chối ngay ở bước kiểm dữ liệu | ✔ |
| HS-05 | Giá trị rỗng | Trường vắng mặt nghĩa là chưa rõ | Gửi chuỗi rỗng và `null` | Không ghi gì, không tạo ô rỗng | ✔ |
| HS-06 | Tách hai mục | Nguyện vọng không lọt vào chỗ dùng để loại đơn | Gửi `desired_prefecture` vào mục năng lực | Báo lỗi trường không hợp lệ | ✔ |
| HS-07 | Tách hai mục | Hai mục không dùng chung khóa nào | Giao của hai tập khóa | Rỗng | ✔ |
| HS-08 | Đã khai và chưa hỏi | `chua_hoc` là một câu trả lời | Hồ sơ khai chưa học tiếng | Không nằm trong danh sách còn thiếu | ✔ |
| HS-09 | Khóa lạc quan | Hai tab sửa cùng lúc | Tab sau gửi phiên bản đã cũ | Mã lỗi 409, yêu cầu tải lại | ✔ |
| HS-10 | Phiên bản | Gửi đúng giá trị đang có thì không đẻ phiên bản mới | Gửi lại tên cũ | Không ghi, không thêm bản lịch sử | ✔ |
| HS-11 | Xác nhận | Thiếu thông tin bắt buộc thì nói rõ thiếu gì | Hồ sơ trống | 409 kèm danh sách trường thiếu | ✔ |
| HS-12 | Xác nhận | Xác nhận hai lần không gây hại | Hồ sơ đã xác nhận | Trả về nguyên trạng, không ghi thêm | ✔ |
| HS-13 | **Suy ra vùng** | Vùng suy từ tỉnh phải thực sự vào được hồ sơ | Chỉ nêu `Tokyo` | Hồ sơ có `desired_region_group = kanto` | ✔ |
| HS-14 | Che dữ liệu | Bản công khai không lộ thông tin nội bộ | Hồ sơ đã phân công | Không có `assigned_to`, `lead_code`, lịch sử | ✔ |
| HS-15 | Phân quyền | Tư vấn viên chỉ thấy hồ sơ mình phụ trách | Vai trò `consultant` | Truy vấn bị ép thêm điều kiện phụ trách | ✔ |
| HS-16 | Phân quyền | Không mở được hồ sơ người khác | Hồ sơ của tư vấn viên khác | Mã lỗi 403 | ✔ |

### 2.5. Bộ đối chiếu

| Mã | Chức năng | Mục tiêu kiểm | Dữ liệu vào | Kết quả mong đợi | Đạt |
|---|---|---|---|---|:---:|
| DC-01 | **Tất định** | Chạy hai lần ra kết quả giống hệt | Cùng hồ sơ, cùng danh mục đơn | Hai chuỗi JSON giống nhau từng byte | ✔ |
| DC-02 | **Tất định** | Thứ tự database trả về không ảnh hưởng | Danh sách đơn đảo ngược | Vẫn ra đúng thứ tự hạng đó | ✔ |
| DC-03 | Không đọc đồng hồ | Thời điểm là tham số truyền vào | Chặn `local_today` | Không hàm nào gọi tới nó | ✔ |
| DC-04 | Bảy tiêu chí cứng | Mỗi đơn luôn sinh đúng bảy dòng | Mọi đơn, mọi hồ sơ | Bảy dòng, không hơn không kém | ✔ |
| DC-05 | Ba kết quả | Mỗi tiêu chí đạt đủ ba trạng thái | Ca dựng riêng cho từng tiêu chí | ĐẠT, KHÔNG ĐẠT, CHƯA RÕ | ✔ |
| DC-06 | **Chỉ loại khi chắc chắn** | Thiếu dữ liệu không loại đơn | Hồ sơ chỉ có họ tên | 16/18 đơn vẫn đạt | ✔ |
| DC-07 | Câu hỏi tiếp theo | Cái chưa biết thành câu hỏi | Hồ sơ thiếu chín trường | Chín câu hỏi bằng tiếng Việt | ✔ |
| DC-08 | Chưa khai năm sinh | Không phải là quá tuổi | Hồ sơ không có năm sinh | Không dòng tuổi nào KHÔNG ĐẠT | ✔ |
| DC-09 | Thứ bậc tiếng Nhật | `chua_hoc` thấp hơn `N5` | Sáu mức từ chưa học tới N1 | Số đơn đạt tăng đều, không giảm | ✔ |
| DC-10 | Thứ bậc bằng cấp | Bằng cao hơn không thấy ít đơn hơn | Bốn bậc bằng cấp | Số đơn đạt tăng đều | ✔ |
| DC-11 | Đơn hàng hỏng | Đơn thiếu hạn nộp hoặc trạng thái thì bị loại | Đơn khuyết trường | Loại, không phải CHƯA RÕ | ✔ |
| DC-12 | Bảng điểm mềm | Bốn tiêu chí, từng con số | Trùng tỉnh / trùng vùng / khác | 40 / 25 / 0 | ✔ |
| DC-13 | Mốc lương | Thiếu dưới 10% vẫn được điểm một phần | Đơn trả 90% mức mong muốn | Được điểm mốc gần | ✔ |
| DC-14 | **Đơn bị loại không có điểm** | Không mời người đọc đem so sánh | Đơn trượt tiêu chí cứng | Điểm 0, hạng rỗng, không có dòng mềm | ✔ |
| DC-15 | Phá thế hòa | Cùng điểm thì theo hạn nộp rồi tới mã đơn | Hai đơn cùng 60 điểm | Thứ tự `(-điểm, hạn, mã)` | ✔ |
| DC-16 | Nguyện vọng | Đổi nguyện vọng không đổi ai đạt ai trượt | Năm bộ nguyện vọng khác nhau | Số đơn đạt không đổi | ✔ |
| DC-17 | Nguyện vọng | Nhưng có đổi thứ tự | Mong muốn Kantō rồi Kyūshū | Đơn đứng đầu khác nhau | ✔ |
| DC-18 | Khung điểm | Không điểm nào vượt 100 hay âm | Mọi đơn mẫu | Trong khoảng 0–100 | ✔ |
| DC-19 | Trọng số | Tổng phải đúng 100 | File trọng số sai tổng | Báo lỗi ngay khi nạp | ✔ |
| DC-20 | Trọng số | Luật con không được vượt trọng số của nó | Luật 50 trong nhóm trọng số 40 | Báo lỗi | ✔ |
| DC-21 | Trọng số | **Thiếu file thì báo lỗi, không quay về số cứng** | Xóa đường dẫn file | Ném `WeightsError` | ✔ |
| DC-22 | Khối lý do | Khớp từng byte với bản thiết kế | Đơn mẫu trong tài liệu | Chuỗi giống hệt | ✔ |
| DC-23 | Khối lý do | Không dính gì tới mô hình ngôn ngữ | Quét module `explain` | Không import nào liên quan | ✔ |
| DC-24 | Kho đơn | Giữ đơn hết hạn và tạm dừng để chứng minh bộ lọc chạy | Truy vấn kho | Chỉ lọc `published`, không lọc trạng thái hay hạn | ✔ |
| DC-25 | Kho đơn | Đơn nháp không bao giờ được chào cho ai | Đơn `draft` | Không vào kho | ✔ |
| DC-26 | Dấu vân tay | Thứ tự database trả về không làm đổi dấu | Đảo danh sách | Dấu giống hệt | ✔ |
| DC-27 | Dấu vân tay | Sửa một đơn là bộ nhớ đệm mất hiệu lực | Đổi `updated_at` một đơn | Dấu khác đi | ✔ |
| DC-28 | Bộ nhớ đệm | Tra theo đủ bốn yếu tố đầu vào | Gọi lần hai trong mười phút | Dùng lại, không tính lại | ✔ |
| DC-29 | Bộ nhớ đệm | Nhân viên chạy lại thì bỏ qua đệm | Cờ `force` | Tính lại, kết quả vẫn giống hệt | ✔ |
| DC-30 | Nhật ký | Ghi mọi đơn đã xét kể cả đơn bị loại | 18 đơn, 9 đạt | 18 mục, mỗi mục có lý do từng tiêu chí | ✔ |
| DC-31 | Nhật ký | Đủ dữ liệu để tái lập kết quả | Một bản ghi | Có phiên bản bộ đối chiếu, trọng số, hai dấu vân tay, ngày tính | ✔ |
| DC-32 | Nhật ký | Danh sách không kéo theo bảng tiêu chí | Truy vấn danh sách | Trường `items` bị loại khỏi kết quả | ✔ |
| DC-33 | **Chốt chặn xác nhận** | Hồ sơ chưa xác nhận thì không được đối chiếu | Hồ sơ trạng thái `extracted` | Mã lỗi 409 | ✔ |
| DC-34 | Bản công khai | Ứng viên chỉ thấy đơn mình đạt | Kết quả có cả đơn trượt | Chỉ trả về đơn đạt | ✔ |
| DC-35 | Bản công khai | Luôn kèm câu miễn trừ | Mọi lần gọi | Có câu "không phải cam kết trúng tuyển" | ✔ |
| DC-36 | Phân quyền | Tư vấn viên chỉ xem nhật ký của mình | Vai trò `consultant` | Truy vấn bị ép thêm điều kiện phụ trách | ✔ |
| DC-37 | Phân quyền | Không chạy lại được trên hồ sơ người khác | Hồ sơ của người khác | Mã lỗi 403 | ✔ |
| DC-38 | Nhật ký thao tác | Nhân viên chạy lại thì có vết | Bấm chạy lại | Ghi `recommendation.rerun` | ✔ |

### 2.6. Nghiệm thu trên dữ liệu thật

Ngoài các ca đơn vị, có một kịch bản chạy trên database thật, đúng câu chuyện trong
`docs/design/14`: ứng viên 23 tuổi, Cao đẳng Điều dưỡng, N4, muốn làm viện dưỡng lão ở Tokyo.

```bash
cd backend
.\venv\Scripts\python.exe -m scripts.nghiem_thu_doi_chieu
```

Tám bước: kiểm kho đơn, nhập hồ sơ qua API công khai, đối chiếu, in khối lý do của đơn đứng đầu,
liệt kê đơn bị loại kèm lý do, chạy lại để so kết quả, thử hồ sơ mới điền một nửa, rồi dọn dẹp.
Lần chạy gần nhất: 18 đơn đã xét, 9 đạt, đơn đứng đầu 100/100, ba lần chạy cho kết quả giống hệt.
**Không gọi mô hình ngôn ngữ lần nào** — mọi điểm số và lời giải thích do Python sinh ra.

---

## 3. Bốn lỗi thật do kiểm thử phát hiện

Phần này đáng chú ý hơn con số 371, vì nó cho thấy bộ kiểm thử có tác dụng thật.

| Lỗi | Nếu lọt ra thì sao | Ca chặn |
|---|---|---|
| Chuỗi `N4 trở lên, ưu tiên N3` bị đọc thành `N3` | Lấy mức khó hơn mức bắt buộc, **loại oan toàn bộ ứng viên N4** ngay ở bộ lọc cứng. Đúng loại sai mà hệ thống này tồn tại để tránh | DH-06, NL-07 |
| Ba trường được đọc sau bước kiểm lỗi | Ô sai ở kinh nghiệm, tổng chi phí, ngày phỏng vấn âm thầm biến thành rỗng. Người nhập không hề biết dữ liệu của mình bị mất | NL-15 |
| Đơn rời trạng thái đang tuyển mà cờ công khai vẫn bật | Đơn đã tạm dừng hoặc đã đóng vẫn nằm trên website, ứng viên nộp hồ sơ vào đơn không còn nhận | DH-12 |
| Vùng suy ra từ tỉnh bị loại khỏi hồ sơ trước khi lưu | Ứng viên muốn Tokyo sẽ chấm một đơn ở Kanagawa — cùng vùng Kantō, đáng cộng 25 điểm — **ngang bằng một đơn ở Fukuoka**. Danh sách giới thiệu vẫn ra, chỉ là sai thứ tự | HS-13 |

Lỗi thứ nhất và lỗi thứ tư cùng một loại, và là loại nguy hiểm nhất: hệ thống vẫn chạy, không
báo lỗi gì, chỉ âm thầm cho ra kết quả sai. Không có ca kiểm thử thì chỉ phát hiện được khi một
ứng viên thật bị loại oan hoặc nhận một danh sách xếp sai.

Lỗi thứ tư đáng nói thêm: nó không bị bộ kiểm thử đơn vị bắt được, vì ca kiểm khi đó chỉ hỏi
"validator có suy ra vùng không" — và câu trả lời là có. Cái sai nằm ở bước sau, lúc đóng gói dữ
liệu để lưu. Nó lộ ra khi chạy kịch bản nghiệm thu đầu-cuối trên database thật và nhìn thấy dòng
`Vùng suy ra từ tỉnh: None`. Ca HS-13 được thêm vào sau đó, và giờ nó kiểm đúng chỗ: giá trị suy
ra có thực sự đi được tới hồ sơ hay không.

---

## 4. Cách viết kiểm thử trong dự án

Dùng `unittest` sẵn có của Python, lớp `IsolatedAsyncioTestCase` cho hàm bất đồng bộ,
`AsyncMock` và `patch` để thay thế tầng dữ liệu. Gọi thẳng hàm xử lý của endpoint và truyền
người dùng vào như tham số, thay vì dựng máy chủ thật.

Nhờ cách đó bộ kiểm thử chạy trong khoảng bốn giây, không cần mạng, không cần Gemini, và không
phụ thuộc vào việc MongoDB có đang chạy hay không ở phần lớn ca.

Tên ca kiểm thử viết thành câu mô tả điều cần đúng, ví dụ
`test_ambiguous_japanese_requirement_takes_the_minimum`. Khi một ca đổ lỗi, tên của nó đã nói
ra điều gì vừa hỏng, không phải mở mã nguồn ra đọc mới biết.

---

## 5. Những phần chưa có kiểm thử tự động

Nói rõ để không hiểu nhầm con số 371 là đã phủ hết hệ thống.

| Phần | Hiện trạng | Dự kiến |
|---|---|---|
| Giao diện website và màn hình quản trị | Kiểm tra bằng mắt và bằng lệnh dựng bản phát hành | Chưa có kế hoạch kiểm thử tự động trong phạm vi đồ án |
| Đọc hồ sơ CV | Mới có sáu file mẫu trong `backend/tests/fixtures/cv/` kèm đáp án chấm | Sẽ đo tỷ lệ trường rút đúng trên sáu hồ sơ đó |
| Đăng ký sơ bộ và phiếu tóm tắt | Chưa viết | Kiểm chuỗi tám chốt chặn theo đúng thứ tự |
| Hàng đợi và điểm nhân viên | Chưa viết | Có ca kiểm hai người cùng nhận một hồ sơ, một người phải nhận lỗi 409 |
| Chạy tải | Chưa làm | Ngoài phạm vi |

Sáu file CV mẫu đã sẵn sàng, gồm bốn định dạng khác nhau và một bản scan không có lớp chữ.
Mỗi hồ sơ nhắm một tình huống: đủ điều kiện, trình độ cao, chưa học tiếng, quá tuổi, thiếu năm
sinh, và ghi trình độ tiếng Nhật mập mờ. File `dap_an.json` đi kèm ghi những gì bộ đọc phải rút
ra đúng, dùng để chấm điểm bằng số khi phần đó hoàn thành.
