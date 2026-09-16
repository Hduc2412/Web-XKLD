"""Nơi duy nhất định nghĩa các câu trả lời dự phòng của chatbot.

Trước đây bốn câu này nằm rải ở `chat_service` và `response_validator`, nên
`analytics_service` phải dò chuỗi để đếm tỷ lệ fallback và chỉ bắt được một
trong bốn câu. Gom về đây để mọi nơi dùng chung một nguồn.
"""
from app.core.config import settings


def _digits(phone: str) -> str:
    return phone.replace(".", "").replace(" ", "").replace("-", "")


SUPPORT_PHONE = settings.support_phone
SUPPORT_PHONE_DIGITS = _digits(SUPPORT_PHONE)

# Các số được phép xuất hiện trong câu trả lời (dạng có dấu chấm và không dấu).
ALLOWED_PHONES = (SUPPORT_PHONE, SUPPORT_PHONE_DIGITS)

# Không tìm được đoạn tri thức nào vượt ngưỡng.
NO_KNOWLEDGE = (
    "Xin lỗi, tôi không tìm thấy thông tin liên quan. "
    f"Vui lòng liên hệ {SUPPORT_PHONE} để được tư vấn trực tiếp."
)

# Người dùng tỏ ý quan tâm nhưng chưa có tri thức để trả lời.
LEAD_NO_KNOWLEDGE = (
    "Nếu bạn muốn nhân viên liên hệ, hãy nhắn **đặt lịch tư vấn** "
    "để mình hỗ trợ chọn ngày và giờ."
)

# Câu trả lời của mô hình không qua được bước kiểm chứng.
INVALID_ANSWER = (
    "Xin lỗi, mình chưa có đủ thông tin để trả lời câu này. "
    f"Vui lòng liên hệ anh Quang qua số {SUPPORT_PHONE} để được tư vấn trực tiếp nhé!"
)

# Dịch vụ ngôn ngữ đang quá tải.
RATE_LIMITED = (
    "Hiện chatbot đang có nhiều yêu cầu cùng lúc. "
    "Bạn vui lòng thử lại sau khoảng một phút nhé!"
)

ALL_FALLBACKS = (NO_KNOWLEDGE, LEAD_NO_KNOWLEDGE, INVALID_ANSWER, RATE_LIMITED)
