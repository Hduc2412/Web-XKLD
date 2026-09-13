# Hướng dẫn nhập danh mục đơn tuyển dụng

Thư mục này chứa file Excel chủ để doanh nghiệp nhập đơn hàng vào hệ thống.

| File | Vai trò |
|---|---|
| `MauDonHang_ChuDe.xlsx` | File chủ. Luôn giữ bản gốc, mỗi lần nhập thì sao chép ra một file con |
| `DonHang_<MaDoiTac>_<NamThang>.xlsx` | File con, ví dụ `DonHang_SAKURA_202609.xlsx` |

File chủ được sinh ra từ chính hệ thống, nên cột trong file luôn khớp với cột hệ
thống đọc. Khi có thay đổi, tải lại bản mới ở màn hình **Đơn tuyển dụng → Nhập từ Excel**
thay vì sửa tay tiêu đề cột.

---

## Các sheet trong file

| Sheet | Nội dung |
|---|---|
| `HuongDan` | Bản rút gọn của tài liệu này, để in kèm file |
| `DonHang` | **Nơi nhập dữ liệu.** Mỗi dòng là một đơn hàng |
| `DanhMuc` | Các giá trị hợp lệ. Nhiều ô ở sheet `DonHang` đã gắn sẵn danh sách chọn |
| `MauDuLieu` | Mười lăm đơn ví dụ đã điền sẵn, chỉ để tham khảo. Không nhập từ sheet này |

---

## Màu tiêu đề cột

| Màu | Nghĩa |
|---|---|
| Hồng | Bắt buộc điền. Thiếu thì dòng đó bị báo lỗi và không được ghi |
| Vàng | **Điều kiện bắt buộc.** Hệ thống dùng đúng những ô này để loại ứng viên không đủ điều kiện |
| Xanh | Thông tin tham khảo. Chỉ dùng để hiển thị và xếp hạng, không bao giờ loại ai |

Phân biệt hai nhóm vàng và xanh là điều quan trọng nhất khi nhập. Mỗi ô màu vàng
sinh ra đúng một dòng "đạt" hoặc "không đạt" khi hệ thống giải thích cho ứng viên
vì sao giới thiệu đơn này mà không giới thiệu đơn kia. Ô màu xanh ghi sai thì chỉ
hiển thị sai; ô màu vàng ghi sai thì có thể loại oan người đủ điều kiện.

---

## Quy tắc từng cột cần lưu ý

**Mã đơn.** Để trống khi thêm đơn mới, hệ thống tự cấp mã dạng `DH-0020`. Chỉ
điền mã khi muốn **cập nhật** một đơn đã có trong hệ thống.

**Tiếng Nhật tối thiểu.** Ghi đúng một mức: `N5`, `N4`, `N3`, `N2` hoặc `N1`.
Ô ghi kiểu `N4 trở lên, ưu tiên N3` sẽ bị báo lỗi. Hệ thống cố tình không tự đoán,
vì đoán nhầm sang mức khó hơn sẽ loại oan toàn bộ ứng viên ở mức thật.
Muốn ghi phần ưu tiên thì đưa vào cột **Điểm nổi bật**.

**Hạn nộp hồ sơ.** Ghi dạng ngày, ví dụ `30/11/2026`. Hạn đã qua mà trạng thái để
`Đang tuyển` thì bị báo lỗi. Đơn quá hạn tự biến mất khỏi website mà không cần ai
thao tác, nên không phải nhớ tắt công khai bằng tay.

**Phụ cấp, Điểm nổi bật.** Nhiều mục thì cách nhau bằng dấu chấm phẩy.
Ví dụ: `Ký túc xá; Phụ cấp ca đêm; Bao ăn ca`.

**Trạng thái.** File nhập chỉ nhận `Nháp` và `Đang tuyển`. Các trạng thái còn lại
là `Tạm dừng`, `Đủ số lượng`, `Hết hạn`, `Đã đóng` — đổi trên màn hình quản trị
để hệ thống ghi được ai đổi, lúc nào và vì sao.

**Công khai.** Ghi `Có` hoặc `Không`. Đơn chỉ thật sự hiện trên website khi đồng
thời đủ ba điều: đã bật công khai, đang tuyển, và còn hạn nộp.

**Ghi chú nội bộ.** Không bao giờ hiển thị cho khách, kể cả trên trang chi tiết
đơn hàng. Dùng cho thông tin trao đổi với đối tác.

**Tên tỉnh.** Viết theo chữ Latinh như `Tokyo`, `Osaka`, `Fukuoka`. Viết có dấu
kiểu `Tōkyō` cũng nhận được. Vùng tại Nhật hệ thống tự suy ra, không cần nhập.

---

## Quy trình nhập

1. Sao chép `MauDonHang_ChuDe.xlsx` thành một file con và đặt tên theo quy ước.
2. Điền dữ liệu vào sheet `DonHang`, mỗi dòng một đơn. Không xóa hàng tiêu đề.
3. Vào màn hình **Đơn tuyển dụng → Nhập từ Excel**, tải file lên.
4. Đọc bảng kiểm tra. Bảng này chỉ ra từng dòng sai và sai ở đâu.
   **Ở bước này chưa có gì được ghi vào hệ thống.**
5. Sửa lại file nếu cần rồi tải lên lại. Khi bảng kiểm tra sạch lỗi thì bấm xác nhận.

Số dòng trong bảng kiểm tra khớp đúng số dòng trong Excel, nên mở file ra sửa
theo số dòng đó là được.

---

## Những lỗi hay gặp

| Thông báo | Nguyên nhân và cách sửa |
|---|---|
| Thiếu tên đơn | Ô để trống ở cột bắt buộc |
| `'nhà hàng'` không hợp lệ | Giá trị ngoài danh mục. Xem sheet `DanhMuc` hoặc dùng ô chọn sẵn |
| Ô ghi nhiều mức (N4, N3) | Cột tiếng Nhật ghi nhiều mức. Chọn đúng một mức bắt buộc |
| Không đọc được thành ngày | Ô ngày bị định dạng thành chữ. Định dạng lại ô thành Ngày hoặc gõ `30/11/2026` |
| Hạn nộp đã qua nhưng trạng thái là Đang tuyển | Sửa hạn nộp, hoặc chuyển trạng thái về `Nháp` |
| Mã đơn bị lặp | Hai dòng trong cùng file có cùng mã. Xóa bớt hoặc để trống mã ở dòng muốn tạo mới |
| Tuổi từ phải nhỏ hơn hoặc bằng tuổi đến | Nhập ngược hai ô tuổi |

---

## Giới hạn

- Mỗi lần nhập tối đa 500 dòng và file không quá 5MB.
- Chỉ nhận định dạng `.xlsx`. File `.xls` cũ cần mở ra và lưu lại dạng `.xlsx`.
- Chỉ tài khoản Quản lý và Quản trị viên được nhập.
