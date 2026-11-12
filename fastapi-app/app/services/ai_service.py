import asyncio
import json
import logging
from typing import Any, Optional

from google import genai

from app.core.config import settings
from app.models.chat import ChatMessage
from app.services.rag_service import RAGService
from app.utils.lunar_calendar import (
    get_lunar_context_for_prompt,
    lunar_to_solar,
    solar_to_lunar,
)

logger = logging.getLogger(__name__)

LUNAR_TOOLS: list[dict[str, Any]] = [
    {
        "type": "function",
        "name": "convert_solar_to_lunar",
        "description": (
            "Chuyển đổi một ngày Dương lịch sang Âm lịch Việt Nam (chuẩn Hồ Ngọc Đức), "
            "trả về ngày/tháng/năm Âm lịch, Can Chi năm/tháng/ngày, dấu hiệu Rằm/Mùng Một, "
            "sự kiện tâm linh và danh sách 12 khung giờ Hoàng Đạo / Hắc Đạo."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "day": {
                    "type": "integer",
                    "description": "Ngày Dương lịch (1 - 31).",
                },
                "month": {
                    "type": "integer",
                    "description": "Tháng Dương lịch (1 - 12).",
                },
                "year": {
                    "type": "integer",
                    "description": "Năm Dương lịch (ví dụ: 2026).",
                },
            },
            "required": ["day", "month", "year"],
        },
    },
    {
        "type": "function",
        "name": "convert_lunar_to_solar",
        "description": (
            "Chuyển đổi một ngày Âm lịch Việt Nam sang ngày Dương lịch tương ứng."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "lunar_day": {
                    "type": "integer",
                    "description": "Ngày Âm lịch (1 - 30).",
                },
                "lunar_month": {
                    "type": "integer",
                    "description": "Tháng Âm lịch (1 - 12).",
                },
                "lunar_year": {
                    "type": "integer",
                    "description": "Năm Âm lịch (ví dụ: 2026).",
                },
                "is_leap_month": {
                    "type": "boolean",
                    "description": "Có phải tháng nhuận Âm lịch hay không (mặc định False).",
                },
            },
            "required": ["lunar_day", "lunar_month", "lunar_year"],
        },
    },
]

_BASE_PERSONA = """Bạn là **E-Spirit**, Trợ lý AI chuyên sâu về Văn hóa Tâm linh, Nghi lễ Thờ cúng truyền thống và Lịch Âm Dương Việt Nam.

Nguyên tắc ứng xử và phong cách trả lời:
1. **Lịch sự, trang trọng, ấm áp và chuẩn mực**: Xưng hô tôn trọng (gọi người dùng là "gia chủ" hoặc "bạn", tự xưng "E-Spirit"), ngôn từ trong sáng, gần gũi và giàu tính văn hóa truyền thống Việt Nam.
2. **Đúng mực, không mê tín dị đoan**: Giải thích ý nghĩa nghi lễ trên tinh thần hướng thiện, giữ gìn gia đạo, hiếu kính tổ tiên. Tuyệt đối KHÔNG cổ súy mê tín dị đoan, bói toán trục lợi, dọa nạt tâm linh hay phán xét vận hạn cực đoan.
3. **Phạm vi hỗ trợ**: Chuyên tư vấn về văn khấn cổ truyền, mâm cúng lễ vật, cách bài trí & bao sái bàn thờ, nghi thức thắp hương/hóa vàng, ý nghĩa lễ Tết truyền thống và tra cứu đổi ngày Âm - Dương, Can Chi, giờ Hoàng Đạo. Với các câu hỏi hoàn toàn ngoài phạm vi này (ví dụ lập trình, chứng khoán, giải bài tập, chính trị, y tế...), hãy từ chối khéo léo, lịch sự và gợi ý quay lại các chủ đề văn hóa, thờ cúng hoặc lịch âm dương.
4. **Sử dụng công cụ lịch chính xác**: Khi người dùng hỏi đổi ngày Dương sang Âm, đổi ngày Âm sang Dương, tra ngày Rằm/Mùng Một/Tết/lễ sắp tới, Can Chi hoặc giờ Hoàng Đạo của một ngày cụ thể, HÃY LUÔN gọi tool `convert_solar_to_lunar` hoặc `convert_lunar_to_solar` để trả lời chính xác tuyệt đối, không tự đoán.
5. **Ưu tiên kho tri thức chuẩn**: Khi phần "TÀI LIỆU THAM KHẢO TỪ KHO TRI THỨC" có bài văn khấn hoặc hướng dẫn liên quan trực tiếp, hãy dựa sát vào nội dung đó. Nếu người dùng hỏi xin bài văn khấn, hãy trích dẫn đầy đủ, rõ ràng nguyên văn bài văn khấn chuẩn để gia chủ dễ đọc theo."""


class AIService:
    """
    AI Service thực tế sử dụng Gemini 3.8 Flash (qua Google GenAI SDK `client.interactions.create`),
    kết hợp Lightweight Hybrid RAG và Tool Calling tra cứu Lịch Âm - Dương Việt Nam.
    """

    def __init__(
        self,
        rag_service: Optional[RAGService] = None,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
    ):
        self.rag_service = rag_service or RAGService()
        self.api_key = (api_key if api_key is not None else settings.GEMINI_API_KEY).strip()
        self.model = (model or settings.GEMINI_MODEL).strip() or "gemini-3.8-flash"
        self._client: Optional[genai.Client] = None

    def _get_client(self) -> Optional[genai.Client]:
        """Khởi tạo lazy genai.Client nếu có GEMINI_API_KEY."""
        if not self.api_key:
            return None
        if self._client is None:
            self._client = genai.Client(api_key=self.api_key)
        return self._client

    @staticmethod
    def _filter_relevant_docs(docs: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Lọc tài liệu thực sự liên quan để tránh làm nhiễu prompt ở các câu hỏi chào hỏi/tra ngày."""
        if not docs:
            return []
        relevant: list[dict[str, Any]] = []
        for doc in docs:
            score = float(doc.get("score", 0.0) or 0.0)
            has_semantic = doc.get("semantic_score") is not None
            threshold = 0.35 if has_semantic else 0.22
            if score >= threshold:
                relevant.append(doc)
        return relevant

    @staticmethod
    def _build_system_instruction(relevant_docs: list[dict[str, Any]]) -> str:
        """Xây dựng System Instruction gồm vai trò E-Spirit, ngữ cảnh thời gian thực và tài liệu RAG."""
        lunar_now = get_lunar_context_for_prompt()
        parts = [
            _BASE_PERSONA,
            f"--- NGỮ CẢNH THỜI GIAN THỰC (MÚI GIỜ VIỆT NAM) ---\n{lunar_now}",
        ]

        if relevant_docs:
            doc_blocks = []
            for idx, doc in enumerate(relevant_docs, start=1):
                doc_blocks.append(
                    f"[Tài liệu {idx} - {doc.get('category', '')}] {doc.get('title', '')}\n"
                    f"{doc.get('content', '')}"
                )
            parts.append(
                "--- TÀI LIỆU THAM KHẢO TỪ KHO TRI THỨC E-SPIRIT ---\n"
                + "\n\n".join(doc_blocks)
            )

        return "\n\n".join(parts)

    @staticmethod
    def _format_history_steps(
        user_message: str,
        history: Optional[list[ChatMessage]],
    ) -> list[dict[str, Any]]:
        """
        Chuyển đổi lịch sử ChatMessage (theo thứ tự ASC) + tin nhắn hiện tại thành danh sách steps
        hợp lệ cho `client.interactions.create`.
        """
        steps: list[dict[str, Any]] = []
        trimmed_history = list(history or [])

        # Tránh lặp tin nhắn cuối nếu caller đã lưu user_msg trước khi lấy recent_messages
        if (
            trimmed_history
            and trimmed_history[-1].sender == "user"
            and trimmed_history[-1].content.strip() == user_message.strip()
        ):
            trimmed_history = trimmed_history[:-1]

        for msg in trimmed_history:
            text = (msg.content or "").strip()
            if not text:
                continue
            step_type = "user_input" if msg.sender == "user" else "model_output"
            # Tránh bắt đầu bằng model_output nếu sliding window cắt ngang giữa cặp hội thoại
            if not steps and step_type == "model_output":
                continue
            steps.append(
                {
                    "type": step_type,
                    "content": [{"type": "text", "text": text}],
                }
            )

        steps.append(
            {
                "type": "user_input",
                "content": [{"type": "text", "text": user_message}],
            }
        )
        return steps

    @staticmethod
    def _execute_tool(name: str, arguments: dict[str, Any]) -> tuple[dict[str, Any], bool]:
        """Thực thi các tool chuyển đổi Âm - Dương lịch từ app/utils/lunar_calendar.py."""
        try:
            if name == "convert_solar_to_lunar":
                day = int(arguments["day"])
                month = int(arguments["month"])
                year = int(arguments["year"])
                return solar_to_lunar(day=day, month=month, year=year), False

            if name == "convert_lunar_to_solar":
                lunar_day = int(arguments["lunar_day"])
                lunar_month = int(arguments["lunar_month"])
                lunar_year = int(arguments["lunar_year"])
                is_leap_month = bool(arguments.get("is_leap_month", False))
                return (
                    lunar_to_solar(
                        lunar_day=lunar_day,
                        lunar_month=lunar_month,
                        lunar_year=lunar_year,
                        is_leap_month=is_leap_month,
                    ),
                    False,
                )

            return {"error": f"Tool không được hỗ trợ: {name}"}, True
        except Exception as exc:
            logger.warning("Lỗi khi thực thi tool %s với tham số %s: %s", name, arguments, exc)
            return {"error": f"Tham số ngày tháng không hợp lệ: {exc}"}, True

    @staticmethod
    def _extract_interaction_text(interaction: Any) -> str:
        """Trích xuất văn bản trả lời cuối cùng từ đối tượng Interaction."""
        output_text = getattr(interaction, "output_text", None)
        if isinstance(output_text, str) and output_text.strip():
            return output_text.strip()

        collected: list[str] = []
        for step in getattr(interaction, "steps", None) or []:
            if getattr(step, "type", None) == "model_output":
                for part in getattr(step, "content", None) or []:
                    text_val = getattr(part, "text", None)
                    if isinstance(text_val, str) and text_val.strip():
                        collected.append(text_val.strip())
        return "\n".join(collected).strip()

    def _call_gemini_sync(
        self,
        system_instruction: str,
        steps_input: list[dict[str, Any]],
    ) -> str:
        """Gọi đồng bộ Gemini 3.8 Flash qua Interactions API và xử lý vòng lặp Tool Calling."""
        client = self._get_client()
        if client is None:
            raise RuntimeError("GEMINI_API_KEY chưa được cấu hình.")

        generation_config = {"thinking_level": "low"}

        interaction = client.interactions.create(
            model=self.model,
            system_instruction=system_instruction,
            input=steps_input,
            tools=LUNAR_TOOLS,
            generation_config=generation_config,
        )

        max_tool_rounds = 5
        for _ in range(max_tool_rounds):
            function_calls = [
                step
                for step in (getattr(interaction, "steps", None) or [])
                if getattr(step, "type", None) == "function_call"
            ]
            if not function_calls:
                break

            tool_results: list[dict[str, Any]] = []
            for fc_step in function_calls:
                raw_args = getattr(fc_step, "arguments", None) or {}
                if not isinstance(raw_args, dict):
                    raw_args = {}
                result_payload, is_error = self._execute_tool(fc_step.name, raw_args)
                result_step: dict[str, Any] = {
                    "type": "function_result",
                    "name": fc_step.name,
                    "call_id": fc_step.id,
                    "result": [
                        {
                            "type": "text",
                            "text": json.dumps(result_payload, ensure_ascii=False),
                        }
                    ],
                }
                if is_error:
                    result_step["is_error"] = True
                tool_results.append(result_step)

            interaction = client.interactions.create(
                model=self.model,
                previous_interaction_id=interaction.id,
                system_instruction=system_instruction,
                tools=LUNAR_TOOLS,
                generation_config=generation_config,
                input=tool_results,
            )

        reply_text = self._extract_interaction_text(interaction)
        if not reply_text:
            raise ValueError("Gemini trả về nội dung rỗng.")
        return reply_text

    @staticmethod
    def _generate_fallback_reply(
        user_message: str,
        relevant_docs: list[dict[str, Any]],
    ) -> str:
        """
        Phản hồi dự phòng an toàn dựa trên RAG (keyword matching) và ngữ cảnh Âm lịch hiện tại
        khi chưa có GEMINI_API_KEY hoặc Gemini API gặp lỗi.
        """
        lowered = (user_message or "").lower()
        lunar_now = get_lunar_context_for_prompt()

        asks_calendar = any(
            kw in lowered
            for kw in ("âm lịch", "dương lịch", "hôm nay", "ngày mấy", "mồng mấy", "can chi", "giờ hoàng đạo")
        )
        asks_ritual = any(
            kw in lowered
            for kw in ("văn khấn", "bài khấn", "mâm cúng", "lễ vật", "sắm lễ", "bàn thờ", "bao sái", "thắp hương", "hóa vàng")
        )

        if asks_calendar and not asks_ritual and not relevant_docs:
            return (
                f"Dạ, {lunar_now}\n\n"
                "Gia chủ có thể sử dụng thêm tính năng **Lịch Âm Dương** của E-Spirit để xem chi tiết "
                "giờ Hoàng Đạo hoặc đổi ngày cụ thể nhé."
            )

        if relevant_docs:
            top_doc = relevant_docs[0]
            reply_parts = [
                f"Nam mô A Di Đà Phật! Trợ lý **E-Spirit** xin gửi đến gia chủ thông tin tham khảo chuẩn mực ({lunar_now}):"
                if asks_calendar
                else "Nam mô A Di Đà Phật! Trợ lý **E-Spirit** xin gửi đến gia chủ thông tin tham khảo chuẩn mực:",
                f"### {top_doc.get('title', 'Hướng dẫn tâm linh')}\n{top_doc.get('content', '')}",
            ]
            if len(relevant_docs) > 1:
                related_titles = ", ".join(
                    doc.get("title", "") for doc in relevant_docs[1:] if doc.get("title")
                )
                if related_titles:
                    reply_parts.append(f"*Chủ đề liên quan:* {related_titles}.")
            return "\n\n".join(reply_parts)

        if asks_calendar:
            return (
                f"Dạ, {lunar_now}\n\n"
                "Gia chủ có thể sử dụng thêm tính năng **Lịch Âm Dương** của E-Spirit để xem chi tiết "
                "giờ Hoàng Đạo hoặc đổi ngày cụ thể nhé."
            )

        return (
            f"Dạ, chào gia chủ! ({lunar_now})\n\n"
            "Hiện kết nối AI chuyên sâu đang tạm gián đoạn, nhưng Trợ lý **E-Spirit** vẫn sẵn sàng "
            "hỗ trợ gia chủ tra cứu trực tiếp các chủ đề về **văn khấn cổ truyền** (Rằm, Mùng 1, Gia tiên, "
            "Thần Tài, Ông Công Ông Táo, Tất niên, Vu Lan), **mâm cúng lễ vật**, **nguyên tắc đặt & bao sái bàn thờ** "
            "và **nghi lễ thắp hương**. Gia chủ đang quan tâm đến chủ đề nào ạ?"
        )

    async def generate_reply(
        self,
        session_id: int,
        user_message: str,
        history: list[ChatMessage] | None = None,
    ) -> str:
        """
        Sinh câu trả lời cho phiên trò chuyện bằng Hybrid RAG + Gemini 3.8 Flash + Lunar Tool Calling.
        Luôn đảm bảo fallback an toàn để không bao giờ gây lỗi 500 cho API.
        """
        retrieved_docs = await asyncio.to_thread(
            self.rag_service.retrieve,
            user_message,
            settings.RAG_TOP_K,
        )
        relevant_docs = self._filter_relevant_docs(retrieved_docs)

        if not self.api_key:
            logger.warning(
                "GEMINI_API_KEY chưa được cấu hình (session_id=%s). Dùng phản hồi dự phòng từ RAGService.",
                session_id,
            )
            return self._generate_fallback_reply(user_message, relevant_docs)

        system_instruction = self._build_system_instruction(relevant_docs)
        steps_input = self._format_history_steps(user_message, history)

        try:
            return await asyncio.to_thread(
                self._call_gemini_sync,
                system_instruction,
                steps_input,
            )
        except Exception as exc:
            logger.warning(
                "Lỗi khi gọi Gemini API (model=%s, session_id=%s): %s. Chuyển sang fallback RAG.",
                self.model,
                session_id,
                exc,
                exc_info=True,
            )
            return self._generate_fallback_reply(user_message, relevant_docs)
