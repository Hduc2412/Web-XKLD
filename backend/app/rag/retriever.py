from app.db.qdrant import get_qdrant_client, COLLECTION_NAME
from app.core.config import settings
from app.llm.gemini import create_embedding
from qdrant_client.http.exceptions import ResponseHandlingException, UnexpectedResponse
from app.rag.taxonomy import infer_topic

TOP_K = 5
MIN_RETRIEVAL_SCORE = settings.min_retrieval_score

# Giữ lại để tầng trên và phần thống kê còn biết mỗi ý định thuộc nhóm chủ đề
# nào. Không còn dùng để lọc hay để xếp hạng — lý do ở docstring của `search`.
INTENT_TO_TOPICS = {
    "chi_phi": ["chi_phi"],
    "quy_trinh": ["quy_trinh"],
    "dieu_kien": ["dieu_kien"],
    "luong_thuong": ["luong_thuong"],
    "cong_viec": ["cong_viec"],
    "phong_van": ["phong_van"],
    "thoi_gian": ["thoi_gian"],
    "hoc_tap": ["hoc_tap"],
    "ky_tuc_xa": ["ky_tuc_xa"],
    "lead": ["chi_phi", "quy_trinh", "dieu_kien"],
    "chung": [],
}


def _topic_of(hit) -> str:
    """Chủ đề của đoạn; suy ra cho dữ liệu cũ chưa gắn sẵn."""
    topic = hit.payload.get("topic")
    if not topic:
        topic = infer_topic(
            hit.payload.get("section", ""),
            hit.payload.get("title", ""),
        )
        hit.payload["topic"] = topic
    return topic


def search(query: str, intent: str = "chung") -> list:
    """Embed câu hỏi rồi lấy các đoạn gần nghĩa nhất trên toàn kho tri thức.

    Chủ đề suy ra từ ý định **không** tham gia vào việc chọn đoạn nữa, vì đo trên
    dữ liệu thật cho thấy nó chỉ làm hỏng kết quả:

    - Lọc cứng theo chủ đề: câu "Khi bắt đầu thì tiền cọc là bao nhiêu?" bị xếp
      vào `quy_trinh` chỉ vì hai chữ "bắt đầu", nên đoạn ghi rõ "đặt cọc 10 triệu"
      (chủ đề `chi_phi`) bị loại thẳng. Chatbot trả lời là tài liệu không nêu,
      trong khi kho tri thức có sẵn câu trả lời.
    - Cộng điểm thưởng cho đoạn đúng chủ đề: nhẹ tay hơn nhưng vẫn sai cùng kiểu.
      Phân loại sai thì phần thưởng đẩy nhầm đoạn lên đầu. Vẫn với câu trên,
      thưởng 0.04 đưa đoạn "Cách đăng ký" (0.679 → 0.719) vượt lên trên đoạn
      "Quy trình đóng phí" (0.706) là đoạn thật sự chứa con số.

    Trên bộ câu hỏi thử, xếp hạng thuần theo độ gần nghĩa chọn đúng đoạn ở **cả
    năm câu**, tốt hơn cả hai cách trên. Chừng nào bộ phân loại ý định còn nhầm
    thì mọi cách dùng nó để can thiệp vào xếp hạng đều khuếch đại cái nhầm đó.

    `intent` vẫn nhận vào để chữ ký hàm không đổi và để ghi log đối chiếu.
    """
    query_vector = create_embedding(query)
    if not query_vector:
        return []

    qdrant = get_qdrant_client()
    try:
        points = qdrant.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=TOP_K,
        ).points
    except (ResponseHandlingException, UnexpectedResponse) as exc:
        print(f"[Qdrant] Search failed: {exc}")
        return []

    hits = [hit for hit in points if hit.score >= MIN_RETRIEVAL_SCORE]
    for hit in hits:
        _topic_of(hit)

    if hits:
        wanted = set(INTENT_TO_TOPICS.get(intent, []))
        lech = [h.payload.get("topic") for h in hits[:1] if wanted and h.payload.get("topic") not in wanted]
        if lech:
            print(f"[Retriever] Ý định '{intent}' nhưng đoạn hợp nhất thuộc chủ đề '{lech[0]}'.")

    return hits
