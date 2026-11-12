from datetime import datetime, date, timedelta
from typing import Any, Dict, List, Optional
from collections import defaultdict

# pyrefly: ignore [missing-import]
from sqlalchemy import desc, func, or_, select
# pyrefly: ignore [missing-import]
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chat import ChatMessage, ChatSession
from app.models.user import User
from app.utils.lunar_calendar import VN_TIMEZONE


class DashboardRepository:
    """
    Tầng Data Access chịu trách nhiệm truy vấn dữ liệu thống kê cho Admin Dashboard.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_stats(
        self, start_this_month: datetime, start_last_month: datetime
    ) -> Dict[str, int]:
        """
        Đếm tổng số user, số user mới trong tháng hiện tại và tháng trước.
        """
        # 1. Tổng số users
        total_stmt = select(func.count(User.id))
        total_users = (await self.db.execute(total_stmt)).scalar() or 0

        # 2. Users mới tháng này
        this_month_stmt = select(func.count(User.id)).where(User.created_at >= start_this_month)
        new_users_this_month = (await self.db.execute(this_month_stmt)).scalar() or 0

        # 3. Users mới tháng trước
        last_month_stmt = select(func.count(User.id)).where(
            User.created_at >= start_last_month,
            User.created_at < start_this_month,
        )
        new_users_last_month = (await self.db.execute(last_month_stmt)).scalar() or 0

        return {
            "total_users": total_users,
            "new_users_this_month": new_users_this_month,
            "new_users_last_month": new_users_last_month,
        }

    async def get_query_and_session_stats(
        self, start_of_today: datetime, since_24h: datetime
    ) -> Dict[str, int]:
        """
        Đếm tổng câu hỏi, câu hỏi hôm nay, tổng phiên chat và số user hoạt động 24h qua.
        """
        # 1. Tổng số câu hỏi của người dùng (sender == 'user')
        total_queries_stmt = select(func.count(ChatMessage.id)).where(ChatMessage.sender == "user")
        total_user_queries = (await self.db.execute(total_queries_stmt)).scalar() or 0

        # 2. Số câu hỏi trong ngày hôm nay
        today_queries_stmt = select(func.count(ChatMessage.id)).where(
            ChatMessage.sender == "user",
            ChatMessage.created_at >= start_of_today,
        )
        queries_today = (await self.db.execute(today_queries_stmt)).scalar() or 0

        # 3. Tổng số phiên chat
        total_sessions_stmt = select(func.count(ChatSession.id))
        total_chat_sessions = (await self.db.execute(total_sessions_stmt)).scalar() or 0

        # 4. Số user duy nhất có tin nhắn hoặc phiên cập nhật trong 24h qua
        session_users = select(ChatSession.user_id).where(
            or_(ChatSession.updated_at >= since_24h, ChatSession.created_at >= since_24h)
        )
        message_users = (
            select(ChatSession.user_id)
            .join(ChatMessage, ChatMessage.session_id == ChatSession.id)
            .where(ChatMessage.created_at >= since_24h)
        )
        union_subq = session_users.union(message_users).subquery()
        active_users_stmt = select(func.count()).select_from(union_subq)
        active_users_24h = (await self.db.execute(active_users_stmt)).scalar() or 0

        return {
            "total_user_queries": total_user_queries,
            "queries_today": queries_today,
            "total_chat_sessions": total_chat_sessions,
            "active_users_24h": active_users_24h,
        }

    async def get_chat_activity(self, days: int, today: date) -> List[Dict[str, Any]]:
        """
        Lấy chuỗi thời gian `days` ngày gần nhất (theo múi giờ Asia/Ho_Chi_Minh).
        Đếm số tin nhắn user và số phiên hoạt động theo từng ngày, điền 0 cho ngày trống.
        """
        date_list = [today - timedelta(days=i) for i in range(days - 1, -1, -1)]
        start_date = date_list[0]
        start_datetime = datetime.combine(start_date, datetime.min.time())

        # Khởi tạo map cho đủ `days` ngày liên tiếp
        activity_map: Dict[str, Dict[str, Any]] = {
            d.strftime("%Y-%m-%d"): {
                "date": d.strftime("%Y-%m-%d"),
                "name": d.strftime("%d/%m"),
                "queries": 0,
                "sessions": set(),
            }
            for d in date_list
        }

        # 1. Truy vấn các tin nhắn user từ start_datetime
        msg_stmt = select(ChatMessage.created_at, ChatMessage.session_id).where(
            ChatMessage.sender == "user",
            ChatMessage.created_at >= start_datetime,
        )
        msg_result = await self.db.execute(msg_stmt)
        for created_at, session_id in msg_result.all():
            if not created_at:
                continue
            d = created_at.astimezone(VN_TIMEZONE).date() if created_at.tzinfo else created_at.date()
            key = d.strftime("%Y-%m-%d")
            if key in activity_map:
                activity_map[key]["queries"] += 1
                if session_id:
                    activity_map[key]["sessions"].add(session_id)

        # 2. Truy vấn các phiên có cập nhật/tạo mới trong khoảng thời gian này
        sess_stmt = select(ChatSession.id, ChatSession.created_at, ChatSession.updated_at).where(
            or_(
                ChatSession.created_at >= start_datetime,
                ChatSession.updated_at >= start_datetime,
            )
        )
        sess_result = await self.db.execute(sess_stmt)
        for sess_id, s_created, s_updated in sess_result.all():
            for dt in (s_updated, s_created):
                if dt:
                    d = dt.astimezone(VN_TIMEZONE).date() if dt.tzinfo else dt.date()
                    key = d.strftime("%Y-%m-%d")
                    if key in activity_map:
                        activity_map[key]["sessions"].add(sess_id)

        # 3. Trả về mảng dữ liệu có thứ tự thời gian tăng dần
        return [
            {
                "date": val["date"],
                "name": val["name"],
                "queries": val["queries"],
                "sessions": len(val["sessions"]),
            }
            for val in activity_map.values()
        ]

    async def get_recent_questions(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Lấy `limit` câu hỏi mới nhất từ user JOIN với ChatSession và User,
        kèm câu trả lời liền kề của assistant trong cùng phiên đó (nếu có).
        """
        # 1. Lấy danh sách câu hỏi mới nhất của người dùng
        stmt = (
            select(
                ChatMessage.id,
                ChatMessage.session_id,
                ChatSession.title.label("session_title"),
                ChatMessage.content.label("question"),
                ChatMessage.created_at,
                User.username.label("user"),
                User.email.label("user_email"),
            )
            .join(ChatSession, ChatMessage.session_id == ChatSession.id)
            .join(User, ChatSession.user_id == User.id)
            .where(ChatMessage.sender == "user")
            .order_by(desc(ChatMessage.created_at), desc(ChatMessage.id))
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        rows = result.all()

        if not rows:
            return []

        # 2. Thu thập session_ids và min_id để truy vấn tin nhắn phản hồi liền kề
        session_ids = list({row.session_id for row in rows})
        min_q_id = min(row.id for row in rows)

        asst_stmt = (
            select(
                ChatMessage.id,
                ChatMessage.session_id,
                ChatMessage.sender,
                ChatMessage.content,
            )
            .where(
                ChatMessage.session_id.in_(session_ids),
                ChatMessage.id >= min_q_id,
            )
            .order_by(ChatMessage.session_id, ChatMessage.id.asc())
        )
        asst_result = await self.db.execute(asst_stmt)
        session_messages = asst_result.all()

        # Gom nhóm tin nhắn theo session_id
        messages_by_session: Dict[int, List[Any]] = defaultdict(list)
        for msg in session_messages:
            messages_by_session[msg.session_id].append(msg)

        # 3. Ghép câu trả lời liền kề cho từng câu hỏi
        recent_questions: List[Dict[str, Any]] = []
        for row in rows:
            sess_msgs = messages_by_session.get(row.session_id, [])
            assistant_reply: Optional[str] = None
            for i, m in enumerate(sess_msgs):
                if m.id == row.id:
                    for next_m in sess_msgs[i + 1 :]:
                        if next_m.sender == "assistant":
                            assistant_reply = next_m.content
                            break
                        elif next_m.sender == "user":
                            break
                    break

            recent_questions.append(
                {
                    "id": row.id,
                    "session_id": row.session_id,
                    "session_title": row.session_title,
                    "question": row.question,
                    "assistant_reply": assistant_reply,
                    "user": row.user,
                    "user_email": row.user_email,
                    "created_at": row.created_at,
                }
            )

        return recent_questions

