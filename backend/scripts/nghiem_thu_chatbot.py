"""Nghiệm thu chatbot: có trả lời sai khi không đủ căn cứ không.

Trả lời câu hỏi thứ nhất trong `docs/design/13 §4`. Chạy bộ câu hỏi chuẩn ở
`tests/fixtures/chatbot/bo_cau_hoi.json` qua đúng luồng chat thật, rồi chấm từng
câu theo hai tiêu chí ngược nhau.

Chạy:  venv\\Scripts\\python.exe -m scripts.nghiem_thu_chatbot

## Hai loại câu, hai kiểu sai

Câu **phải trả lời** hỏng khi bot từ chối một thứ kho tri thức có sẵn — khách bị
đẩy sang hotline một cách vô ích.

Câu **phải từ chối** hỏng khi bot trả lời một thứ kho không có — đây là kiểu sai
nguy hiểm, vì khách tin và hành động theo. Một câu bịa về chuyện hoàn tiền có thể
khiến người ta nộp hồ sơ với kỳ vọng sai.

Bộ này cố tình có cả hai chiều. Chỉ đo một chiều thì cách "tối ưu" rẻ nhất là cho
bot từ chối mọi thứ, và nó sẽ đạt điểm tuyệt đối trong khi vô dụng.

## Vì sao là script chứ không phải ca kiểm thử

Cần mạng, gọi mô hình thật, và mỗi câu tốn một lượt gọi. Bộ kiểm thử thường phải
chạy được cả khi mất mạng. Đây là việc chạy tay trước mỗi mốc bàn giao.
"""
import asyncio
import json
import re
import sys
import uuid
from pathlib import Path

import app  # noqa: F401  — đặt stdout về UTF-8 để in được tiếng Việt
from app.conversation.fallback_messages import ALL_FALLBACKS, RATE_LIMITED
from app.db.database import close_db, init_db
from app.services.chat_service import process_message


FIXTURE = (
    Path(__file__).resolve().parents[1]
    / "tests"
    / "fixtures"
    / "chatbot"
    / "bo_cau_hoi.json"
)

# Bot có hai cách từ chối: câu dự phòng ghép sẵn (`ALL_FALLBACKS`), và câu do chính
# mô hình viết ra. Cách thứ hai không mang cờ `is_fallback`, nên phải nhận ra bằng
# chữ — đây cũng chính là vấn đề đã ghi trong tài liệu: mô hình tự từ chối mà hệ
# thống không đếm được.
TU_CHOI = re.compile(
    r"(website|tài liệu|thông tin|nguồn|dữ liệu)[^.]{0,40}(chưa|không) (cung cấp|có|đề cập|nêu)"
    r"|(chưa|không) (có|đủ|tìm thấy) (thông tin|dữ liệu|căn cứ)"
    r"|không thuộc chuyên môn"
    r"|ngoài phạm vi",
    re.IGNORECASE,
)


def la_tu_choi(answer: str, is_fallback: bool) -> bool:
    return bool(is_fallback or answer in ALL_FALLBACKS or TU_CHOI.search(answer))


# Gói miễn phí giới hạn hai mươi lượt gọi mỗi phút, nên chạy hết bộ câu hỏi rất
# dễ đụng trần. Nghỉ giữa các câu để không tự làm hỏng phép đo của chính mình.
NGHI_GIUA_CAU = 4.0


def _chuan_hoa(text: str) -> str:
    """Đưa hai bên về cùng một dạng trước khi so khớp.

    Bỏ dấu chấm ngăn nghìn, rồi quy "N triệu" về số nguyên. Thiếu bước sau thì
    "90 triệu" và "90.000.000" thành hai chuỗi khác nhau, và bộ nghiệm thu sẽ
    chấm hỏng một câu trả lời hoàn toàn đúng — chỉ vì cách viết số.
    """
    text = re.sub(r"\s+", " ", text.replace(".", "")).casefold()
    text = re.sub(r"(\d+)\s*triệu", lambda m: str(int(m.group(1)) * 1_000_000), text)
    return text


async def hoi(cau_hoi: str) -> dict:
    """Mỗi câu một phiên riêng: câu trước không được làm nền cho câu sau."""
    return await process_message(cau_hoi, session_id=str(uuid.uuid4()))


async def main() -> int:
    bo = json.loads(FIXTURE.read_text(encoding="utf-8"))
    await init_db()

    dat, hong, loi = 0, [], []
    try:
        for index, case in enumerate(bo["cau_hoi"]):
            if index:
                await asyncio.sleep(NGHI_GIUA_CAU)
            try:
                result = await hoi(case["cau_hoi"])
            except Exception as exc:  # noqa: BLE001 — một câu hỏng không được dừng cả lượt
                loi.append(f"{case['ma']}: {exc}")
                print(f"\n[{case['ma']}] {case['cau_hoi']}\n    CHƯA ĐO ĐƯỢC — {exc}")
                continue

            answer = result.get("answer", "")
            tu_choi = la_tu_choi(answer, result.get("is_fallback", False))
            print(f"\n[{case['ma']}] {case['cau_hoi']}")
            print(f"    {answer[:160]}")

            if case["loai"] == "phai_tu_choi":
                if tu_choi:
                    dat += 1
                    print("    ĐẠT — đã từ chối đúng lúc không có căn cứ")
                else:
                    hong.append(f"{case['ma']} · trả lời một thứ kho tri thức không có")
                    print("    HỎNG — đáng lẽ phải từ chối")
                continue

            thieu = [
                chuoi
                for chuoi in case.get("phai_co", [])
                if _chuan_hoa(chuoi) not in _chuan_hoa(answer)
            ]
            if tu_choi:
                hong.append(f"{case['ma']} · từ chối một thứ kho tri thức có sẵn")
                print("    HỎNG — từ chối trong khi kho có nội dung này")
            elif thieu:
                hong.append(f"{case['ma']} · thiếu nội dung bắt buộc: {', '.join(thieu)}")
                print(f"    HỎNG — thiếu: {', '.join(thieu)}")
            else:
                dat += 1
                print("    ĐẠT")
    finally:
        await close_db()

    tong = len(bo["cau_hoi"])
    print("\n" + "=" * 72)
    print(f"ĐẠT {dat}/{tong}   HỎNG {len(hong)}   CHƯA ĐO ĐƯỢC {len(loi)}")
    for line in hong:
        print("  -", line)
    for line in loi:
        print("  ?", line)
    print("=" * 72)
    return 1 if hong or loi else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
