"""
Response Validator — Sprint 2
Kiểm tra câu trả lời của Gemini trước khi trả về user.
"""

import re

from app.conversation.fallback_messages import (
    ALLOWED_PHONES,
    INVALID_ANSWER,
    RATE_LIMITED,
)

CORRECT_PHONE = list(ALLOWED_PHONES)
MIN_LENGTH = 20

# Giữ tên cũ để không phá chỗ đang import; nội dung lấy từ fallback_messages.
FALLBACK = INVALID_ANSWER
RATE_LIMIT_FALLBACK = RATE_LIMITED

def validate(answer: str, intent: str = "chung", awaiting_lead: bool = False) -> tuple[bool, str]:
    if not answer or len(answer.strip()) < MIN_LENGTH:
        print(f"[Validator] Câu trả lời quá ngắn: '{answer}'")
        return False, FALLBACK

    if answer.strip().startswith("Lỗi Gemini:"):
        print(f"[Validator] Phát hiện lỗi Gemini: '{answer[:50]}'")
        normalized_error = answer.lower()
        if (
            "429" in normalized_error
            or "quota" in normalized_error
            or "resource_exhausted" in normalized_error
            or "rate limit" in normalized_error
        ):
            return False, RATE_LIMIT_FALLBACK
        return False, FALLBACK

    # Bỏ qua check SĐT khi đang trong luồng lead (answer có thể echo SĐT khách)
    if intent != "lead" and not awaiting_lead:
        phone_pattern = r"0\d{9,10}"
        found_phones = re.findall(phone_pattern, answer.replace(".", ""))
        for phone in found_phones:
            normalized = phone.replace(".", "")
            if normalized not in [p.replace(".", "") for p in CORRECT_PHONE]:
                print(f"[Validator] Phát hiện SĐT lạ: {phone}")
                return False, FALLBACK

    return True, answer
