from fastapi import APIRouter, Depends, Query

from app.api.deps import get_dashboard_service, require_admin
from app.models.user import User
from app.schemas.dashboard import DashboardStatsResponse
from app.services.dashboard_service import DashboardService

router = APIRouter()


@router.get(
    "",
    response_model=DashboardStatsResponse,
    summary="Lấy dữ liệu thống kê tổng quan cho Admin Dashboard",
    description=(
        "Cung cấp các chỉ số KPI hệ thống, dữ liệu chuỗi thời gian hoạt động chat, "
        "tỷ lệ phân bổ bài viết tri thức và danh sách câu hỏi mới nhất từ người dùng. "
        "Yêu cầu quyền Admin."
    ),
)
@router.get(
    "/",
    response_model=DashboardStatsResponse,
    include_in_schema=False,
)
async def get_dashboard_statistics(
    days: int = Query(
        default=7,
        ge=7,
        le=90,
        description="Số ngày thống kê hoạt động chat gần nhất (từ 7 đến 90 ngày)",
    ),
    recent_limit: int = Query(
        default=10,
        ge=1,
        le=50,
        description="Số lượng câu hỏi người dùng gần đây cần lấy (từ 1 đến 50)",
    ),
    dashboard_service: DashboardService = Depends(get_dashboard_service),
    admin_user: User = Depends(require_admin),
) -> DashboardStatsResponse:
    """
    Endpoint trả về toàn bộ dữ liệu thống kê cho Admin Dashboard.
    """
    return await dashboard_service.get_dashboard_stats(
        days=days, recent_limit=recent_limit
    )

