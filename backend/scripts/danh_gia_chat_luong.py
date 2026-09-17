"""Đo chất lượng hệ thống theo `docs/design/07 §7`.

Bộ này trả lời ba câu hỏi đúng/sai mà spec §4 nêu cho bước 8:

1. Hệ thống có trả lời khi thiếu căn cứ không?
2. Bộ lọc điều kiện cứng có loại nhầm đơn nào không?
3. Thông tin rút từ CV có đúng với bản gốc không?

**Vì sao tách làm hai phần.** Câu 2 đo được ngay, không cần mạng, vì bộ đối chiếu
là Python thuần. Câu 1 và câu 3 cần Qdrant và Gemini đang chạy. Trộn chung thì
mỗi lần muốn biết bộ đối chiếu có ổn không lại phải dựng cả hạ tầng, nên phần
chạy được ngoại tuyến in ra số thật, phần còn lại chỉ báo là chưa đo được.

Chạy:  venv\\Scripts\\python.exe -m scripts.danh_gia_chat_luong
"""
import json
import os
from datetime import date
from pathlib import Path

# Đặt trước mọi import từ `app`. `app.core.config` kiểm tra cấu hình ngay lúc
# import và chết nếu thiếu khóa, trong khi bộ đo này không gọi Gemini lần nào.
# Không có hai dòng dưới thì người vừa clone repo về chạy bộ đo sẽ nhận lỗi cấu
# hình, dù thứ nó đo chẳng liên quan gì tới khóa. Có `.env` thật thì `.env` thắng.
os.environ.setdefault("GEMINI_API_KEY", "danh-gia-khong-goi-mo-hinh-nen-khoa-gia")
os.environ.setdefault("JWT_SECRET", "danh-gia-khong-ky-token-nen-dung-khoa-gia-du-dai")

import app  # noqa: E402,F401  — đặt stdout về UTF-8 để in được tiếng Việt
from app.conversation.entity_extractor import extract_phone
from app.conversation.intent_classifier import classify
from app.db import candidate_profiles as profile_store
from app.matching import engine
from app.matching.weights import load_weights
from scripts.seed_job_orders import build_documents


THU_MUC = Path(__file__).resolve().parent.parent / "tests" / "fixtures" / "danh_gia"
AS_OF = date(2026, 9, 16)


def doc(ten: str) -> dict:
    return json.loads((THU_MUC / ten).read_text(encoding="utf-8"))


def tieu_de(chu: str) -> None:
    print(f"\n{'─' * 76}\n{chu}\n{'─' * 76}")


# --- Câu 1 · Phân loại ý định -------------------------------------------------


def do_y_dinh() -> dict:
    du_lieu = doc("cau_hoi_y_dinh.json")
    sai = []
    for muc in du_lieu["cau_hoi"]:
        thuc_te = classify(muc["cau"])
        # Câu nằm giữa hai nhóm thì chấp nhận cả hai. Tính chúng là sai nghĩa là
        # đo tranh cãi về nhãn chứ không đo chất lượng bộ phân loại.
        chap_nhan = {muc["y_dinh"], *muc.get("y_dinh_chap_nhan_them", [])}
        if thuc_te not in chap_nhan:
            sai.append((muc["cau"], muc["y_dinh"], thuc_te, muc["do_kho"]))

    tong = len(du_lieu["cau_hoi"])
    dung = tong - len(sai)
    tieu_de(f"PHÂN LOẠI Ý ĐỊNH · {dung}/{tong} = {dung / tong:.1%} (mục tiêu ≥ 85%)")
    if sai:
        print(f"{len(sai)} câu sai:")
        for cau, mong, thuc, kho in sai[:15]:
            print(f"  [{kho}] {cau}")
            print(f"        mong đợi {mong} · nhận được {thuc}")
    return {"ten": "Phân loại ý định", "dat": dung, "tong": tong, "muc_tieu": 0.85}


# --- Câu 1b · Trích số điện thoại ---------------------------------------------


def do_so_dien_thoai() -> dict:
    du_lieu = doc("so_dien_thoai.json")
    sai = []
    for muc in du_lieu["cau_hoi"]:
        thuc_te = extract_phone(muc["cau"])
        if thuc_te != muc["so_mong_doi"]:
            sai.append((muc["cau"], muc["so_mong_doi"], thuc_te))

    tong = len(du_lieu["cau_hoi"])
    dung = tong - len(sai)
    tieu_de(f"TRÍCH SỐ ĐIỆN THOẠI · {dung}/{tong} = {dung / tong:.1%} (mục tiêu ≥ 95%)")
    if sai:
        print(f"{len(sai)} câu sai:")
        for cau, mong, thuc in sai:
            loai = "bắt nhầm" if mong is None else ("bỏ sót" if thuc is None else "sai số")
            print(f"  [{loai}] {cau}")
            print(f"        mong đợi {mong!r} · nhận được {thuc!r}")
    return {"ten": "Trích số điện thoại", "dat": dung, "tong": tong, "muc_tieu": 0.95}


# --- Câu 2 · Bộ đối chiếu có loại nhầm không ----------------------------------


def _ho_so(muc: dict) -> dict:
    """Dựng hồ sơ đúng hình dạng thật, mỗi ô mang nguồn của nó."""
    return {
        "fields": {k: profile_store.cell(v, "user_confirmed") for k, v in muc["fields"].items()},
        "preferences": {
            k: profile_store.cell(v, "user_confirmed") for k, v in muc["preferences"].items()
        },
    }


def _chay(muc: dict, kho: list, trong_so) -> engine.MatchResult:
    facts = engine.build_facts(_ho_so(muc), AS_OF)
    return engine.match_orders(kho, facts, weights=trong_so, as_of=AS_OF)


def _ly_do_loai(item: engine.MatchItem, khoa: str) -> bool:
    return any(r.key == khoa and r.result == engine.KHONG_DAT for r in item.hard_rows)


def do_doi_chieu() -> dict:
    du_lieu = doc("ho_so_doi_chieu.json")
    trong_so = load_weights()
    kho = [d for d in build_documents() if d.get("published")]

    ket_qua = {m["ma"]: _chay(m, kho, trong_so) for m in du_lieu["ho_so"]}
    dat_theo_ma = {ma: kq.eligible_count for ma, kq in ket_qua.items()}

    def kiem(ma: str, kd: str) -> tuple[bool, str]:
        kq = ket_qua[ma]
        items = kq.items
        if kd == "co_it_nhat_mot_don_dat":
            return kq.eligible_count > 0, f"{kq.eligible_count} đơn đạt"
        if kd == "khong_co_dong_chua_ro_nao":
            n = sum(1 for i in items if i.eligible
                    for r in i.hard_rows if r.result == engine.CHUA_RO)
            return n == 0, f"{n} dòng chưa rõ"
        if kd == "don_dung_dau_o_kanto":
            return items[0].region_group == "kanto", f"vùng {items[0].region_group}"
        if kd == "so_don_dat_khong_it_hon_HS-01":
            return dat_theo_ma[ma] >= dat_theo_ma["HS-01"], \
                f"{dat_theo_ma[ma]} so với {dat_theo_ma['HS-01']}"
        if kd == "so_don_dat_it_hon_HS-01":
            return dat_theo_ma[ma] < dat_theo_ma["HS-01"], \
                f"{dat_theo_ma[ma]} so với {dat_theo_ma['HS-01']}"
        if kd == "so_don_dat_khong_it_hon_moi_ho_so_khac":
            lon_nhat = max(v for k, v in dat_theo_ma.items() if k != ma)
            return dat_theo_ma[ma] >= lon_nhat, f"{dat_theo_ma[ma]} so với {lon_nhat}"
        if kd == "co_cau_hoi_bo_sung":
            return len(kq.missing_info) > 0, f"{len(kq.missing_info)} câu hỏi"
        if kd == "co_cau_hoi_ve_nam_sinh":
            return any("năm sinh" in c.lower() for c in kq.missing_info), \
                "; ".join(kq.missing_info)[:60]
        if kd == "co_cau_hoi_ve_gioi_tinh":
            return any("giới tính" in c.lower() for c in kq.missing_info), \
                "; ".join(kq.missing_info)[:60]
        if kd == "moi_don_bi_loai_deu_co_ly_do_ro_rang":
            thieu = [i.code for i in items if not i.eligible
                     and not any(r.result == engine.KHONG_DAT for r in i.hard_rows)]
            return not thieu, f"{len(thieu)} đơn bị loại không nêu lý do"
        if kd == "co_don_bi_loai_vi_tuoi":
            n = sum(1 for i in items if _ly_do_loai(i, "age"))
            return n > 0, f"{n} đơn"
        if kd.startswith("khong_don_nao_bi_loai_vi_"):
            khoa = {"tuoi": "age", "gioi_tinh": "gender", "kinh_nghiem": "experience",
                    "tieng_nhat": "japanese", "bang_cap": "education"}[kd.rsplit("vi_", 1)[1]]
            xau = [i.code for i in items if _ly_do_loai(i, khoa)]
            return not xau, f"{len(xau)} đơn: {', '.join(xau[:4])}"
        if kd == "don_yeu_cau_nu_khong_bi_loai_vi_gioi_tinh":
            xau = [i.code for i in items if _ly_do_loai(i, "gender")]
            return not xau, f"{len(xau)} đơn bị loại vì giới tính"
        if kd == "so_don_dat_bang_ho_so_khong_co_nguyen_vong":
            khong_nv = _chay({**muc_theo_ma[ma], "preferences": {}}, kho, trong_so)
            return kq.eligible_count == khong_nv.eligible_count, \
                f"{kq.eligible_count} so với {khong_nv.eligible_count}"
        if kd == "moi_diem_nam_trong_khoang_0_100":
            xau = [i.code for i in items if not (0 <= i.score <= 100)]
            return not xau, f"{len(xau)} đơn ngoài khoảng"
        return False, "chưa cài đặt phép kiểm này"

    muc_theo_ma = {m["ma"]: m for m in du_lieu["ho_so"]}
    tong = dat = 0
    hong = []
    for m in du_lieu["ho_so"]:
        for kd in m["khang_dinh"]:
            tong += 1
            ok, chi_tiet = kiem(m["ma"], kd)
            if ok:
                dat += 1
            else:
                hong.append((m["ma"], m["ten"], kd, chi_tiet))

    tieu_de(f"BỘ ĐỐI CHIẾU · {dat}/{tong} khẳng định đúng (mục tiêu 100%)")
    print("Số đơn đạt theo từng hồ sơ:")
    for m in du_lieu["ho_so"]:
        kq = ket_qua[m["ma"]]
        print(f"  {m['ma']}  {m['ten']:<38} {kq.eligible_count:>2}/{kq.total_considered} đơn")
    if hong:
        print(f"\n{len(hong)} khẳng định SAI:")
        for ma, ten, kd, ct in hong:
            print(f"  {ma} ({ten}) · {kd}")
            print(f"        {ct}")
    return {"ten": "Bộ đối chiếu", "dat": dat, "tong": tong, "muc_tieu": 1.0}


# --- Câu 1c và câu 3 · cần dịch vụ ngoài --------------------------------------


def bao_phan_chua_do() -> list[dict]:
    # Bộ câu hỏi chatbot nằm ở thư mục khác vì nó do phần chatbot dùng, và có cả
    # chiều "phải trả lời" chứ không chỉ chiều từ chối. Một con bot từ chối mọi
    # thứ sẽ đạt 100% nếu chỉ đo chiều từ chối, nên hai chiều phải đi cùng nhau.
    import json as _json
    ngoai_p = THU_MUC.parent / "chatbot" / "bo_cau_hoi.json"
    ngoai = _json.loads(ngoai_p.read_text(encoding="utf-8"))
    cv = json.loads(
        (THU_MUC.parent / "cv" / "dap_an.json").read_text(encoding="utf-8")
    )
    tieu_de("PHẦN CHƯA ĐO ĐƯỢC Ở ĐÂY")
    print("Hai hạng mục dưới đây cần Qdrant và Gemini đang chạy, nên bộ này chỉ")
    print("chuẩn bị sẵn dữ liệu chứ không tự chấm. Chạy khi đã dựng đủ dịch vụ.\n")
    tu_choi = sum(1 for c in ngoai["cau_hoi"] if c["loai"] == "phai_tu_choi")
    tra_loi = len(ngoai["cau_hoi"]) - tu_choi
    print(f"  Bộ câu hỏi chatbot       : {tu_choi} câu phải từ chối, {tra_loi} câu phải trả lời")
    print("     chạy bằng: python -m scripts.nghiem_thu_chatbot")
    print(f"  Độ chính xác đọc CV      : {len(cv)} hồ sơ mẫu kèm đáp án")
    print(f"     mục tiêu: ≥ 80% trường đúng, 0% suy diễn")
    print("\n  Spec đặt mốc 30 CV mẫu; hiện có 6. Cần bổ sung trước khi lấy số")
    print("  này làm bằng chứng trong báo cáo.")
    return []


def main() -> None:
    print("ĐO CHẤT LƯỢNG HỆ THỐNG — theo docs/design/07 §7")
    print(f"Ngày đối chiếu cố định: {AS_OF.isoformat()}")

    bang = [do_y_dinh(), do_so_dien_thoai(), do_doi_chieu()]
    bao_phan_chua_do()

    tieu_de("TỔNG HỢP")
    print(f"{'Hạng mục':<26}{'Kết quả':>12}{'Tỷ lệ':>10}{'Mục tiêu':>11}  Đạt")
    tat_ca_dat = True
    for d in bang:
        ty_le = d["dat"] / d["tong"]
        ok = ty_le >= d["muc_tieu"]
        tat_ca_dat = tat_ca_dat and ok
        print(f"{d['ten']:<26}{d['dat']:>6}/{d['tong']:<5}{ty_le:>9.1%}{d['muc_tieu']:>10.0%}"
              f"  {'có' if ok else 'KHÔNG'}")
    print()
    print("Tất cả hạng mục đo được đều đạt." if tat_ca_dat
          else "Có hạng mục chưa đạt mục tiêu — xem chi tiết ở trên.")


if __name__ == "__main__":
    main()
