from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any, Dict, List

from app.repositories.dashboard_repository import DashboardRepository
from app.schemas.dashboard import (
    ChatActivityPoint,
    DashboardKPI,
    DashboardStatsResponse,
    KnowledgeDistributionItem,
    RecentQuestionItem,
)
from app.services.rag_service import RAGService
from app.utils.lunar_calendar import VN_TIMEZONE, get_today_lunar_info

CATEGORY_NAME_MAP: Dict[str, str] = {
    "van_khan": "Văn khấn",
    "mam_cung": "Mâm cúng",
    "ban_tho": "Phong thủy bàn thờ",
    "nghi_le": "Nghi lễ",
}


class DashboardService:
    """
    Tầng nghiệp vụ (Service) tổng hợp các chỉ số và dữ liệu cho Admin Dashboard.
    """

    def __init__(
        self,
        dashboard_repo: DashboardRepository,
        rag_service: RAGService,
    ):
        self.dashboard_repo = dashboard_repo
        self.rag_service = rag_service

    def _build_upcoming_lunar_note(self, lunar_info: Dict[str, Any]) -> str:
        """
        Tạo chuỗi mô tả ngắn gọn về tình trạng và sự kiện âm lịch sắp tới.
        """
        special = lunar_info.get("special_event")
        reminder = lunar_info.get("spiritual_reminder")
        day = lunar_info.get("lunar_day", 1)
        month = lunar_info.get("lunar_month", 1)
        can_chi = lunar_info.get("can_chi_day", "")

        if special:
            note = f"{special} ({day}/{month} ÂL - {can_chi})"
        elif day == 1:
            note = f"Mùng 1 tháng {month} ÂL ({can_chi}) - Ngày Sóc"
        elif day == 15:
            note = f"Rằm tháng {month} ÂL ({can_chi}) - Ngày Vọng"
        elif day < 15:
            diff = 15 - day
            note = f"Còn {diff} ngày tới Rằm tháng {month} (Hiện tại: {day}/{month} ÂL - {can_chi})"
        else:
            diff = 30 - day
            note = f"Còn khoảng {max(1, diff)} ngày tới Mùng 1 tháng sau (Hiện tại: {day}/{month} ÂL - {can_chi})"

        if reminder:
            note += f". {reminder}"
        return note

    def _get_knowledge_stats(self) -> tuple[int, int, List[KnowledgeDistributionItem]]:
        """
        Thống kê tổng số lượng bài viết, số danh mục và tỷ lệ phân bổ từ RAGService.
        """
        documents = getattr(self.rag_service, "documents", [])
        total_articles = len(documents)

        category_counts: Dict[str, int] = defaultdict(int)
        for doc in documents:
            cat = doc.get("category", "other")
            category_counts[cat] += 1

        total_categories = len(category_counts)

        items: List[KnowledgeDistributionItem] = []
        for cat_key, count in category_counts.items():
            name = CATEGORY_NAME_MAP.get(cat_key, cat_key.replace("_", " ").title())
            percent = (
                round((count / total_articles) * 100.0, 1)
                if total_articles > 0
                else 0.0
            )
            items.append(
                KnowledgeDistributionItem(
                    category_key=cat_key,
                    name=name,
                    count=count,
                    value=percent,
                )
            )

        # Sắp xếp danh mục theo số lượng giảm dần
        items.sort(key=lambda x: x.count, reverse=True)
        return total_articles, total_categories, items

    async def get_dashboard_stats(
        self, days: int = 7, recent_limit: int = 10
    ) -> DashboardStatsResponse:
        """
        Thu thập và tổng hợp dữ liệu thống kê hoàn chỉnh cho Admin Dashboard.
        """
        now_vn = datetime.now(VN_TIMEZONE)
        today = now_vn.date()

        # Xác định mốc đầu ngày hôm nay và mốc 24h trước
        start_of_today = datetime(now_vn.year, now_vn.month, now_vn.day, 0, 0, 0)
        since_24h = (now_vn - timedelta(hours=24)).replace(tzinfo=None)

        # Mốc đầu tháng này
        start_of_this_month = datetime(now_vn.year, now_vn.month, 1, 0, 0, 0)

        # Mốc đầu tháng trước
        if now_vn.month == 1:
            start_of_last_month = datetime(now_vn.year - 1, 12, 1, 0, 0, 0)
        else:
            start_of_last_month = datetime(now_vn.year, now_vn.month - 1, 1, 0, 0, 0)

        # 1. Truy vấn Repository
        user_stats = await self.dashboard_repo.get_user_stats(
            start_this_month=start_of_this_month,
            start_last_month=start_of_last_month,
        )
        query_stats = await self.dashboard_repo.get_query_and_session_stats(
            start_of_today=start_of_today,
            since_24h=since_24h,
        )
        chat_activity_raw = await self.dashboard_repo.get_chat_activity(
            days=days,
            today=today,
        )
        recent_questions_raw = await self.dashboard_repo.get_recent_questions(
            limit=recent_limit,
        )

        # 2. Tính toán tăng trưởng User (%)
        new_users_this_month = user_stats["new_users_this_month"]
        new_users_last_month = user_stats["new_users_last_month"]
        if new_users_last_month == 0:
            user_growth_percent = 100.0 if new_users_this_month > 0 else 0.0
        else:
            growth = (
                (new_users_this_month - new_users_last_month)
                / new_users_last_month
            ) * 100.0
            user_growth_percent = round(growth, 1)

        # 3. Thống kê kho tri thức từ RAGService
        total_articles, total_categories, knowledge_distribution = (
            self._get_knowledge_stats()
        )

        # 4. Ghi chú lịch âm hôm nay
        lunar_info = get_today_lunar_info()
        upcoming_lunar_note = self._build_upcoming_lunar_note(lunar_info)

        # 5. Đóng gói kết quả
        kpi = DashboardKPI(
            total_users=user_stats["total_users"],
            new_users_this_month=new_users_this_month,
            user_growth_percent=user_growth_percent,
            total_knowledge_articles=total_articles,
            total_knowledge_categories=total_categories,
            total_user_queries=query_stats["total_user_queries"],
            queries_today=query_stats["queries_today"],
            upcoming_lunar_note=upcoming_lunar_note,
            active_users_24h=query_stats["active_users_24h"],
            total_chat_sessions=query_stats["total_chat_sessions"],
        )

        chat_activity = [
            ChatActivityPoint(
                date=item["date"],
                name=item["name"],
                queries=item["queries"],
                sessions=item["sessions"],
            )
            for item in chat_activity_raw
        ]

        recent_questions = [
            RecentQuestionItem(
                id=q["id"],
                session_id=q["session_id"],
                session_title=q["session_title"],
                question=q["question"],
                assistant_reply=q["assistant_reply"],
                user=q["user"],
                user_email=q["user_email"],
                created_at=q["created_at"],
            )
            for q in recent_questions_raw
        ]

        return DashboardStatsResponse(
            kpi=kpi,
            chat_activity=chat_activity,
            knowledge_distribution=knowledge_distribution,
            recent_questions=recent_questions,
        )

