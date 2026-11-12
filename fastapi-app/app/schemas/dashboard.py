from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class DashboardKPI(BaseModel):
    """Chỉ số KPI chính hiển thị trên Admin Dashboard."""
    total_users: int = Field(description="Tổng số người dùng đăng ký")
    new_users_this_month: int = Field(description="Số người dùng đăng ký mới trong tháng này")
    user_growth_percent: float = Field(description="Tỷ lệ tăng trưởng người dùng so với tháng trước (%)")
    total_knowledge_articles: int = Field(description="Tổng số bài viết/tri thức tâm linh")
    total_knowledge_categories: int = Field(description="Tổng số danh mục tri thức")
    total_user_queries: int = Field(description="Tổng số câu hỏi/truy vấn từ phía người dùng")
    queries_today: int = Field(description="Số câu hỏi được gửi trong ngày hôm nay")
    upcoming_lunar_note: str = Field(description="Ghi chú/lời nhắc sự kiện âm lịch sắp tới")
    active_users_24h: int = Field(description="Số người dùng duy nhất hoạt động trong 24 giờ qua")
    total_chat_sessions: int = Field(description="Tổng số phiên trò chuyện đã tạo")

    model_config = ConfigDict(from_attributes=True)


class ChatActivityPoint(BaseModel):
    """Điểm dữ liệu chuỗi thời gian hoạt động chat theo ngày."""
    date: str = Field(description="Ngày dạng YYYY-MM-DD")
    name: str = Field(description="Tên hiển thị nhãn trục hoành DD/MM")
    queries: int = Field(description="Số câu hỏi từ người dùng trong ngày")
    sessions: int = Field(description="Số phiên chat hoạt động trong ngày")

    model_config = ConfigDict(from_attributes=True)


class KnowledgeDistributionItem(BaseModel):
    """Thống kê phân bổ dữ liệu tri thức theo chuyên mục."""
    category_key: str = Field(description="Mã danh mục (vd: van_khan, mam_cung...)")
    name: str = Field(description="Tên tiếng Việt hiển thị của danh mục")
    count: int = Field(description="Số lượng bài viết trong danh mục")
    value: float = Field(description="Tỷ lệ phần trăm trên tổng kho tri thức (%)")

    model_config = ConfigDict(from_attributes=True)


class RecentQuestionItem(BaseModel):
    """Thông tin chi tiết một câu hỏi gần đây của người dùng."""
    id: int = Field(description="ID tin nhắn câu hỏi")
    session_id: int = Field(description="ID phiên trò chuyện")
    session_title: str = Field(description="Tiêu đề phiên trò chuyện")
    question: str = Field(description="Nội dung câu hỏi người dùng đã gửi")
    assistant_reply: Optional[str] = Field(default=None, description="Câu trả lời phản hồi liền kề từ AI (nếu có)")
    user: str = Field(description="Tên người dùng (username)")
    user_email: str = Field(description="Email người dùng")
    created_at: datetime = Field(description="Thời điểm gửi câu hỏi")

    model_config = ConfigDict(from_attributes=True)


class DashboardStatsResponse(BaseModel):
    """Schema Response tổng hợp toàn bộ dữ liệu Admin Dashboard."""
    kpi: DashboardKPI
    chat_activity: List[ChatActivityPoint]
    knowledge_distribution: List[KnowledgeDistributionItem]
    recent_questions: List[RecentQuestionItem]

    model_config = ConfigDict(from_attributes=True)

