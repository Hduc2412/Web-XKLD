# 13 — Phạm vi và trạng thái

> Tài liệu trả lời: **làm đến đâu thì dừng**, và **hiện đang ở đâu**.
> Không chứa số liệu đo kiểm — phần đo kiểm chỉ làm sau khi các module lõi chạy đủ.
> Xem kèm: [Yêu cầu hệ thống](12_YEU_CAU_HE_THONG.md) · [Kiến trúc tổng quan](11_KIEN_TRUC_TONG_QUAN.md)

---

## 1. Ranh giới phạm vi

### 1.1. Phân hệ cơ bản — bắt buộc hoàn thành trong đồ án

```text
CÁC TÍNH NĂNG BẮT BUỘC
├── Kênh khách hàng  (chưa chốt UI/UX)
│   ├── Trò chuyện tư vấn và gửi CV, không cần tài khoản
│   ├── Xem đơn được gợi ý, tự chọn đơn và xác nhận đăng ký
│   └── Đặt lịch hẹn để nhân viên gọi lại
├── Tư vấn tự động
│   ├── Trả lời dựa trên tài liệu chính thức của công ty
│   ├── Hiểu câu hỏi nối tiếp trong cùng cuộc trò chuyện
│   └── Từ chối trả lời khi không đủ căn cứ, mời gặp nhân viên
├── Đọc hồ sơ ứng viên
│   ├── Nhận file CV ngay trong khung chat
│   ├── Rút ra thông tin năng lực và nguyện vọng
│   └── Cho ứng viên xác nhận lại trước khi dùng
├── Giới thiệu đơn hàng
│   ├── Loại đơn ứng viên chắc chắn không đủ điều kiện
│   ├── Sắp xếp theo mức độ khớp nguyện vọng
│   └── Nêu rõ vì sao phù hợp và điểm nào còn thiếu
├── Đăng ký sơ bộ và bàn giao
│   ├── Đặt lịch tư vấn trong giờ làm việc
│   ├── Tạo đăng ký sơ bộ sau khi ứng viên xác nhận chọn đơn
│   ├── Tự động tạo Phiếu tóm tắt tư vấn
│   └── Đẩy sang hệ thống nội bộ kèm thông báo
└── Hệ thống nội bộ
    ├── Tổng quan, hàng đợi hồ sơ, hồ sơ ứng viên tập trung
    ├── Nhận xử lý, phân công và chuyển người phụ trách
    ├── Vòng đời trạng thái đơn tuyển dụng và hồ sơ đăng ký
    ├── Quản lý lịch hẹn
    ├── Quản lý danh mục đơn tuyển dụng (kể cả nhập hàng loạt)
    ├── Nhật ký giới thiệu để kiểm định chất lượng
    ├── Quản lý nhân viên và điểm hiệu suất theo sự kiện
    └── Quản lý tri thức, người dùng và nhật ký thao tác
```

### 1.2. Phân hệ nâng cao — hướng phát triển tiếp, ngoài phạm vi bảo vệ

```text
NGOÀI PHẠM VI ĐỒ ÁN
├── Nhân viên tiếp quản chat trực tiếp trong lúc khách đang online
├── Tích hợp Fanpage Facebook và Zalo Official Account
├── Tự động nhắn tin nhắc lịch hẹn qua SMS / Zalo
├── Chấm điểm độ phù hợp bằng Machine Learning trên dữ liệu lịch sử
├── Ứng dụng di động riêng cho ứng viên theo dõi hồ sơ
├── Tài khoản đăng nhập cho ứng viên
└── Đồng bộ đơn hàng tự động từ hệ thống của đối tác Nhật
```

### 1.3. Lý do phân định như vậy

| Tính năng nâng cao | Vì sao để lại sau |
|---|---|
| Chat trực tiếp với nhân viên | Cần người trực liên tục — là bài toán vận hành, không phải bài toán kỹ thuật của đồ án |
| Facebook / Zalo | Phụ thuộc phê duyệt của nền tảng và tài khoản doanh nghiệp thật, nằm ngoài tầm kiểm soát |
| SMS / Zalo nhắc lịch | Là dịch vụ trả phí |
| Machine Learning chấm điểm | Chưa có dữ liệu lịch sử để học; và mô hình học được sẽ **không giải trình được** — đi ngược yêu cầu cốt lõi |
| Ứng dụng di động | Chưa đánh giá được vì UI/UX cho kênh khách hàng chưa thiết kế |

---

## 2. Trạng thái hiện tại

### 2.1. Đã hoàn thành và chạy được

| Phần | Nội dung |
|---|---|
| Tư vấn tự động | Trả lời dựa trên tài liệu công ty, nhận diện ý định, giữ ngữ cảnh nhiều lượt, từ chối khi thiếu căn cứ |
| Đặt lịch | Thu thông tin theo từng bước, xác nhận lại, lưu lịch, thông báo cho nhân viên |
| Quản lý lịch hẹn | Lọc, phân công, đổi lịch có lưu lịch sử, ghi kết quả gọi, chặn trùng lịch |
| Quản lý khách hàng | Hồ sơ khách, hành trình khách hàng, chống trùng theo số điện thoại |
| Hệ thống nội bộ | Đăng nhập, ba vai trò, phân quyền theo vai trò, nhật ký thao tác |
| Màn hình quản trị | Tổng quan, khách hàng, lịch hẹn, hội thoại, tri thức, người dùng, nhật ký |
| Nạp tri thức | Quy trình thu thập, làm sạch, cắt đoạn và đưa tài liệu vào kho tra cứu |

### 2.2. Đang thiếu — chính là phần trọng tâm còn lại

| Phần | Trạng thái |
|---|---|
| **Danh mục đơn hàng** | Chưa có dữ liệu và chưa có màn hình quản lý |
| **Đọc hồ sơ CV** | Chưa có — hệ thống hiện chưa nhận file |
| **Giới thiệu đơn hàng phù hợp** | Chưa có |
| **Phiếu tóm tắt tư vấn** | Chưa có |
| **Nhật ký giới thiệu** | Chưa có |
| Kênh khách hàng / UI | Mới có chatbot; cấu trúc và UI/UX **chưa được thống nhất** |
| Hồ sơ ứng viên tập trung | Chưa gom đủ CV, hội thoại và đề xuất về một màn hình |
| Triển khai chạy thật | Đang chạy trên máy cá nhân, chưa đưa lên môi trường thật |
| **Đăng ký sơ bộ** | Chưa có — mới xong thiết kế nghiệp vụ và điều kiện xác nhận |
| **Hàng đợi hồ sơ cho nhân viên** | Chưa có — cần luồng nhận, khóa sở hữu, chuyển người phụ trách |
| **Vòng đời trạng thái hồ sơ** | Chưa có đầy đủ vòng đời và lịch sử chuyển trạng thái |
| **Điểm nhân viên** | Chưa có — cần lưu theo sự kiện, không chỉ một số tổng |

### 2.3. Cách đọc bức tranh này

Phần đã xong là **nền móng**: tiếp nhận câu hỏi, trả lời có căn cứ, đặt lịch, quản lý nội bộ.

Phần còn thiếu là **chuỗi giá trị chính của đề tài**:

```text
CV / lời kể  →  hồ sơ có cấu trúc  →  đối chiếu đơn hàng  →  giới thiệu kèm lý do  →  phiếu tóm tắt
```

Đây là phần biến hệ thống từ "một chatbot trả lời câu hỏi" thành "một trợ lý sơ tuyển".

---

## 3. Thứ tự triển khai phần còn lại

Thứ tự này **không đảo được**, vì mỗi bước là đầu vào của bước sau.

| Bước | Việc | Kết quả cần đạt |
|---|---|---|
| 1 | Dựng danh mục đơn tuyển dụng và màn hình quản lý | Có dữ liệu chuẩn để công khai và đối chiếu |
| 2 | Nhận CV PDF/DOCX và lập hồ sơ ứng viên | Lưu bản gốc, trường dữ liệu và nguồn trích xuất |
| 3 | Xác nhận hồ sơ và đơn ứng viên lựa chọn | Không tạo đăng ký từ suy đoán của AI |
| 4 | Đối chiếu điều kiện và giải thích đơn phù hợp | Kết quả xác định, có thể kiểm tra lại |
| 5 | Tạo đăng ký sơ bộ, phiếu tóm tắt và hàng đợi nhân viên | Nhân viên nhận đủ bối cảnh mà không nhập lại |
| 6 | Áp dụng vòng đời trạng thái và phân công sở hữu | Một hồ sơ có một người phụ trách tại một thời điểm |
| 7 | Bổ sung quản lý nhân viên và điểm theo sự kiện | Quản lý theo dõi được hiệu suất và lịch sử điều chỉnh |
| 8 | Thiết kế kênh khách hàng rồi kiểm thử tổng thể | Chỉ đo kiểm sau khi chuỗi nghiệp vụ đã chạy đủ |

---

## 4. Về phần đo kiểm

Chưa đưa số liệu vào báo cáo ở giai đoạn này, vì:

- Các module trọng tâm chưa hoàn thành, đo bây giờ sẽ phải đo lại.
- Bộ dữ liệu kiểm chứng cần được xây dựng cùng với danh mục đơn hàng thật.
- Số liệu đưa ra sớm mà sau đó thay đổi sẽ làm giảm độ tin cậy của báo cáo.

Khi các module đã chạy đủ, phần đo kiểm sẽ tập trung vào ba câu hỏi:

1. Hệ thống có trả lời sai khi không đủ căn cứ không?
2. Bộ lọc điều kiện cứng có bỏ sót hoặc loại nhầm đơn hàng nào không?
3. Thông tin rút ra từ CV có đúng với bản gốc không?

Cả ba đều là câu hỏi **đúng/sai kiểm được bằng tay**, không cần chỉ số phức tạp.
